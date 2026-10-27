import React, { useRef, useEffect } from 'react';

interface AsciiSwellDotsProps {
  className?: string;
  width?: number;
  height?: number;
}

export const AsciiSwellDots: React.FC<AsciiSwellDotsProps> = ({
  className = '',
  width = 540,
  height = 140,
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

    const spacing = 18;
    const cols = Math.floor(width / spacing);
    const rows = Math.floor(height / spacing);

    // Density characters for swell
    const CHARS = ['·', ':', '+', '•', '¤', '#'];

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      ctx.font = '12px "Geist Mono", "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * spacing + spacing / 2;
          const y = r * spacing + spacing / 2;

          const dx = x - mouseX;
          const dy = y - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 80;

          // Ambient idle breathing wave
          const ambient = Math.sin(frame * 0.04 + c * 0.3 + r * 0.2);

          let char = '·';
          let fill = '#d4d4d8';
          let scale = 1;

          if (dist < maxDist) {
            const factor = 1 - dist / maxDist; // 0 to 1
            const charIndex = Math.min(
              CHARS.length - 1,
              Math.floor(factor * (CHARS.length - 1)) + 1
            );
            char = CHARS[charIndex];
            scale = 1 + factor * 0.8;

            if (factor > 0.6) {
              fill = '#FF0055';
            } else if (factor > 0.3) {
              fill = '#ff4d79';
            } else {
              fill = '#949494';
            }
          } else if (ambient > 0.7) {
            fill = '#b5b5b5';
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
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [width, height]);

  return (
    <div
      className={`relative rounded-xl border border-[#e5e7eb] bg-white p-3 shadow-xs select-none ${className}`}
    >
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#f0f0f0] text-[10px] font-mono-num text-[#727272]">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF0055] animate-ping" />
          <span className="font-semibold uppercase tracking-wider text-[#262626]">
            ASCII SWELL MATRIX // 4.32.8
          </span>
        </div>
        <span className="text-[#FF0055] font-semibold">MOVE CURSOR TO SWELL</span>
      </div>

      <div className="flex justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="cursor-crosshair block"
        />
      </div>

      <div className="flex items-center justify-between pt-2 mt-2 border-t border-[#f0f0f0] text-[10px] font-mono-num text-[#949494]">
        <span>Zero canvas flicker • Sub-16ms GPU render</span>
        <span>LATENCY: 0.8MS</span>
      </div>
    </div>
  );
};