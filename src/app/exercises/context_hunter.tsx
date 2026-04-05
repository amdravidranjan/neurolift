import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Surface, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GameContainer } from '../../components/GameContainer';
import { EXERCISE_REGISTRY } from '../../features/engine/Registry';
import { sessionService } from '../../features/engine/SessionService';
import { database } from '../../database';
import ContentItem from '../../database/models/ContentItem';
import { Q } from '@nozbe/watermelondb';

const FALLBACK = [
    { target: 'photosynthesis', clues: ['Plants use this process', 'Requires sunlight', 'Produces oxygen'], options: ['photosynthesis', 'respiration', 'digestion', 'fermentation'] },
    { target: 'gravity', clues: ['Keeps planets in orbit', 'Makes things fall', 'Discovered by Newton'], options: ['gravity', 'friction', 'magnetism', 'electricity'] },
    { target: 'democracy', clues: ['Citizens vote for leaders', 'Opposite of dictatorship', 'Originated in Greece'], options: ['democracy', 'monarchy', 'anarchy', 'oligarchy'] },
];

function ContextBoard({ isPlaying, score, onScore }: any) {
    const theme = useTheme();
    const [item, setItem] = useState<any>(null);
    const [pool, setPool] = useState<any[]>([]);
    const [answered, setAnswered] = useState<string | null>(null);

    useEffect(() => { if (isPlaying) loadItems(); }, [isPlaying]);

    const loadItems = async () => {
        try {
            const items = await database.collections.get<ContentItem>('content_items')
                .query(Q.where('exercise_id', 'context_hunter'), Q.take(50)).fetch();
            const parsed = items.length > 0
                ? items.sort(() => Math.random() - 0.5).map(i => JSON.parse(i.contentJson))
                : FALLBACK;
            setPool(parsed);
            setItem(parsed[0]);
        } catch {
            setPool(FALLBACK);
            setItem(FALLBACK[0]);
        }
    };

    const handleAnswer = (choice: string) => {
        setAnswered(choice);
        if (choice === item.target) onScore(10);
        else onScore(-5);
        setTimeout(() => { setAnswered(null); setItem(pool[Math.floor(Math.random() * pool.length)]); }, 700);
    };

    if (!isPlaying || !item) return <View />;

    return (
        <View style={styles.board}>
            <Text variant="titleMedium" style={{ position: 'absolute', top: 20, right: 20, color: '#666' }}>Score: {score}</Text>
            <Text variant="titleMedium" style={{ marginBottom: 16, color: theme.colors.onSurfaceVariant }}>What word matches all these clues?</Text>
            <Surface style={styles.card} elevation={3}>
                {item.clues.map((clue: string, i: number) => (
                    <View key={i} style={styles.clueRow}>
                        <Text style={styles.bullet}>•</Text>
                        <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>{clue}</Text>
                    </View>
                ))}
            </Surface>
            <View style={styles.options}>
                {item.options.map((opt: string) => {
                    let btnColor = theme.colors.primary;
                    if (answered) btnColor = opt === item.target ? '#4CAF50' : opt === answered ? '#F44336' : '#aaa';
                    return (
                        <Button key={opt} mode="contained" onPress={() => !answered && handleAnswer(opt)}
                            style={styles.optBtn} buttonColor={btnColor}>
                            {opt}
                        </Button>
                    );
                })}
            </View>
        </View>
    );
}

export default function ContextHunter() {
    const router = useRouter();
    const [score, setScore] = useState(0);
    return (
        <GameContainer config={{ ...EXERCISE_REGISTRY['context_hunter'], params: {} }} onFinish={async () => {
            await sessionService.saveSession({ exerciseId: 'context_hunter', rawScore: score, normalizedScore: Math.min(score, 100), metrics: { score }, durationSeconds: 60 });
            router.back();
        }}>
            {({ isPlaying }) => <ContextBoard isPlaying={isPlaying} score={score} onScore={(s: number) => setScore(p => p + s)} />}
        </GameContainer>
    );
}

const styles = StyleSheet.create({
    board: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
    card: { padding: 20, borderRadius: 16, width: '100%', marginBottom: 24, backgroundColor: 'white' },
    clueRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
    bullet: { fontSize: 18, marginRight: 10, color: '#6200ee' },
    options: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
    optBtn: { minWidth: 140, borderRadius: 10 },
});
