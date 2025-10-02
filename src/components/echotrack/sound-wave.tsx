'use client';

import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

type SoundWaveProps = {
    analyser: AnalyserNode;
    barCount?: number;
};

// Helper function to convert hex to HSL
const hexToHsl = (hex: string): [number, number, number] | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return null;

    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h * 360, s * 100, l * 100];
};

export const SoundWave: React.FC<SoundWaveProps> = ({ analyser, barCount = 32 }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Use the station-color-primary from the parent Card's style
        const cardElement = canvas.closest('.station-card-wrapper');
        const stationColorHex = cardElement ? getComputedStyle(cardElement).getPropertyValue('--station-color-primary-hex') : '#ffffff';
        const stationColorHsl = hexToHsl(stationColorHex.trim());

        const context = canvas.getContext('2d');
        if (!context) return;

        let animationFrameId: number;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const render = () => {
            animationFrameId = requestAnimationFrame(render);
            
            analyser.getByteFrequencyData(dataArray);

            const { width, height } = canvas;
            context.clearRect(0, 0, width, height);
            
            const barWidth = (width / barCount) * 1.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < barCount; i++) {
                barHeight = Math.pow(dataArray[i], 2) / 400;

                if (stationColorHsl) {
                  const [h, s, l] = stationColorHsl;
                  context.fillStyle = `hsl(${h}, ${s}%, ${l}%)`;
                } else {
                  // Fallback color
                  const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
                  const [h, s, l] = primaryColor.split(' ').map(parseFloat);
                  context.fillStyle = `hsl(${h}, ${s}%, ${l}%)`;
                }

                context.fillRect(x, height - barHeight / 2, barWidth, barHeight);

                x += barWidth + 5; 
            }
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [analyser, barCount]);

    return (
        <div className="absolute bottom-0 left-0 w-full h-16 overflow-hidden pointer-events-none">
            <canvas ref={canvasRef} width="1000" height="100" className="w-full h-full opacity-60" />
        </div>
    );
};
