import React, { createContext, useContext, ReactNode } from 'react';

interface GameContextType {
    mode: 'training' | 'assessment';
    onSessionComplete?: (metrics: any) => void;
    overrideSettings?: any;
    overrideDuration?: number;
}

const GameContext = createContext<GameContextType>({ mode: 'training' });

export const useGameContext = () => useContext(GameContext);

export const GameProvider = ({ children, value }: { children: ReactNode, value: GameContextType }) => (
    <GameContext.Provider value={value}>
        {children}
    </GameContext.Provider>
);
