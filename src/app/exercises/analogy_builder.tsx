import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GameContainer } from '../../components/GameContainer';
import { EXERCISE_REGISTRY } from '../../features/engine/Registry';
import { sessionService } from '../../features/engine/SessionService';
import { database } from '../../database';
import ContentItem from '../../database/models/ContentItem';
import { Q } from '@nozbe/watermelondb';


function AnalogyBoard({ isPlaying, difficulty, mode, onScore, score }: any) {
    const [problem, setProblem] = useState<any>(null);

    // Initial content
    const VERBAL = [
        { a: 'Bird', b: 'Flight', c: 'Fish', d: 'Swim', options: ['Swim', 'Walk', 'Climb'] },
        { a: 'Doctor', b: 'Hospital', c: 'Teacher', d: 'School', options: ['School', 'Court', 'Farm'] },
        { a: 'Ice', b: 'Cold', c: 'Fire', d: 'Hot', options: ['Hot', 'Wet', 'Hard'] },
        { a: 'Chapter', b: 'Book', c: 'Room', d: 'House', options: ['House', 'City', 'Car'] }
    ];

    const VISUAL = [
        { a: '🔴', b: '🟥', c: '🔵', d: '🟦', options: ['🟦', '🔷', '🟣'] }, // Circle to Square
        { a: '👍', b: '👎', c: '⬆️', d: '⬇️', options: ['⬇️', '⬅️', '↗️'] }, // Opposites
        { a: '☀️', b: '🕶️', c: '🌧️', d: '☂️', options: ['☂️', '🧣', '🧢'] }, // Tool for weather
        { a: '🚗', b: '⛽', c: '📱', d: '🔋', options: ['🔋', '🔌', '📡'] }  // Fuel source
    ];

    // DB State
    const [dbItems, setDbItems] = useState<any[]>([]);

    useEffect(() => {
        if (isPlaying) {
            loadItems();
        }
    }, [isPlaying, difficulty, mode]);

    const loadItems = async () => {
        try {
            const collection = database.collections.get<ContentItem>('content_items');
            const items = await collection.query(
                Q.where('exercise_id', 'analogy_builder'),
                Q.take(20) // Fetch batch
            ).fetch();

            if (items.length > 0) {
                const shuffled = items.sort(() => Math.random() - 0.5);
                setDbItems(shuffled.map(i => JSON.parse(i.contentJson)));
                setProblem(JSON.parse(shuffled[0].contentJson));
            } else {
                nextRound(); // Fallback
            }
        } catch (e) {
            console.error(e);
            nextRound();
        }
    };

    const nextRound = () => {
        if (dbItems.length > 0) {
            const next = dbItems[Math.floor(Math.random() * dbItems.length)];
            setProblem(next);
            return;
        }

        const pool = mode === 'Visual' ? VISUAL : VERBAL;
        setProblem(pool[Math.floor(Math.random() * pool.length)]);
    };

    const handleAnswer = (ans: string) => {
        if (ans === problem.d) onScore(10);
        else onScore(-5);
        // Instant next round
        nextRound();
    };

    if (!isPlaying || !problem) return <View />;

    return (
        <View style={styles.board}>
            <View style={{ position: 'absolute', top: 20, right: 20 }}>
                <Text variant="titleMedium" style={{ color: '#666' }}>Score: {score}</Text>
            </View>
            <Surface style={styles.problemCard} elevation={2}>
                <View style={styles.pair}>
                    <Text variant="displayMedium">{problem.a}</Text>
                    <Text variant="titleMedium">is to</Text>
                    <Text variant="displayMedium">{problem.b}</Text>
                </View>
                <Text variant="displaySmall" style={{ marginVertical: 10, color: '#aaa' }}>AS</Text>
                <View style={styles.pair}>
                    <Text variant="displayMedium">{problem.c}</Text>
                    <Text variant="titleMedium">is to</Text>
                    <Text variant="displayMedium">?</Text>
                </View>
            </Surface>

            <View style={styles.options}>
                {problem.options.sort(() => Math.random() - 0.5).map((opt: string, i: number) => (
                    <Button key={i} mode="contained" onPress={() => handleAnswer(opt)} style={styles.btn} contentStyle={{ height: 50 }}>
                        <Text style={{ fontSize: 20 }}>{opt}</Text>
                    </Button>
                ))}
            </View>
        </View>
    );
}

export default function AnalogyBuilder() {
    const router = useRouter();
    const [score, setScore] = useState(0);

    return (
        <GameContainer
            config={{ ...EXERCISE_REGISTRY['analogy_builder'], params: {} }}
            modes={['Verbal', 'Visual']}
            onFinish={async () => {
                await sessionService.saveSession({
                    exerciseId: 'analogy_builder',
                    rawScore: score,
                    normalizedScore: Math.min(score * 10, 100),
                    metrics: { solved: score },
                    durationSeconds: 60
                });
                router.back();
            }}
        >
            {({ isPlaying, difficulty, mode }) => (
                <AnalogyBoard
                    isPlaying={isPlaying}
                    difficulty={difficulty}
                    mode={mode}
                    score={score}
                    onScore={(s: number) => setScore(prev => prev + s)}
                />
            )}
        </GameContainer>
    );
}

const styles = StyleSheet.create({
    board: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
    problemCard: { padding: 30, alignItems: 'center', backgroundColor: 'white', borderRadius: 12, width: '100%', marginBottom: 40 },
    pair: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    options: { flexDirection: 'row', gap: 15, flexWrap: 'wrap', justifyContent: 'center' },
    btn: { minWidth: 100 }
});
