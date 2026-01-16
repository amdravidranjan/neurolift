import React from 'react';
import { View, Text } from 'react-native';

// Import all exercises (Statically, as required by RN generally)
import NBackMemory from '../app/exercises/n_back_memory';
import ImpulseControl from '../app/exercises/impulse_control';
import PatternMatrix from '../app/exercises/pattern_matrix';
import DigitSpan from '../app/exercises/digit_span';
import MentalWorkbench from '../app/exercises/mental_workbench';
// Add others as needed for assessment battery

interface GameRunnerProps {
    exerciseId: string;
    // We pass settings via the specific components props if they accept them, 
    // or we rely on GameContainer reading `GameContext` overrides.
    // Since GameContainer now reads `GameContext.overrideSettings`, we just need to render the component.
}

export function GameRunner({ exerciseId }: GameRunnerProps) {
    switch (exerciseId) {
        case 'n_back_memory': return <NBackMemory />;
        case 'impulse_control': return <ImpulseControl />;
        case 'pattern_matrix': return <PatternMatrix />;
        case 'digit_span': return <DigitSpan />;
        case 'mental_workbench': return <MentalWorkbench />;
        default:
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text>Unknown Exercise: {exerciseId}</Text>
                </View>
            );
    }
}
