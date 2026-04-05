import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Surface, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GameContainer } from '../../components/GameContainer';
import { EXERCISE_REGISTRY } from '../../features/engine/Registry';
import { sessionService } from '../../features/engine/SessionService';

const ITEMS = [
    { text: "Oh great, another Monday morning.", tone: "Sarcastic", options: ["Sarcastic", "Excited", "Sad", "Neutral"] },
    { text: "I can't believe we won! This is amazing!", tone: "Excited", options: ["Excited", "Sad", "Angry", "Sarcastic"] },
    { text: "I suppose things could be worse.", tone: "Resigned", options: ["Resigned", "Happy", "Angry", "Sarcastic"] },
    { text: "Please stop interrupting me.", tone: "Frustrated", options: ["Frustrated", "Happy", "Neutral", "Sarcastic"] },
    { text: "The meeting is scheduled for 3pm.", tone: "Neutral", options: ["Neutral", "Excited", "Sad", "Angry"] },
    { text: "Yeah, sure, that's definitely a great idea.", tone: "Sarcastic", options: ["Sarcastic", "Genuine", "Neutral", "Happy"] },
    { text: "I lost my wallet today... everything went wrong.", tone: "Sad", options: ["Sad", "Happy", "Angry", "Neutral"] },
    { text: "How dare they treat people like that!", tone: "Angry", options: ["Angry", "Sad", "Happy", "Sarcastic"] },
    { text: "I'm so grateful for everything you've done.", tone: "Grateful", options: ["Grateful", "Sarcastic", "Angry", "Neutral"] },
    { text: "Whatever, it doesn't matter anyway.", tone: "Resigned", options: ["Resigned", "Angry", "Happy", "Excited"] },
    { text: "This is the best day of my entire life!", tone: "Excited", options: ["Excited", "Sarcastic", "Sad", "Neutral"] },
    { text: "Everything is fine. Totally fine.", tone: "Sarcastic", options: ["Sarcastic", "Neutral", "Happy", "Calm"] },
];

function ToneBoard({ isPlaying, score, onScore }: any) {
    const theme = useTheme();
    const [item, setItem] = useState(ITEMS[0]);
    const [answered, setAnswered] = useState<string | null>(null);

    const next = () => setItem(ITEMS[Math.floor(Math.random() * ITEMS.length)]);

    const handleAnswer = (choice: string) => {
        setAnswered(choice);
        if (choice === item.tone) onScore(10);
        else onScore(-5);
        setTimeout(() => { setAnswered(null); next(); }, 700);
    };

    if (!isPlaying) return <View />;

    return (
        <View style={styles.board}>
            <Text variant="titleMedium" style={{ position: 'absolute', top: 20, right: 20, color: '#666' }}>Score: {score}</Text>
            <Text variant="titleMedium" style={{ marginBottom: 16, color: theme.colors.onSurfaceVariant }}>What's the tone of this statement?</Text>
            <Surface style={styles.card} elevation={3}>
                <Text variant="headlineMedium" style={{ textAlign: 'center', color: theme.colors.onSurface, fontStyle: 'italic' }}>
                    "{item.text}"
                </Text>
            </Surface>
            <View style={styles.options}>
                {item.options.map((opt) => {
                    let col = theme.colors.primary;
                    if (answered) col = opt === item.tone ? '#4CAF50' : opt === answered ? '#F44336' : '#aaa';
                    return (
                        <Button key={opt} mode="contained" onPress={() => !answered && handleAnswer(opt)}
                            style={styles.optBtn} buttonColor={col}>
                            {opt}
                        </Button>
                    );
                })}
            </View>
        </View>
    );
}

export default function ToneTriangulator() {
    const router = useRouter();
    const [score, setScore] = useState(0);
    return (
        <GameContainer config={{ ...EXERCISE_REGISTRY['tone_triangulator'], params: {} }} onFinish={async () => {
            await sessionService.saveSession({ exerciseId: 'tone_triangulator', rawScore: score, normalizedScore: Math.min(score, 100), metrics: { score }, durationSeconds: 60 });
            router.back();
        }}>
            {({ isPlaying }) => <ToneBoard isPlaying={isPlaying} score={score} onScore={(s: number) => setScore(p => p + s)} />}
        </GameContainer>
    );
}

const styles = StyleSheet.create({
    board: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
    card: { padding: 24, borderRadius: 16, width: '100%', marginBottom: 24, backgroundColor: 'white' },
    options: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
    optBtn: { minWidth: 140, borderRadius: 10 },
});
