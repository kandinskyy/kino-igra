import React, { useEffect, useRef } from 'react';

const RainBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const handleResize = () => {
            if (!canvas) return;
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        // Падающие струи дождя на фоне
        const streaksCount = Math.floor(width / 18);
        const streaks = [];
        for (let i = 0; i < streaksCount; i++) {
            streaks.push({
                x: Math.random() * width,
                y: Math.random() * height,
                length: 15 + Math.random() * 25,
                speed: 12 + Math.random() * 10,
                opacity: 0.15 + Math.random() * 0.25,
                width: 0.8 + Math.random() * 0.8
            });
        }

        // Капли на стекле
        const dropsCount = Math.floor(width / 22);
        const glassDrops = [];
        for (let i = 0; i < dropsCount; i++) {
            glassDrops.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: 1.2 + Math.random() * 2.8,
                speedY: Math.random() > 0.6 ? 0.3 + Math.random() * 0.8 : 0, // некоторые стекают
                opacity: 0.3 + Math.random() * 0.45,
                trail: []
            });
        }

        const render = () => {
            ctx.clearRect(0, 0, width, height);

            // 1. Рисуем падающие косые струи дождя
            ctx.strokeStyle = 'rgba(28, 160, 229, 0.4)';
            for (let i = 0; i < streaks.length; i++) {
                const s = streaks[i];
                ctx.beginPath();
                ctx.lineWidth = s.width;
                ctx.strokeStyle = `rgba(28, 160, 229, ${s.opacity})`;
                ctx.moveTo(s.x, s.y);
                ctx.lineTo(s.x - s.length * 0.15, s.y + s.length);
                ctx.stroke();

                s.y += s.speed;
                s.x -= s.speed * 0.15;

                if (s.y > height) {
                    s.y = -s.length;
                    s.x = Math.random() * (width + 100);
                }
            }

            // 2. Рисуем капли на окне со свечением
            for (let i = 0; i < glassDrops.length; i++) {
                const d = glassDrops[i];

                // Стеклянная капля с бликом
                ctx.beginPath();
                ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(28, 160, 229, ${d.opacity})`;
                ctx.shadowColor = '#1ca0e5';
                ctx.shadowBlur = 6;
                ctx.fill();
                ctx.shadowBlur = 0; // сброс тени

                // Маленький белый блик
                ctx.beginPath();
                ctx.arc(d.x - d.radius * 0.3, d.y - d.radius * 0.3, d.radius * 0.35, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.fill();

                if (d.speedY > 0) {
                    d.y += d.speedY;
                    if (d.y > height + 10) {
                        d.y = -10;
                        d.x = Math.random() * width;
                        d.speedY = Math.random() > 0.6 ? 0.3 + Math.random() * 0.8 : 0;
                    }
                }
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
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                pointerEvents: 'none',
                zIndex: 0
            }}
        />
    );
};

export default RainBackground;
