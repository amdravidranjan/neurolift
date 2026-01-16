import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GameContainer } from '../../components/GameContainer';
import { EXERCISE_REGISTRY } from '../../features/engine/Registry';
import { sessionService } from '../../features/engine/SessionService';
import { ContentGenerator } from '../../features/engine/ContentGenerator';

interface PatternBoardProps {
    isPlaying: boolean;
    settings: any;
    score: number;
    onScore: (s: number) => void;
}

function PatternBoard({ isPlaying, settings, score, onScore }: PatternBoardProps) {
    const [problem, setProblem] = useState<any>(null);

    // Settings
    const gridSizeStr = settings.gridSize || '3x3';
    const size = parseInt(gridSizeStr.split('x')[0]) || 3;
    const difficulty = settings.difficulty || 2;
    // We could pass difficulty to generator if we updated it, 
    // for now we'll stick to size which is the main visual change.

    useEffect(() => {
        if (isPlaying) generate();
    }, [isPlaying, size, difficulty]); // Regenerate if settings change

    const generate = () => {
        setProblem(ContentGenerator.generatePattern(size));
    };

    const handleAnswer = (val: number) => {
        if (val === problem.answer) {
            onScore(10);
        }
        generate();
    };

    if (!problem) return <Text>Generating Pattern...</Text>;

    const cellSize = size === 5 ? 40 : size === 4 ? 50 : 60; // Dynamic sizing

    return (
        <View style={styles.board}>
            <Text variant="titleMedium" style={{ position: 'absolute', top: 10, right: 10, color: '#666' }}>Score: {score}</Text>

            <View style={styles.grid}>
                {problem.grid.map((row: number[], r: number) => (
                    <View key={r} style={styles.row}>
                        {row.map((val, c) => (
                            <Surface
                                key={c}
                                style={[
                                    styles.cell,
                                    { width: cellSize, height: cellSize },
                                    val === -1 && styles.missing
                                ]}
                                elevation={2}
                            >
                                <Text style={[styles.cellText, { fontSize: cellSize * 0.4 }]}>
                                    {val === -1 ? '?' : val}
                                </Text>
                            </Surface>
                        ))}
                    </View>
                ))}
            </View>

            <Text style={{ marginVertical: 20 }}>Complete the pattern:</Text>

            <View style={styles.options}>
                {problem.options.map((opt: number, i: number) => (
                    <TouchableOpacity key={i} style={styles.optionBtn} onPress={() => handleAnswer(opt)}>
                        <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>{opt}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

export default function PatternMatrix() {
    const router = useRouter();

    return (
        <GameContainer
            config={{ ...EXERCISE_REGISTRY['pattern_matrix'], params: {} }}
            modes={['Standard', '5x5', 'Multi-Rule']}
            onFinish={async (results) => {
                const finalScore = results?.raw || 0;
                await sessionService.saveSession({
                    exerciseId: 'pattern_matrix',
                    rawScore: finalScore,
                    normalizedScore: Math.min(finalScore * 5, 100),
                    metrics: { correct: finalScore / 10 },
                    durationSeconds: 60
                });
                router.back();
            }}
        >
            {({ isPlaying, customSettings, score, setScore }) => (
                <PatternBoard
                    isPlaying={isPlaying}
                    settings={customSettings}
                    score={score || 0}
                    onScore={(s: number) => setScore((prev: number) => prev + s)}
                />
            )}
        </GameContainer>
    );
}

const styles = StyleSheet.create({
    board: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    grid: { padding: 10, backgroundColor: '#eee', borderRadius: 10 },
    row: { flexDirection: 'row' },
    cell: { width: 60, height: 60, margin: 4, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' },
    missing: { backgroundColor: '#ffe0b2' },
    cellText: { fontSize: 24, fontWeight: 'bold' },
    options: { flexDirection: 'row', gap: 20 },
    optionBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#6200ee', justifyContent: 'center', alignItems: 'center' }
});
