import React, { useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameContainer } from '../../components/GameContainer';
import { EXERCISE_REGISTRY } from '../../features/engine/Registry';
import { sessionService } from '../../features/engine/SessionService';

const MOODS = [
    { emoji: '😄', label: 'Great', value: 5 },
    { emoji: '🙂', label: 'Good', value: 4 },
    { emoji: '😐', label: 'Okay', value: 3 },
    { emoji: '😕', label: 'Low', value: 2 },
    { emoji: '😞', label: 'Bad', value: 1 },
];

function MoodBoard({ isPlaying, onScore }: any) {
    const theme = useTheme();
    const [selected, setSelected] = useState<number | null>(null);
    const [note, setNote] = useState('');
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        if (selected === null) return;
        const entry = { mood: selected, note, date: new Date().toISOString() };
        const key = `mood_${new Date().toISOString().split('T')[0]}`;
        await AsyncStorage.setItem(key, JSON.stringify(entry));
        onScore(10);
        setSaved(true);
    };

    if (!isPlaying) return <View />;

    if (saved) {
        return (
            <View style={styles.board}>
                <Text style={{ fontSize: 64 }}>✅</Text>
                <Text variant="headlineSmall" style={{ marginTop: 16, color: theme.colors.onBackground }}>Mood logged!</Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>Tracking your mood builds emotional awareness.</Text>
            </View>
        );
    }

    return (
        <View style={styles.board}>
            <Text variant="headlineMedium" style={{ marginBottom: 8, color: theme.colors.onBackground }}>How are you feeling?</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 24 }}>Tap to select your mood</Text>

            <View style={styles.moodRow}>
                {MOODS.map(m => (
                    <Button key={m.value} mode={selected === m.value ? 'contained' : 'outlined'}
                        onPress={() => setSelected(m.value)} style={styles.moodBtn}
                        contentStyle={{ height: 60, flexDirection: 'column' }}>
                        {`${m.emoji}\n${m.label}`}
                    </Button>
                ))}
            </View>

            <TextInput
                style={[styles.noteInput, { borderColor: theme.colors.outline, color: theme.colors.onSurface }]}
                placeholder="Add a note (optional)..."
                placeholderTextColor="#aaa"
                value={note}
                onChangeText={setNote}
                multiline
            />

            <Button mode="contained" onPress={handleSave} disabled={selected === null} style={{ width: '100%', borderRadius: 10 }}>
                Save Entry
            </Button>
        </View>
    );
}

export default function MoodJournal() {
    const router = useRouter();
    const [score, setScore] = useState(0);
    return (
        <GameContainer config={{ ...EXERCISE_REGISTRY['mood_journal'], params: {} }} hideTimer hideDifficulty onFinish={async () => {
            await sessionService.saveSession({ exerciseId: 'mood_journal', rawScore: score, normalizedScore: 10, metrics: { logged: true }, durationSeconds: 0 });
            router.back();
        }}>
            {({ isPlaying }) => <MoodBoard isPlaying={isPlaying} onScore={(s: number) => setScore(p => p + s)} />}
        </GameContainer>
    );
}

const styles = StyleSheet.create({
    board: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
    moodRow: { flexDirection: 'row', gap: 8, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center' },
    moodBtn: { borderRadius: 10 },
    noteInput: { width: '100%', height: 100, borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 16, textAlignVertical: 'top' },
});
