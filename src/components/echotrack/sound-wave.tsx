'use client';

import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

type SoundWaveProps = {
    analyser: AnalyserNode;
    barCount?: number;
};

export const SoundWave: React.FC<SoundWaveProps> = ({ analyser, barCount = 32 }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;

        let animationFrameId: number;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const render = () => {
            animationFrameId = requestAnimationFrame(render);
            
            const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
            analyser.getByteFrequencyData(dataArray);

            const { width, height } = canvas;
            context.clearRect(0, 0, width, height);
            
            const barWidth = (width / barCount) * 1.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < barCount; i++) {
                barHeight = Math.pow(dataArray[i], 2) / 400;

                const [h, s, l] = primaryColor.split(' ').map(parseFloat);

                context.fillStyle = `hsl(${h}, ${s}%, ${l}%)`;
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
