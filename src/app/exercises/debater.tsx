import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GameContainer } from '../../components/GameContainer';
import { EXERCISE_REGISTRY } from '../../features/engine/Registry';
import { sessionService } from '../../features/engine/SessionService';

function DebaterBoard({ isPlaying, difficulty, mode, onScore }: any) {
    const [problem, setProblem] = useState<any>(null);

    // Initial content
    const FALLACIES = [
        { text: "My opponent wants to destroy the country!", answer: "Strawman", type: 'Fallacy' },
        { text: "Everyone is buying this phone, so it must be the best.", answer: "Bandwagon", type: 'Fallacy' },
        { text: "Either we ban all cars or we destroy the planet.", answer: "False Dilemma", type: 'Fallacy' },
        { text: "He's wrong because he's stupid.", answer: "Ad Hominem", type: 'Fallacy' },
        { text: "It rained because I washed my car.", answer: "False Cause", type: 'Fallacy' }
    ];

    const SYLLOGISMS = [
        { text: "All humans are mortal.\nSocrates is human.\nTherefore...", answer: "Socrates is mortal", options: ["Socrates is mortal", "Socrates is god", "Humans are Socrates"] },
        { text: "No birds are dogs.\nFido is a dog.\nTherefore...", answer: "Fido is not a bird", options: ["Fido is a bird", "Fido is not a bird", "Fido is a cat"] },
        { text: "Some fruits are apples.\nAll apples are red.\nTherefore...", answer: "Some fruits are red", options: ["All fruits are red", "Some fruits are red", "No fruits are red"] }
    ];

    useEffect(() => {
        if (isPlaying && !problem) nextRound();
    }, [isPlaying, difficulty, mode, problem]);

    const [currentOptions, setCurrentOptions] = useState<string[]>([]);

    // ... (keep nextRound but update it)

    const nextRound = () => {
        let p: any;
        let opts: string[];
        if (mode === 'Syllogism Solver') {
            p = SYLLOGISMS[Math.floor(Math.random() * SYLLOGISMS.length)];
            const newP = { ...p, type: 'Syllogism' };
            setProblem(newP);
            // Default options for syllogism
            setCurrentOptions(newP.options || []);
        } else {
            p = FALLACIES[Math.floor(Math.random() * FALLACIES.length)];
            const newP = { ...p, type: 'Fallacy' };
            setProblem(newP);

            // Generate stable options for Fallacy
            const allFalls = ['Strawman', 'Bandwagon', 'False Dilemma', 'Ad Hominem', 'False Cause'];
            const others = allFalls.filter(f => f !== p.answer).sort(() => Math.random() - 0.5).slice(0, 3);
            opts = [p.answer, ...others].sort(() => Math.random() - 0.5);
            setCurrentOptions(opts);
        }
    };

    const handleAnswer = (ans: string) => {
        if (ans === problem.answer) onScore(10);
        else onScore(-5);
        setProblem(null);
    };

    if (!isPlaying || !problem) return <View />;

    if (!isPlaying || !problem) return <View />;

    // Options are now in state: currentOptions

    return (
        <View style={styles.board}>
            <Surface style={styles.card} elevation={2}>
                <Text variant="titleMedium" style={{ color: '#666', marginBottom: 10 }}>
                    {mode === 'Syllogism Solver' ? 'Complete the Logic:' : 'Identify the Fallacy:'}
                </Text>
                <Text variant="headlineSmall" style={styles.quote}>{problem.text}</Text>
            </Surface>

            <View style={styles.options}>
                {currentOptions.map((opt, i) => (
                    <Button key={i} mode="contained" onPress={() => handleAnswer(opt)} style={styles.btn} labelStyle={{ fontSize: 12 }}>
                        {opt}
                    </Button>
                ))}
            </View>
        </View>
    );
}

export default function Debater() {
    const router = useRouter();
    const [score, setScore] = useState(0);

    return (
        <GameContainer
            config={{ ...EXERCISE_REGISTRY['debater'], params: {} }}
            modes={['Fallacy Finder', 'Syllogism Solver']}
            onFinish={async () => {
                await sessionService.saveSession({
                    exerciseId: 'debater',
                    rawScore: score,
                    normalizedScore: Math.min(score * 10, 100),
                    metrics: { solved: score },
                    durationSeconds: 60
                });
                router.back();
            }}
        >
            {({ isPlaying, difficulty, mode }) => (
                <DebaterBoard
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
    card: { padding: 20, marginBottom: 40, width: '100%', alignItems: 'center', backgroundColor: 'white', borderRadius: 8 },
    quote: { fontStyle: 'italic', textAlign: 'center', lineHeight: 28 },
    options: { gap: 10, width: '100%' },
    btn: { marginVertical: 5 }
});
