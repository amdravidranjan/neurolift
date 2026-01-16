import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GameContainer } from '../../components/GameContainer';
import { EXERCISE_REGISTRY } from '../../features/engine/Registry';
import { sessionService } from '../../features/engine/SessionService';

function ShapeBoard({ isPlaying, difficulty, mode, onScore, score }: any) {
    const [grid, setGrid] = useState<boolean[]>(Array(25).fill(false));
    const [targetGrid, setTargetGrid] = useState<boolean[]>([]);
    const [phase, setPhase] = useState<'MEMORIZE' | 'BUILD' | 'RESULT'>('MEMORIZE');

    useEffect(() => {
        if (isPlaying && phase === 'MEMORIZE' && targetGrid.length === 0) setup();
    }, [isPlaying, difficulty, mode]);

    const setup = () => {
        if (mode === 'Replication') {
            const newTarget = Array(25).fill(false).map(() => Math.random() > 0.6); // Random pattern
            setTargetGrid(newTarget);
            setGrid(Array(25).fill(false));
            setPhase('MEMORIZE');

            setTimeout(() => {
                setPhase('BUILD');
            }, 3000 - (difficulty * 500)); // Less time to memorize on hard
        } else {
            // Free Draw
            setTargetGrid([]);
            setPhase('BUILD');
        }
    };

    const toggle = (i: number) => {
        if (phase !== 'BUILD') return;
        const n = [...grid];
        n[i] = !n[i];
        setGrid(n);
    };

    const check = () => {
        if (mode === 'Replication') {
            let correct = 0;
            let total = 25;
            for (let i = 0; i < 25; i++) {
                if (grid[i] === targetGrid[i]) correct++;
            }
            if (correct === 25) onScore(10);
            else onScore(Math.max(0, correct - 15)); // Partial credit

            setTargetGrid([]); // Reset
            setPhase('MEMORIZE');
        } else {
            // Free Draw Submit
            onScore(5);
        }
    };

    if (!isPlaying) return <View />;

    if (phase === 'MEMORIZE' && mode === 'Replication') {
        return (
            <View style={styles.board}>
                <Text variant="headlineMedium">Memorize This Pattern!</Text>
                <View style={styles.grid}>
                    {targetGrid.map((active, i) => (
                        <View key={i} style={[styles.cell, active && styles.activeStatic]} />
                    ))}
                </View>
            </View>
        );
    }

    return (
        <View style={styles.board}>
            <View style={{ position: 'absolute', top: 20, right: 20 }}>
                <Text variant="titleMedium">Score: {score}</Text>
            </View>
            <Text variant="headlineMedium" style={{ marginBottom: 20 }}>
                {mode === 'Replication' ? "Recreate Pattern" : "Draw Anything"}
            </Text>

            <View style={styles.grid}>
                {grid.map((active, i) => (
                    <TouchableOpacity
                        key={i}
                        style={[styles.cell, active && styles.active]}
                        onPress={() => toggle(i)}
                    />
                ))}
            </View>

            <Button mode="contained" onPress={check} style={{ marginTop: 30 }}>
                Submit
            </Button>
        </View>
    );
}

export default function ShapeCrafter() {
    const router = useRouter();
    const [score, setScore] = useState(0);

    return (
        <GameContainer
            config={{ ...EXERCISE_REGISTRY['shape_crafter'], params: {} }}
            modes={['Replication', 'Free Draw']}
            onFinish={async () => {
                await sessionService.saveSession({
                    exerciseId: 'shape_crafter',
                    rawScore: score,
                    normalizedScore: Math.min(score * 5, 100),
                    metrics: { score },
                    durationSeconds: 60
                });
                router.back();
            }}
        >
            {({ isPlaying, difficulty, mode }) => (
                <ShapeBoard
                    isPlaying={isPlaying}
                    difficulty={difficulty}
                    mode={mode}
                    score={score}
                    onScore={(s: number) => setScore(prev => prev + s)}
                />
            )}
        </GameContainer>
    );
}

const styles = StyleSheet.create({
    board: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', width: 250, borderWidth: 1, borderColor: '#ccc' },
    cell: { width: 50, height: 50, borderWidth: 1, borderColor: '#eee' },
    active: { backgroundColor: '#6200ee' },
    activeStatic: { backgroundColor: '#03dac6' }
});
