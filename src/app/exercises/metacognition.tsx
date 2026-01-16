import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Surface, ProgressBar, TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GameContainer } from '../../components/GameContainer';
import { EXERCISE_REGISTRY } from '../../features/engine/Registry';
import { sessionService } from '../../features/engine/SessionService';

function MetacognitionBoard({ isPlaying, difficulty, mode, onScore }: any) {
    const [phase, setPhase] = useState<'PREDICT' | 'TASK' | 'REFLECT'>('PREDICT');
    const [prediction, setPrediction] = useState('');
    const [actual, setActual] = useState(0);

    // Task State (Simple Digit Span for the task)
    const [digits, setDigits] = useState<number[]>([]);
    const [input, setInput] = useState('');
    const [showDigits, setShowDigits] = useState(false);

    useEffect(() => {
        if (isPlaying && phase === 'PREDICT') {
            // Wait for user
        }
    }, [isPlaying, difficulty, mode]);

    const startTask = () => {
        const len = 5 + difficulty;
        setPhase('TASK');
        const d = Array(len).fill(0).map(() => Math.floor(Math.random() * 10));
        setDigits(d);
        setShowDigits(true);
        setTimeout(() => setShowDigits(false), len * 800);
    };

    const submitTask = () => {
        // Calculate Actual
        const str = digits.join('');
        let correct = 0;
        // Simple: Did they get it right? 1 point per correct digit in place?
        // Let's do: Total Correct
        let tempActual = 0;
        for (let i = 0; i < str.length; i++) {
            if (input[i] === str[i]) tempActual++;
        }
        setActual(tempActual);
        setPhase('REFLECT');

        // Calibration Score
        const pred = parseInt(prediction) || 0;
        const error = Math.abs(pred - tempActual);
        const calibrationScore = Math.max(0, 100 - (error * 20)); // Lose 20 pts per unit error
        onScore(calibrationScore);
    };

    if (!isPlaying) return <View />;

    if (phase === 'PREDICT') {
        return (
            <View style={styles.board}>
                <Text variant="headlineSmall" style={{ textAlign: 'center', marginBottom: 20 }}>Calibration Check</Text>
                <Text variant="bodyLarge" style={{ marginBottom: 20 }}>
                    We will show you {5 + difficulty} digits.
                    <Text style={{ fontWeight: 'bold' }}> How many will you remember correctly?</Text>
                </Text>

                <TextInput
                    mode="outlined"
                    style={{ width: 100, fontSize: 30, textAlign: 'center', marginBottom: 20 }}
                    keyboardType="numeric"
                    value={prediction}
                    onChangeText={setPrediction}
                />

                <Button mode="contained" onPress={startTask} disabled={!prediction}>
                    Commit Prediction
                </Button>
            </View>
        );
    }

    if (phase === 'TASK') {
        if (showDigits) {
            return (
                <View style={styles.board}>
                    <Text variant="displayLarge">{digits.join(' ')}</Text>
                    <ProgressBar indeterminate style={{ width: 200, marginTop: 20 }} />
                </View>
            );
        }
        return (
            <View style={styles.board}>
                <Text variant="titleLarge">Recall the digits:</Text>
                <TextInput
                    mode="outlined"
                    style={{ width: 200, fontSize: 24, marginVertical: 20 }}
                    keyboardType="numeric"
                    value={input}
                    onChangeText={setInput}
                    autoFocus
                />
                <Button mode="contained" onPress={submitTask}>Submit</Button>
            </View>
        );
    }

    if (phase === 'REFLECT') {
        const pred = parseInt(prediction);
        const error = Math.abs(pred - actual);

        return (
            <View style={styles.board}>
                <Text variant="headlineMedium">Result</Text>
                <Surface style={styles.card} elevation={4}>
                    <View style={styles.row}>
                        <Text variant="titleMedium">Predicted:</Text>
                        <Text variant="displaySmall" style={{ color: '#6200ee' }}>{pred}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text variant="titleMedium">Actual:</Text>
                        <Text variant="displaySmall" style={{ color: '#4caf50' }}>{actual}</Text>
                    </View>
                </Surface>

                <Text variant="titleLarge" style={{ marginBottom: 20 }}>
                    {error === 0 ? "Perfect Calibration! 🎯" :
                        pred > actual ? "Overconfident 😅" : "Underconfident 😮"}
                </Text>
                <Text variant="bodyMedium">
                    Metacognition is knowing what you know.
                </Text>
            </View>
        );
    }

    return <View />;
}

export default function Metacognition() {
    const router = useRouter();
    const [score, setScore] = useState(0);

    return (
        <GameContainer
            config={{ ...EXERCISE_REGISTRY['metacognition'], params: {} }}
            modes={['Calibration']}
            hideTimer={true}
            hideDifficulty={true}
            onFinish={async () => {
                await sessionService.saveSession({
                    exerciseId: 'metacognition',
                    rawScore: score,
                    normalizedScore: score, // Already 0-100
                    metrics: { calibration: score },
                    durationSeconds: 60
                });
                router.back();
            }}
        >
            {({ isPlaying, difficulty, mode }) => (
                <MetacognitionBoard
                    isPlaying={isPlaying}
                    difficulty={difficulty}
                    mode={mode}
                    onScore={(s: number) => setScore(prev => prev + s)}
                />
            )}
        </GameContainer>
    );
}

const styles = StyleSheet.create({
    board: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
    card: { padding: 30, backgroundColor: 'white', borderRadius: 15, width: '100%', marginBottom: 30 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }
});
