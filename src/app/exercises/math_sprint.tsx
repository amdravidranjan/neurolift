import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GameContainer } from '../../components/GameContainer';
import { EXERCISE_REGISTRY } from '../../features/engine/Registry';
import { sessionService } from '../../features/engine/SessionService';
import { ContentGenerator } from '../../features/engine/ContentGenerator';

function MathSprintBoard({ isPlaying, difficulty, mode, onScore, score }: any) {
    const [problem, setProblem] = useState<any>(null);

    useEffect(() => {
        if (isPlaying) generate();
    }, [isPlaying, difficulty, mode]);

    const generate = () => {
        setProblem(ContentGenerator.generateMathProblem(difficulty ? difficulty.complexity : 1));
    };

    const handleAnswer = (val: number) => {
        if (val === problem.answer) {
            onScore(10);
        }
        generate();
    };

    if (!problem) return <Text>Loading...</Text>;

    return (
        <View style={styles.board}>
            <Surface style={styles.card} elevation={4}>
                <Text variant="titleMedium" style={{ position: 'absolute', top: 10, right: 10, color: '#aaa' }}>Score: {score}</Text>
                <Text variant="displayLarge">{problem.question}</Text>
                {mode === 'Estimation' && <Text style={{ color: '#666' }}>(Estimate)</Text>}
            </Surface>
            <View style={styles.options}>
                {problem.options.map((opt: number, i: number) => (
                    <TouchableOpacity key={i} style={styles.btn} onPress={() => handleAnswer(opt)}>
                        <Text variant="headlineSmall" style={{ color: 'white' }}>{opt}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

export default function MathSprint() {
    const router = useRouter();
    const [score, setScore] = useState(0);

    return (
        <GameContainer
            config={{ ...EXERCISE_REGISTRY['math_sprint'], params: {} }}
            modes={['Standard', 'Estimation', 'Algebra']}
            onFinish={async () => {
                await sessionService.saveSession({
                    exerciseId: 'math_sprint',
                    rawScore: score,
                    normalizedScore: Math.min(score, 100),
                    metrics: { correct: score / 10 },
                    durationSeconds: 60
                });
                router.back();
            }}
        >
            {({ isPlaying, difficulty, mode }) => (
                <MathSprintBoard
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
    board: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    card: { padding: 40, borderRadius: 20, marginBottom: 40, minWidth: 200, alignItems: 'center' },
    options: { flexDirection: 'row', flexWrap: 'wrap', gap: 20, justifyContent: 'center' },
    btn: { width: '40%', height: 80, backgroundColor: '#4caf50', borderRadius: 10, justifyContent: 'center', alignItems: 'center' }
});
