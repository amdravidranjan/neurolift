import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GameContainer } from '../../components/GameContainer';
import { EXERCISE_REGISTRY } from '../../features/engine/Registry';
import { sessionService } from '../../features/engine/SessionService';
import { ContentGenerator } from '../../features/engine/ContentGenerator';

interface JugglerBoardProps {
    isPlaying: boolean;
    settings: any;
    onScore: (s: number) => void;
}

function JugglerBoard({ isPlaying, settings, onScore }: JugglerBoardProps) {
    const [taskA, setTaskA] = useState<any>(null); // Color/Shape
    const [taskB, setTaskB] = useState<any>(null); // Math
    const [displayedRule, setDisplayedRule] = useState<'A' | 'B'>('A');
    const [actualRule, setActualRule] = useState<'A' | 'B'>('A');
    const [liarActive, setLiarActive] = useState(false);

    const cueTime = settings.cueTime || 2000;
    const ambiguityChance = (settings.ambiguity || 0) / 100;
    const mode = settings.rules === 'Color/Shape/Math' ? 'Dual-Task' : 'Standard';

    useEffect(() => {
        if (isPlaying) nextRound();
    }, [isPlaying]);

    const nextRound = () => {
        // Generate Content
        const colors = ['red', 'blue'];
        const shapes = ['circle', 'square'];
        const tA = {
            color: colors[Math.floor(Math.random() * 2)],
            shape: shapes[Math.floor(Math.random() * 2)]
        };
        setTaskA(tA);

        if (mode === 'Dual-Task') {
            setTaskB(ContentGenerator.generateMathProblem(1));
        }

        // Rule Logic
        const nextRule = Math.random() > 0.5 ? 'A' : 'B';
        setActualRule(nextRule);

        // Liar's Cue Logic (Ambiguity)
        if (Math.random() < ambiguityChance) {
            setLiarActive(true);
            // Show WRONG rule initially
            setDisplayedRule(nextRule === 'A' ? 'B' : 'A');
            // Correct it after delay (e.g. 500ms) - requiring inhibition
            setTimeout(() => {
                setDisplayedRule(nextRule);
                setLiarActive(false);
            }, 600);
        } else {
            setLiarActive(false);
            setDisplayedRule(nextRule);
        }
    };

    const handleAnswer = (val: string) => {
        let correct = false;

        if (mode === 'Standard') {
            // Rule A = Color, Rule B = Shape
            if (actualRule === 'A' && val === taskA.color) correct = true;
            else if (actualRule === 'B' && val === taskA.shape) correct = true;
        } else {
            // Dual Task
            if (actualRule === 'A') {
                if (val === taskA.color) correct = true;
            } else {
                if (String(val) === String(taskB.answer)) correct = true;
            }
        }

        if (correct) onScore(10);
        else onScore(-5);

        nextRound();
    };

    if (!taskA) return <Text>Juggling...</Text>;

    const getRuleLabel = (r: 'A' | 'B') => {
        if (mode === 'Standard') return r === 'A' ? "MATCH COLOR" : "MATCH SHAPE";
        return r === 'A' ? "MATCH COLOR" : "SOLVE MATH";
    };

    return (
        <View style={styles.board}>
            <View style={[styles.ruleBox, liarActive && { borderColor: 'red' }]}>
                <Text variant="headlineMedium" style={{ color: liarActive ? 'red' : '#6200ee', fontWeight: 'bold' }}>
                    {getRuleLabel(displayedRule)}
                </Text>
            </View>

            <View style={styles.workspace}>
                <Surface style={[styles.stimulus, { backgroundColor: taskA.color === 'red' ? '#ffcdd2' : '#bbdefb' }]} elevation={4}>
                    <View style={[
                        styles.shape,
                        {
                            backgroundColor: taskA.color,
                            borderRadius: taskA.shape === 'circle' ? 50 : 0
                        }
                    ]} />
                </Surface>

                {mode === 'Dual-Task' && taskB && (
                    <Surface style={styles.mathCard} elevation={4}>
                        <Text variant="displaySmall">{taskB.question}</Text>
                    </Surface>
                )}
            </View>

            <View style={styles.controls}>
                {mode === 'Standard' ? (
                    <>
                        <Button mode="outlined" onPress={() => handleAnswer('red')}>Red</Button>
                        <Button mode="outlined" onPress={() => handleAnswer('blue')}>Blue</Button>
                        <Button mode="outlined" onPress={() => handleAnswer('circle')}>Circle</Button>
                        <Button mode="outlined" onPress={() => handleAnswer('square')}>Square</Button>
                    </>
                ) : (
                    // In Dual Task, show limited options to avoid clutter
                    displayedRule === 'A' ? ( // Use displayed to trick user if Liar is active
                        <>
                            <Button mode="contained" onPress={() => handleAnswer('red')}>Red</Button>
                            <Button mode="contained" onPress={() => handleAnswer('blue')}>Blue</Button>
                        </>
                    ) : (
                        taskB && taskB.options ? taskB.options.map((opt: number) => (
                            <Button key={opt} mode="contained" onPress={() => handleAnswer(String(opt))}>{opt}</Button>
                        )) : null
                    )
                )}
            </View>
        </View>
    );
}

export default function TaskJuggler() {
    const router = useRouter();
    const [score, setScore] = useState(0);

    return (
        <GameContainer
            config={{ ...EXERCISE_REGISTRY['task_juggler'], params: {} }}
            modes={['Standard', 'Dual-Task']}
            onFinish={async () => {
                await sessionService.saveSession({
                    exerciseId: 'task_juggler',
                    rawScore: score,
                    normalizedScore: Math.min(score * 2, 100),
                    metrics: { correct: score / 10 },
                    durationSeconds: 60
                });
                router.back();
            }}
        >
            {({ isPlaying, customSettings }) => (
                <JugglerBoard
                    isPlaying={isPlaying}
                    settings={customSettings}
                    onScore={(s: number) => setScore(prev => prev + s)}
                />
            )}
        </GameContainer>
    );
}

const styles = StyleSheet.create({
    board: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    ruleBox: { marginBottom: 30, padding: 10, borderWidth: 2, borderColor: '#6200ee', borderRadius: 10 },
    workspace: { flexDirection: 'row', gap: 20, marginBottom: 40, alignItems: 'center' },
    stimulus: { width: 120, height: 120, justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
    shape: { width: 80, height: 80 },
    mathCard: { width: 120, height: 120, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', borderRadius: 10 },
    controls: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', width: '80%' }
});
