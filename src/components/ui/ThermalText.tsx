import React, { useState, useEffect } from 'react';

interface ThermalTextProps {
  text: string;
  durationMs?: number;
  className?: string;
  enabled?: boolean;
}

const THERMAL_CHARS = ['#', '%', '*', '+', '-', '=', ':', '·', 'x', '/'];

export const ThermalText: React.FC<ThermalTextProps> = ({
  text,
  durationMs = 220,
  className = '',
  enabled = true,
}) => {
  const [displayText, setDisplayText] = useState(enabled ? '' : text);

  useEffect(() => {
    if (!enabled) {
      setDisplayText(text);
      return;
    }

    const startTime = performance.now();
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / durationMs);

      // Number of solved characters based on progress
      const solvedCount = Math.floor(progress * text.length);

      let scrambled = '';
      for (let i = 0; i < text.length; i++) {
        if (i < solvedCount) {
          scrambled += text[i];
        } else if (text[i] === ' ') {
          scrambled += ' ';
        } else {
          // Monospace thermal glyph
          const charIndex = Math.floor(Math.random() * THERMAL_CHARS.length);
          scrambled += THERMAL_CHARS[charIndex];
        }
      }

      setDisplayText(scrambled);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setDisplayText(text);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [text, durationMs, enabled]);

  return <span className={className}>{displayText}</span>;
};
