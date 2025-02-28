import React, { useRef, useEffect, useState } from 'react';
import './App.css';

function App() {
    return (
        <div className="App">
            <DotGrid />
            <div className="center-content">
                <h1>Valence</h1>
                <p>Coming soon, contact us at <a href="mailto:hello@valencenetworks.com">hello@valencenetworks.com</a></p>
            </div>
        </div>
    );
}

function DotGrid() {
    const canvasRef = useRef(null);
    const [points, setPoints] = useState([]);
    const [width, setWidth] = useState(window.innerWidth);
    const [height, setHeight] = useState(window.innerHeight);

    // Store mouse position to create a "hover effect"
    const mouseRef = useRef({ x: null, y: null });

    useEffect(() => {
        // Handle window resizing
        const handleResize = () => {
            setWidth(window.innerWidth);
            setHeight(window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        // Handle mouse movement
        const handleMouseMove = (e) => {
            mouseRef.current.x = e.clientX;
            mouseRef.current.y = e.clientY;
        };
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    useEffect(() => {
        // Initialize points
        const spacing = 130; // Increased from 100 to 130
        const newPoints = [];
        for (let y = 0; y <= height + spacing; y += spacing) {
            for (let x = 0; x <= width + spacing; x += spacing) {
                newPoints.push({
                    x: x,
                    y: y,
                    baseX: x,
                    baseY: y,
                    offset: Math.random() * 2 * Math.PI // random wave phase
                });
            }
        }
        setPoints(newPoints);
    }, [width, height]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let requestId;

        canvas.width = width;
        canvas.height = height;

        const animate = (time) => {
            ctx.clearRect(0, 0, width, height);

            // Draw and animate each point
            for (let i = 0; i < points.length; i++) {
                const p = points[i];

                // Create a gentle wave effect
                const wave = Math.sin(time * 0.001 + p.offset) * 5;
                p.x = p.baseX;
                p.y = p.baseY + wave;

                // Slight repulsion from the mouse
                const dx = p.x - mouseRef.current.x;
                const dy = p.y - mouseRef.current.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    const force = (120 - dist) * 0.05;
                    p.x += (dx / dist) * force;
                    p.y += (dy / dist) * force;
                }
            }

            // Draw lines between neighboring points to form a lattice
            // We can exploit the fact that points are in row-major order
            const cols = Math.floor(width / 130) + 2; // Changed from 100 to 130
            for (let i = 0; i < points.length; i++) {
                const p = points[i];
                // Right neighbor
                if ((i + 1) % cols !== 0) {
                    const pRight = points[i + 1];
                    drawLine(ctx, p.x, p.y, pRight.x, pRight.y);
                }
                // Down neighbor
                if (i + cols < points.length) {
                    const pDown = points[i + cols];
                    drawLine(ctx, p.x, p.y, pDown.x, pDown.y);
                }
            }

            // Draw dots
            for (let i = 0; i < points.length; i++) {
                const p = points[i];
                drawDot(ctx, p.x, p.y);
            }

            requestId = requestAnimationFrame(animate);
        };

        requestId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(requestId);
        };
    }, [points, width, height]);

    return <canvas ref={canvasRef} className="dot-canvas"></canvas>;
}

// Helper: draw a single dot
function drawDot(ctx, x, y) {
    ctx.beginPath();
    ctx.fillStyle = '#000';
    ctx.arc(x, y, 3, 0, Math.PI * 2); // Changed radius from 2 to 3
    ctx.fill();
}

// Helper: draw connecting line
function drawLine(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(128,128,128,0.2)';
    ctx.lineWidth = 1;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

export default App; 