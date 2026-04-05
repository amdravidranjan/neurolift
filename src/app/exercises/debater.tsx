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

function DebaterBoard({ isPlaying, score, onScore }: any) {
    const theme = useTheme();
    const [item, setItem] = useState<any>(null);
    const [pool, setPool] = useState<any[]>([]);
    const [answered, setAnswered] = useState<string | null>(null);

    useEffect(() => { if (isPlaying) loadItems(); }, [isPlaying]);

    const loadItems = async () => {
        try {
            const items = await database.collections.get<ContentItem>('content_items')
                .query(Q.where('exercise_id', 'debater'), Q.take(100)).fetch();
            if (items.length > 0) {
                const parsed = items.sort(() => Math.random() - 0.5).map(i => JSON.parse(i.contentJson));
                setPool(parsed);
                setItem(parsed[0]);
            }
        } catch {}
    };

    const handleAnswer = (choice: string) => {
        setAnswered(choice);
        if (choice === item.fallacy) onScore(20);
        else onScore(-10);
        setTimeout(() => { setAnswered(null); nextItem(); }, 800);
    };

    const nextItem = () => {
        if (pool.length > 0) setItem(pool[Math.floor(Math.random() * pool.length)]);
    };

    if (!isPlaying || !item) return <View />;

    return (
        <View style={styles.board}>
            <Text variant="titleMedium" style={{ position: 'absolute', top: 20, right: 20, color: '#666' }}>Score: {score}</Text>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>TOPIC: {item.topic}</Text>
            <Surface style={styles.card} elevation={3}>
                <Text variant="headlineSmall" style={{ textAlign: 'center', color: theme.colors.onSurface, fontStyle: 'italic' }}>
                    "{item.statement}"
                </Text>
            </Surface>
            <Text variant="bodyMedium" style={{ marginVertical: 16, color: theme.colors.onSurfaceVariant }}>Which logical fallacy is this?</Text>
            <View style={styles.options}>
                {item.options.map((opt: string) => {
                    let btnColor = theme.colors.surfaceVariant;
                    if (answered) btnColor = opt === item.fallacy ? '#dcedc8' : opt === answered ? '#ffcdd2' : theme.colors.surfaceVariant;
                    return (
                        <Button key={opt} mode="contained" onPress={() => !answered && handleAnswer(opt)}
                            style={[styles.optBtn, { backgroundColor: btnColor }]}
                            labelStyle={{ color: theme.colors.onSurface }}>
                            {opt}
                        </Button>
                    );
                })}
            </View>
        </View>
    );
}

export default function Debater() {
    const router = useRouter();
    const [score, setScore] = useState(0);
    return (
        <GameContainer config={{ ...EXERCISE_REGISTRY['debater'], params: {} }} onFinish={async () => {
            await sessionService.saveSession({ exerciseId: 'debater', rawScore: score, normalizedScore: Math.min(score, 100), metrics: { score }, durationSeconds: 60 });
            router.back();
        }}>
            {({ isPlaying }) => <DebaterBoard isPlaying={isPlaying} score={score} onScore={(s: number) => setScore(p => p + s)} />}
        </GameContainer>
    );
}

const styles = StyleSheet.create({
    board: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
    card: { padding: 24, borderRadius: 16, marginBottom: 10, width: '100%', backgroundColor: 'white' },
    options: { width: '100%', gap: 10 },
    optBtn: { borderRadius: 10 },
});
