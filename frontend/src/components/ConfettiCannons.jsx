import React, { useEffect, useRef } from 'react';

/**
 * Высокопроизводительный компонент пушек конфетти, стреляющих с двух сторон экрана (слева и справа).
 */
export default function ConfettiCannons({ fireTrigger = 0 }) {
    const canvasRef = useRef(null);
    const animationFrameRef = useRef(null);
    const particlesRef = useRef([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const handleResize = () => {
            if (!canvas) return;
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        const COLORS = [
            '#ffd700', // Золото
            '#ffae00', // Янтарный
            '#1ca0e5', // Синий
            '#00e5ff', // Неоновый циан
            '#00e676', // Зеленый
            '#ff3864', // Розовый
            '#b388ff', // Фиолетовый
            '#ff7b00', // Оранжевый
            '#ffffff', // Белый
        ];

        const SHAPES = ['rect', 'ribbon', 'circle', 'star'];

        // Генерация залпа пушек
        const spawnCannonSalvo = (salvoPower = 1.0) => {
            const countPerSide = Math.floor(65 * salvoPower);
            const newParticles = [];

            // Левая пушка (выстрел вправо-вверх: угол ~-50°)
            for (let i = 0; i < countPerSide; i++) {
                const angle = (-40 - Math.random() * 32) * (Math.PI / 180); // -40° .. -72°
                const speed = (18 + Math.random() * 16) * salvoPower;
                newParticles.push({
                    x: -10,
                    y: height * 0.78,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    gravity: 0.48 + Math.random() * 0.12,
                    drag: 0.982,
                    color: COLORS[Math.floor(Math.random() * COLORS.length)],
                    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
                    size: 8 + Math.random() * 10,
                    length: 12 + Math.random() * 14,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.22,
                    wobble: Math.random() * Math.PI * 2,
                    wobbleSpeed: 0.08 + Math.random() * 0.12,
                    alpha: 1,
                    decay: 0.003 + Math.random() * 0.004,
                });
            }

            // Правая пушка (выстрел влево-вверх: угол ~-130°)
            for (let i = 0; i < countPerSide; i++) {
                const angle = (-140 + Math.random() * 32) * (Math.PI / 180); // -140° .. -108°
                const speed = (18 + Math.random() * 16) * salvoPower;
                newParticles.push({
                    x: width + 10,
                    y: height * 0.78,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    gravity: 0.48 + Math.random() * 0.12,
                    drag: 0.982,
                    color: COLORS[Math.floor(Math.random() * COLORS.length)],
                    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
                    size: 8 + Math.random() * 10,
                    length: 12 + Math.random() * 14,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.22,
                    wobble: Math.random() * Math.PI * 2,
                    wobbleSpeed: 0.08 + Math.random() * 0.12,
                    alpha: 1,
                    decay: 0.003 + Math.random() * 0.004,
                });
            }

            particlesRef.current.push(...newParticles);
        };

        // Запуск нескольких волн салюта из пушек при изменении fireTrigger
        if (fireTrigger > 0) {
            spawnCannonSalvo(1.2);
            const t1 = setTimeout(() => spawnCannonSalvo(1.0), 300);
            const t2 = setTimeout(() => spawnCannonSalvo(0.9), 700);
            const t3 = setTimeout(() => spawnCannonSalvo(0.7), 1200);

            var clearTimeouts = () => {
                clearTimeout(t1);
                clearTimeout(t2);
                clearTimeout(t3);
            };
        }

        // Анимационный цикл
        const render = () => {
            ctx.clearRect(0, 0, width, height);

            const particles = particlesRef.current;
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];

                p.x += p.vx;
                p.y += p.vy;
                p.vx *= p.drag;
                p.vy = p.vy * p.drag + p.gravity;
                p.rotation += p.rotationSpeed;
                p.wobble += p.wobbleSpeed;
                p.alpha -= p.decay;

                if (p.alpha <= 0 || p.y > height + 50) {
                    particles.splice(i, 1);
                    continue;
                }

                ctx.save();
                ctx.globalAlpha = Math.max(0, p.alpha);
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                const scaleX = Math.cos(p.wobble);
                ctx.scale(scaleX, 1);

                ctx.fillStyle = p.color;

                if (p.shape === 'rect') {
                    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                } else if (p.shape === 'ribbon') {
                    ctx.fillRect(-p.size / 2, -p.length / 2, p.size, p.length);
                } else if (p.shape === 'circle') {
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                    ctx.fill();
                } else if (p.shape === 'star') {
                    ctx.beginPath();
                    const spikes = 5;
                    const outerRadius = p.size;
                    const innerRadius = p.size / 2;
                    let rot = (Math.PI / 2) * 3;
                    let x = 0;
                    let y = 0;
                    const step = Math.PI / spikes;

                    ctx.moveTo(0, -outerRadius);
                    for (let s = 0; s < spikes; s++) {
                        x = Math.cos(rot) * outerRadius;
                        y = Math.sin(rot) * outerRadius;
                        ctx.lineTo(x, y);
                        rot += step;

                        x = Math.cos(rot) * innerRadius;
                        y = Math.sin(rot) * innerRadius;
                        ctx.lineTo(x, y);
                        rot += step;
                    }
                    ctx.lineTo(0, -outerRadius);
                    ctx.closePath();
                    ctx.fill();
                }

                ctx.restore();
            }

            if (particles.length > 0) {
                animationFrameRef.current = requestAnimationFrame(render);
            }
        };

        if (particlesRef.current.length > 0) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = requestAnimationFrame(render);
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            if (clearTimeouts) clearTimeouts();
            cancelAnimationFrame(animationFrameRef.current);
        };
    }, [fireTrigger]);

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
                zIndex: 9999,
            }}
        />
    );
}
