import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text, Button, Surface, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GameContainer } from '../../components/GameContainer';
import { EXERCISE_REGISTRY } from '../../features/engine/Registry';
import { sessionService } from '../../features/engine/SessionService';
import { database } from '../../database';
import ContentItem from '../../database/models/ContentItem';
import { Q } from '@nozbe/watermelondb';

function SynthBoard({ isPlaying, score, onScore }: any) {
    const theme = useTheme();
    const [item, setItem] = useState<{ text: string; isTrue: boolean } | null>(null);
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
    const [pool, setPool] = useState<any[]>([]);
    const fadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (isPlaying) loadItems();
    }, [isPlaying]);

    const loadItems = async () => {
        try {
            const items = await database.collections.get<ContentItem>('content_items')
                .query(Q.where('exercise_id', 'synthesizer'), Q.take(80)).fetch();
            if (items.length > 0) {
                const parsed = items.sort(() => Math.random() - 0.5).map(i => JSON.parse(i.contentJson));
                setPool(parsed);
                setItem(parsed[0]);
            }
        } catch { nextItem([]); }
    };

    const nextItem = (currentPool: any[]) => {
        if (currentPool.length > 0) {
            setItem(currentPool[Math.floor(Math.random() * currentPool.length)]);
        }
    };

    const handleAnswer = (answer: boolean) => {
        if (!item) return;
        const correct = answer === item.isTrue;
        setFeedback(correct ? 'correct' : 'wrong');
        onScore(correct ? 15 : -10);

        Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 0.3, duration: 200, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start();

        setTimeout(() => { setFeedback('none'); nextItem(pool); }, 400);
    };

    if (!isPlaying || !item) return <View />;

    const bgColor = feedback === 'correct' ? '#dcedc8' : feedback === 'wrong' ? '#ffcdd2' : theme.colors.surface;

    return (
        <View style={styles.board}>
            <Text variant="titleMedium" style={{ position: 'absolute', top: 20, right: 20, color: '#666' }}>Score: {score}</Text>
            <Animated.View style={{ opacity: fadeAnim, width: '100%' }}>
                <Surface style={[styles.card, { backgroundColor: bgColor }]} elevation={3}>
                    <Text variant="headlineSmall" style={{ textAlign: 'center', color: theme.colors.onSurface }}>
                        {item.text}
                    </Text>
                </Surface>
            </Animated.View>
            <Text variant="bodyMedium" style={{ marginVertical: 20, color: theme.colors.onSurfaceVariant }}>Is this statement TRUE or FALSE?</Text>
            <View style={styles.btnRow}>
                <Button mode="contained" onPress={() => handleAnswer(true)} buttonColor="#4CAF50" style={styles.tfBtn} contentStyle={{ height: 56 }}>
                    TRUE ✓
                </Button>
                <Button mode="contained" onPress={() => handleAnswer(false)} buttonColor="#F44336" style={styles.tfBtn} contentStyle={{ height: 56 }}>
                    FALSE ✗
                </Button>
            </View>
        </View>
    );
}

export default function Synthesizer() {
    const router = useRouter();
    const [score, setScore] = useState(0);
    return (
        <GameContainer config={{ ...EXERCISE_REGISTRY['synthesizer'], params: {} }} onFinish={async () => {
            await sessionService.saveSession({ exerciseId: 'synthesizer', rawScore: score, normalizedScore: Math.min(score, 100), metrics: { score }, durationSeconds: 60 });
            router.back();
        }}>
            {({ isPlaying }) => <SynthBoard isPlaying={isPlaying} score={score} onScore={(s: number) => setScore(p => p + s)} />}
        </GameContainer>
    );
}

const styles = StyleSheet.create({
    board: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
    card: { padding: 30, borderRadius: 16, marginBottom: 10, width: '100%', minHeight: 120, justifyContent: 'center' },
    btnRow: { flexDirection: 'row', gap: 20 },
    tfBtn: { flex: 1, borderRadius: 12 },
});
