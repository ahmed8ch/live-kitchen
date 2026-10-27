import React, { useRef, useEffect } from 'react';

interface AsciiBackgroundProps {
  className?: string;
  theme?: 'crimson' | 'light';
}

export const AsciiBackground: React.FC<AsciiBackgroundProps> = ({
  className = '',
  theme = 'crimson',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let mouseX = -1000;
    let mouseY = -1000;
    let frame = 0;

    const spacing = 22;
    const CHARS = ['·', ':', '+', '•', '¤', '#'];

    const handleResize = () => {
      if (!canvas.parentElement) return;
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const render = () => {
      frame++;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const cols = Math.ceil(w / spacing);
      const rows = Math.ceil(h / spacing);

      ctx.font = '13px "Geist Mono", "JetBrains Mono", ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * spacing + spacing / 2;
          const y = r * spacing + spacing / 2;

          const dx = x - mouseX;
          const dy = y - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 130;

          // Ambient subtle wave
          const ambient = Math.sin(frame * 0.03 + c * 0.25 + r * 0.18);

          let char = '·';
          let fill = theme === 'crimson' ? 'rgba(255, 255, 255, 0.18)' : '#e5e7eb';
          let scale = 1;

          if (dist < maxDist) {
            const factor = 1 - dist / maxDist;
            const charIndex = Math.min(
              CHARS.length - 1,
              Math.floor(factor * (CHARS.length - 1)) + 1
            );
            char = CHARS[charIndex];
            scale = 1 + factor * 1.1;

            if (theme === 'crimson') {
              if (factor > 0.6) {
                fill = '#ffffff';
              } else if (factor > 0.3) {
                fill = 'rgba(255, 255, 255, 0.75)';
              } else {
                fill = 'rgba(255, 255, 255, 0.4)';
              }
            } else {
              if (factor > 0.6) {
                fill = '#FF0055';
              } else if (factor > 0.3) {
                fill = 'rgba(255, 0, 85, 0.6)';
              } else {
                fill = '#949494';
              }
            }
          } else if (ambient > 0.7) {
            fill = theme === 'crimson' ? 'rgba(255, 255, 255, 0.28)' : '#d4d4d8';
          }

          ctx.save();
          ctx.translate(x, y);
          ctx.scale(scale, scale);
          ctx.fillStyle = fill;
          ctx.fillText(char, 0, 0);
          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
};