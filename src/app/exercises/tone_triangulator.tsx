import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Surface, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GameContainer } from '../../components/GameContainer';
import { EXERCISE_REGISTRY } from '../../features/engine/Registry';
import { sessionService } from '../../features/engine/SessionService';

function ToneBoard({ isPlaying, difficulty, mode, onScore }: any) {
    const [problem, setProblem] = useState<any>(null);

    // Context Mode
    const SCENARIOS = [
        { text: '"Oh, great. Just what I needed."', context: "Raining heavily on a picnic.", answer: "Sarcastic" },
        { text: '"Oh, great! Just what I needed!"', context: "Receiving a desired gift.", answer: "Genuine" },
        { text: '"We need to talk."', context: "Boss calling you into office.", answer: "Serious" },
        { text: '"We need to talk."', context: "Friend laughing at a party.", answer: "Playful" }
    ];

    // Audio Traits Mode (Simulated)
    const AUDIO = [
        { traits: ['Pitch: High', 'Speed: Fast', 'Volume: Loud'], answer: 'Excited' },
        { traits: ['Pitch: Low', 'Speed: Slow', 'Volume: Soft'], answer: 'Sad' },
        { traits: ['Pitch: Sharp', 'Speed: Fast', 'Volume: Loud'], answer: 'Angry' },
        { traits: ['Pitch: Monotone', 'Speed: Moderate', 'Volume: Moderate'], answer: 'Bored' }
    ];

    useEffect(() => {
        if (isPlaying && !problem) nextRound();
    }, [isPlaying, difficulty, mode, problem]);

    const nextRound = () => {
        if (mode === 'Audio Traits') {
            setProblem(AUDIO[Math.floor(Math.random() * AUDIO.length)]);
        } else {
            setProblem(SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)]);
        }
    };

    const handleAnswer = (ans: string) => {
        if (ans === problem.answer) onScore(10);
        else onScore(-5);
        setProblem(null);
    };

    if (!isPlaying || !problem) return <View />;

    // Options
    let opts = [];
    if (mode === 'Audio Traits') {
        opts = ['Excited', 'Sad', 'Angry', 'Bored'];
    } else {
        opts = ['Sarcastic', 'Genuine', 'Serious', 'Playful'];
    }

    return (
        <View style={styles.board}>
            <Surface style={styles.card} elevation={2}>
                {mode === 'Audio Traits' ? (
                    <View>
                        <Text variant="titleLarge" style={{ marginBottom: 20 }}>Analyze these vocal traits:</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
                            {problem.traits.map((t: string, i: number) => (
                                <Chip key={i} icon="waveform">{t}</Chip>
                            ))}
                        </View>
                    </View>
                ) : (
                    <View>
                        <Text variant="titleMedium" style={{ color: '#666', marginBottom: 10 }}>Context: {problem.context}</Text>
                        <Text variant="headlineSmall" style={{ fontStyle: 'italic', backgroundColor: '#e3f2fd', padding: 20, borderRadius: 10 }}>
                            {problem.text}
                        </Text>
                    </View>
                )}
            </Surface>

            <View style={styles.options}>
                {opts.map((opt, i) => (
                    <Button key={i} mode="contained" onPress={() => handleAnswer(opt)} style={styles.btn}>
                        {opt}
                    </Button>
                ))}
            </View>
        </View>
    );
}

export default function ToneTriangulator() {
    const router = useRouter();
    const [score, setScore] = useState(0);

    return (
        <GameContainer
            config={{ ...EXERCISE_REGISTRY['tone_triangulator'], params: {} }}
            modes={['Context', 'Audio Traits']}
            onFinish={async () => {
                await sessionService.saveSession({
                    exerciseId: 'tone_triangulator',
                    rawScore: score,
                    normalizedScore: Math.min(score * 10, 100),
                    metrics: { solved: score },
                    durationSeconds: 60
                });
                router.back();
            }}
        >
            {({ isPlaying, difficulty, mode }) => (
                <ToneBoard
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
    board: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
    card: { padding: 30, backgroundColor: 'white', borderRadius: 15, marginBottom: 40, width: '100%', alignItems: 'center' },
    options: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
    btn: { width: 140 }
});
