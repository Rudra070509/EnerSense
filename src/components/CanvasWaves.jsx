import React, { useEffect, useRef } from 'react';

export default function CanvasWaves() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = canvas.parentElement.offsetWidth);
    let height = (canvas.height = canvas.parentElement.offsetHeight);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    let step = 0;

    const render = () => {
      step += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Deep dark gradient background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#0c0a1b');
      bgGrad.addColorStop(0.5, '#140f2d');
      bgGrad.addColorStop(1, '#090714');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw multiple wireframe wave lines
      const numLines = 16;
      for (let i = 0; i < numLines; i++) {
        ctx.beginPath();
        const progress = i / numLines;
        const yOffset = height * 0.45 + i * 14;

        // Color interpolation between electric blue and glowing purple
        const alpha = Math.sin(progress * Math.PI) * 0.75 + 0.15;
        ctx.strokeStyle = i % 2 === 0 
          ? `rgba(139, 92, 246, ${alpha})` 
          : `rgba(59, 130, 246, ${alpha})`;
        ctx.lineWidth = i === Math.floor(numLines / 2) ? 2 : 1;

        for (let x = 0; x <= width; x += 12) {
          const sin1 = Math.sin(x * 0.005 + step + i * 0.2) * 45;
          const sin2 = Math.sin(x * 0.012 - step * 0.8) * 25;
          const cos1 = Math.cos(x * 0.003 + step * 0.5) * 35;

          const y = yOffset + sin1 + sin2 + cos1 * (1 - progress);

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%',
        objectFit: 'cover'
      }} 
    />
  );
}
