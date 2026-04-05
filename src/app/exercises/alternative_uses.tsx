import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TextInput, ScrollView } from 'react-native';
import { Text, Button, Chip, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GameContainer } from '../../components/GameContainer';
import { EXERCISE_REGISTRY } from '../../features/engine/Registry';
import { sessionService } from '../../features/engine/SessionService';

const OBJECTS = ['Brick', 'Paperclip', 'Newspaper', 'Shoe', 'Rubber band', 'Pencil', 'Plastic bottle', 'Fork', 'Cardboard box', 'Toothpick', 'Chair', 'Umbrella'];

function AltUsesBoard({ isPlaying, onScore, score }: any) {
    const theme = useTheme();
    const [object, setObject] = useState('');
    const [input, setInput] = useState('');
    const [uses, setUses] = useState<string[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (isPlaying) {
            setObject(OBJECTS[Math.floor(Math.random() * OBJECTS.length)]);
            setUses([]);
            setInput('');
            setSubmitted(false);
            setTimeLeft(60);
            timerRef.current = setInterval(() => {
                setTimeLeft(t => {
                    if (t <= 1) {
                        clearInterval(timerRef.current!);
                        setSubmitted(true);
                        return 0;
                    }
                    return t - 1;
                });
            }, 1000);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isPlaying]);

    const addUse = () => {
        const clean = input.trim();
        if (clean && !uses.includes(clean) && uses.length < 20) {
            setUses(prev => [...prev, clean]);
            setInput('');
        }
    };

    const handleSubmit = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        onScore(uses.length * 5);
        setSubmitted(true);
    };

    if (!isPlaying) return <View />;

    if (submitted) {
        return (
            <View style={styles.board}>
                <Text variant="headlineMedium" style={{ color: theme.colors.onBackground }}>🎉 {uses.length} Uses!</Text>
                <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>Score: +{uses.length * 5} points</Text>
                <View style={styles.chips}>
                    {uses.map((u, i) => <Chip key={i} style={{ margin: 4 }}>{u}</Chip>)}
                </View>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.board}>
            <View style={styles.header}>
                <Text variant="displaySmall" style={{ color: '#6200ee', fontWeight: 'bold' }}>{object}</Text>
                <View style={styles.timerBadge}>
                    <Text style={{ color: timeLeft < 10 ? '#F44336' : '#333', fontWeight: 'bold' }}>{timeLeft}s</Text>
                </View>
            </View>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16 }}>
                List as many uses as you can! ({uses.length} so far)
            </Text>
            <View style={styles.inputRow}>
                <TextInput
                    style={[styles.input, { borderColor: theme.colors.outline, color: theme.colors.onSurface, flex: 1 }]}
                    placeholder="Type a use..."
                    placeholderTextColor="#aaa"
                    value={input}
                    onChangeText={setInput}
                    onSubmitEditing={addUse}
                    returnKeyType="done"
                />
                <Button mode="contained" onPress={addUse} style={{ borderRadius: 10 }}>Add</Button>
            </View>
            <View style={styles.chips}>
                {uses.map((u, i) => <Chip key={i} style={{ margin: 4 }}>{u}</Chip>)}
            </View>
            <Button mode="outlined" onPress={handleSubmit} style={{ marginTop: 20, borderRadius: 10 }}>Done</Button>
        </ScrollView>
    );
}

export default function AlternativeUses() {
    const router = useRouter();
    const [score, setScore] = useState(0);
    return (
        <GameContainer config={{ ...EXERCISE_REGISTRY['alternative_uses'], params: {} }} hideTimer hideDifficulty onFinish={async () => {
            await sessionService.saveSession({ exerciseId: 'alternative_uses', rawScore: score, normalizedScore: Math.min(score, 100), metrics: { score }, durationSeconds: 60 });
            router.back();
        }}>
            {({ isPlaying }) => <AltUsesBoard isPlaying={isPlaying} score={score} onScore={(s: number) => setScore(p => p + s)} />}
        </GameContainer>
    );
}

const styles = StyleSheet.create({
    board: { flexGrow: 1, padding: 20, alignItems: 'center', paddingTop: 40 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 16 },
    timerBadge: { backgroundColor: '#f5f5f5', padding: 10, borderRadius: 8, minWidth: 50, alignItems: 'center' },
    inputRow: { flexDirection: 'row', gap: 10, width: '100%', marginBottom: 10 },
    input: { height: 48, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
});
