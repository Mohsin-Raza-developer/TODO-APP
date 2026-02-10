"use client";

import { useEffect, useState } from "react";

/**
 * Animated Gradient Text with Typewriter Effect
 * Only handles the animated "One Task at a Time" part.
 */
export function AnimatedHeroText() {
    const [text, setText] = useState("");
    const fullText = "One Task at a Time";
    const [isTyping, setIsTyping] = useState(true);

    useEffect(() => {
        if (isTyping) {
            if (text.length < fullText.length) {
                const timeout = setTimeout(() => {
                    setText(fullText.slice(0, text.length + 1));
                }, 100); // Typing speed
                return () => clearTimeout(timeout);
            } else {
                setIsTyping(false);
            }
        }
    }, [text, isTyping]);

    return (
        <span className="text-gradient animate-gradient">
            {text}
            <span className="animate-pulse text-[color:var(--accent)]">|</span>
        </span>
    );
}
