import React from 'react';
import { Level } from '../types';

export const levelMap: Record<Level, number> = { 
    [Level.Beginner]: 1, [Level.Novice]: 2, [Level.Intermediate]: 3, 
    [Level.Advanced]: 4, [Level.Expert]: 5, [Level.Pro]: 6 
};

const LevelIndicator: React.FC<{ level: Level; className?: string }> = ({ level, className='' }) => {
    const levelValue = levelMap[level] || 0;
    return (
        <div className={`flex items-center gap-1 ${className}`}>
            {Array.from({ length: 6 }).map((_, i) => (
                <div
                    key={i}
                    className={`h-2 w-2 rounded-full ${i < levelValue ? 'bg-cyan-400' : 'bg-gray-600'}`}
                ></div>
            ))}
        </div>
    );
};

export default LevelIndicator;
