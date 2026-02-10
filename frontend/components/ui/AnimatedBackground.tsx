"use client";

import { useEffect, useState } from "react";

/**
 * Floating Bubbles/Particles Background Animation
 * 
 * Creates a dynamic background with floating circles that move up and fade.
 * Uses pure CSS/JS for performance.
 */
export function AnimatedBackground() {
    const [bubbles, setBubbles] = useState<Array<{
        id: number;
        size: number;
        left: number;
        animationDuration: number;
        delay: number;
        color: string;
    }>>([]);

    useEffect(() => {
        // Generate random bubbles on client-side only
        const colors = [
            "bg-sky-400",
            "bg-teal-400",
            "bg-emerald-400",
            "bg-amber-300",
        ];

        const newBubbles = Array.from({ length: 20 }).map((_, i) => ({
            id: i,
            size: Math.random() * 60 + 20, // 20px - 80px
            left: Math.random() * 100, // 0% - 100%
            animationDuration: Math.random() * 15 + 10, // 10s - 25s
            delay: Math.random() * 5,
            color: colors[Math.floor(Math.random() * colors.length)],
        }));

        setBubbles(newBubbles);
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {bubbles.map((bubble) => (
                <div
                    key={bubble.id}
                    className={`absolute rounded-full opacity-10 dark:opacity-20 blur-xl ${bubble.color} animate-float-up`}
                    style={{
                        width: `${bubble.size}px`,
                        height: `${bubble.size}px`,
                        left: `${bubble.left}%`,
                        bottom: "-100px",
                        animationDuration: `${bubble.animationDuration}s`,
                        animationDelay: `${bubble.delay}s`,
                    }}
                />
            ))}
        </div>
    );
}
