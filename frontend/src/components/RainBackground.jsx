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

        // Падающие струи дождя на фоне (только плавный вертикально-косой дождь, без круглых пятен)
        const streaksCount = Math.floor(width / 14);
        const streaks = [];
        for (let i = 0; i < streaksCount; i++) {
            streaks.push({
                x: Math.random() * (width + 200),
                y: Math.random() * height,
                length: 18 + Math.random() * 32,
                speed: 14 + Math.random() * 12,
                opacity: 0.12 + Math.random() * 0.22,
                width: 0.7 + Math.random() * 0.8
            });
        }

        const render = () => {
            ctx.clearRect(0, 0, width, height);

            // Рисуем струи дождя
            for (let i = 0; i < streaks.length; i++) {
                const s = streaks[i];
                ctx.beginPath();
                ctx.lineWidth = s.width;
                ctx.strokeStyle = `rgba(28, 160, 229, ${s.opacity})`;
                ctx.moveTo(s.x, s.y);
                ctx.lineTo(s.x - s.length * 0.12, s.y + s.length);
                ctx.stroke();

                s.y += s.speed;
                s.x -= s.speed * 0.12;

                if (s.y > height) {
                    s.y = -s.length;
                    s.x = Math.random() * (width + 200);
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
                zIndex: 1
            }}
        />
    );
};

export default RainBackground;
