import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { Text, Button, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GameContainer } from '../../components/GameContainer';
import { EXERCISE_REGISTRY } from '../../features/engine/Registry';
import { sessionService } from '../../features/engine/SessionService';

function LifeLoggerBoard({ isPlaying, difficulty, mode, onScore }: any) {
    const router = useRouter();
    const [entry, setEntry] = useState('');
    const [phase, setPhase] = useState<'LOG' | 'RECALL'>('LOG');

    // Recall Mock
    const [question, setQuestion] = useState<any>(null);

    useEffect(() => {
        if (isPlaying && mode === 'Recall Quiz' && !question) setupRecall();
    }, [isPlaying, difficulty, mode]);

    const setupRecall = () => {
        setPhase('RECALL');
        // Simulated past entry
        setQuestion({
            context: "Logged 2 days ago: 'Went to the zoo and saw a baby giraffe.'",
            q: "What animal did you see?",
            answer: "Giraffe",
            options: ["Lion", "Giraffe", "Elephant", "Monkey"]
        });
    };

    const handleAnswer = (ans: string) => {
        if (ans === question.answer) onScore(100);
        else onScore(0);
        router.back(); // End after one q
    };

    if (!isPlaying) return <View />;

    if (mode === 'Recall Quiz' && question) {
        return (
            <View style={styles.board}>
                <Text variant="headlineSmall" style={{ marginBottom: 20 }}>Memory Check!</Text>
                <Surface style={styles.card} elevation={2}>
                    <Text variant="bodyLarge" style={{ fontStyle: 'italic', color: '#666', marginBottom: 20 }}>
                        {question.context.substring(0, 20)}...
                    </Text>
                    <Text variant="titleLarge">{question.q}</Text>
                </Surface>

                <View style={styles.options}>
                    {question.options.map((opt: string, i: number) => (
                        <Button key={i} mode="contained" onPress={() => handleAnswer(opt)} style={{ margin: 5 }}>
                            {opt}
                        </Button>
                    ))}
                </View>
            </View>
        );
    }

    return (
        <View style={styles.board}>
            <Text variant="titleMedium">What was the highlight of yesterday?</Text>
            <TextInput
                style={styles.input}
                multiline
                placeholder="I ate a sandwich..."
                value={entry}
                onChangeText={setEntry}
            />
            <Text style={{ color: '#666', marginTop: 10 }}>
                (We will test your recall of this in 48 hours.)
            </Text>
            <Button mode="contained" onPress={() => onScore(10)} style={{ marginTop: 20 }}>Save Entry</Button>
        </View>
    );
}

export default function LifeLogger() {
    const router = useRouter();
    const [score, setScore] = useState(0);

    return (
        <GameContainer
            config={{ ...EXERCISE_REGISTRY['life_logger'], params: {} }}
            modes={['Daily Log', 'Recall Quiz']}
            hideTimer={true}
            hideDifficulty={true}
            onFinish={async () => {
                await sessionService.saveSession({
                    exerciseId: 'life_logger',
                    rawScore: 100,
                    normalizedScore: 100,
                    metrics: { completed: 1 },
                    durationSeconds: 60
                });
                router.back();
            }}
        >
            {({ isPlaying, difficulty, mode }) => (
                <LifeLoggerBoard
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
    board: { flex: 1, padding: 20, alignItems: 'center' },
    input: { height: 150, borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10, marginTop: 20, textAlignVertical: 'top', width: '100%', backgroundColor: 'white' },
    card: { padding: 20, backgroundColor: 'white', borderRadius: 10, marginBottom: 30, width: '100%', alignItems: 'center' },
    options: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }
});
