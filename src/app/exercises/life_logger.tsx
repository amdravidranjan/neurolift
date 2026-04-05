import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, ScrollView } from 'react-native';
import { Text, Button, Surface, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameContainer } from '../../components/GameContainer';
import { EXERCISE_REGISTRY } from '../../features/engine/Registry';
import { sessionService } from '../../features/engine/SessionService';

type Phase = 'LOG' | 'RECALL' | 'RATE' | 'DONE';

function LifeBoard({ isPlaying, onScore }: any) {
    const theme = useTheme();
    const [phase, setPhase] = useState<Phase>('LOG');
    const [todayEntry, setTodayEntry] = useState('');
    const [yesterdayEntry, setYesterdayEntry] = useState<string | null>(null);
    const [recall, setRecall] = useState('');

    useEffect(() => {
        if (isPlaying) loadYesterday();
    }, [isPlaying]);

    const loadYesterday = async () => {
        const yDate = new Date();
        yDate.setDate(yDate.getDate() - 1);
        const key = `life_log_${yDate.toISOString().split('T')[0]}`;
        const entry = await AsyncStorage.getItem(key);
        setYesterdayEntry(entry);
        setPhase(entry ? 'RECALL' : 'LOG');
    };

    const saveToday = async () => {
        if (!todayEntry.trim()) return;
        const key = `life_log_${new Date().toISOString().split('T')[0]}`;
        await AsyncStorage.setItem(key, todayEntry.trim());
        setPhase('DONE');
        onScore(10);
    };

    const submitRecall = () => setPhase('RATE');

    const rate = (stars: number) => {
        onScore(stars * 2);
        setPhase('LOG');
    };

    if (!isPlaying) return <View />;

    if (phase === 'RECALL' && yesterdayEntry) {
        return (
            <ScrollView contentContainerStyle={styles.board}>
                <Text variant="headlineMedium" style={{ color: theme.colors.onBackground, marginBottom: 8 }}>Recall Yesterday</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 20 }}>What do you remember logging yesterday?</Text>
                <TextInput
                    style={[styles.input, { borderColor: theme.colors.outline, color: theme.colors.onSurface }]}
                    placeholder="Write what you remember..."
                    placeholderTextColor="#aaa"
                    value={recall}
                    onChangeText={setRecall}
                    multiline
                />
                <Button mode="contained" onPress={submitRecall} style={{ borderRadius: 10, marginBottom: 12 }}>Check My Memory</Button>
            </ScrollView>
        );
    }

    if (phase === 'RATE') {
        return (
            <View style={styles.board}>
                <Text variant="headlineMedium" style={{ color: theme.colors.onBackground, marginBottom: 16 }}>Yesterday you logged:</Text>
                <Surface style={styles.card} elevation={2}>
                    <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>{yesterdayEntry}</Text>
                </Surface>
                <Text variant="titleMedium" style={{ marginTop: 24, marginBottom: 12, color: theme.colors.onBackground }}>How accurate was your recall?</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    {[1, 2, 3, 4, 5].map(n => (
                        <Button key={n} mode="outlined" onPress={() => rate(n)} style={{ borderRadius: 8 }}>{n}⭐</Button>
                    ))}
                </View>
            </View>
        );
    }

    if (phase === 'DONE') {
        return (
            <View style={styles.board}>
                <Text style={{ fontSize: 64 }}>📓</Text>
                <Text variant="headlineSmall" style={{ marginTop: 16, color: theme.colors.onBackground }}>Entry saved!</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.board}>
            <Text variant="headlineMedium" style={{ color: theme.colors.onBackground, marginBottom: 8 }}>Log Today's Event</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 20 }}>Write one memorable thing that happened today</Text>
            <TextInput
                style={[styles.input, { borderColor: theme.colors.outline, color: theme.colors.onSurface }]}
                placeholder="e.g. Had a great conversation about AI..."
                placeholderTextColor="#aaa"
                value={todayEntry}
                onChangeText={setTodayEntry}
                multiline
            />
            <Button mode="contained" onPress={saveToday} disabled={!todayEntry.trim()} style={{ borderRadius: 10 }}>Save Entry</Button>
        </ScrollView>
    );
}

export default function LifeLogger() {
    const router = useRouter();
    const [score, setScore] = useState(0);
    return (
        <GameContainer config={{ ...EXERCISE_REGISTRY['life_logger'], params: {} }} hideTimer hideDifficulty onFinish={async () => {
            await sessionService.saveSession({ exerciseId: 'life_logger', rawScore: score, normalizedScore: Math.min(score * 10, 100), metrics: { score }, durationSeconds: 0 });
            router.back();
        }}>
            {({ isPlaying }) => <LifeBoard isPlaying={isPlaying} onScore={(s: number) => setScore(p => p + s)} />}
        </GameContainer>
    );
}

const styles = StyleSheet.create({
    board: { flexGrow: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
    input: { width: '100%', height: 150, borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 16, textAlignVertical: 'top' },
    card: { padding: 20, borderRadius: 12, width: '100%', backgroundColor: 'white' },
});
