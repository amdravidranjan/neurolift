import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GameContainer } from '../../components/GameContainer';
import { EXERCISE_REGISTRY } from '../../features/engine/Registry';
import { sessionService } from '../../features/engine/SessionService';
import { ContentGenerator } from '../../features/engine/ContentGenerator';
import { database } from '../../database';
import ContentItem from '../../database/models/ContentItem';
import { Q } from '@nozbe/watermelondb';

interface RapidBoardProps {
    isPlaying: boolean;
    difficulty: number;
    mode: string;
    onScore: (points: number) => void;
}

function RapidBoard({ isPlaying, difficulty, mode, onScore }: RapidBoardProps) {
    const [problem, setProblem] = useState<{ question: string, answer: any, options: any[] } | null>(null);
    const [combo, setCombo] = useState(0);
    const [feedback, setFeedback] = useState<'NONE' | 'CORRECT' | 'WRONG'>('NONE');

    // DB State
    const [dbItems, setDbItems] = useState<any[]>([]);

    useEffect(() => {
        if (isPlaying) {
            loadItems();
        }
    }, [isPlaying, difficulty, mode]);

    const loadItems = async () => {
        // Fetch 20 random items for this session from DB
        try {
            const exerciseId = 'rapid_fire';
            // We can't do true random query easily in Watermelon/Loki without fetching all IDs first or using raw SQL
            // Limit to first 50 matching difficulty for now to prove concept
            const collection = database.collections.get<ContentItem>('content_items');
            const items = await collection.query(
                Q.where('exercise_id', exerciseId),
                Q.where('difficulty', difficulty), // Exact difficulty match
                Q.take(50)
            ).fetch();

            if (items.length > 0) {
                // Shuffle in memory
                const shuffled = items.sort(() => Math.random() - 0.5);
                setDbItems(shuffled.map(i => JSON.parse(i.contentJson)));
                generateFromDb(shuffled[0]); // Start with first
            } else {
                // Fallback if DB empty (or seeding failed/not run yet)
                generate();
            }
        } catch (e) {
            console.error(e);
            generate(); // Fallback
        }
    };

    const generateFromDb = (item: any) => {
        if (item) {
            // Shuffle options to prevent answer predictability (Static data has answer at index 0)
            const prob = JSON.parse(item.contentJson);
            const shuffledOptions = [...prob.options].sort(() => Math.random() - 0.5);
            setProblem({ ...prob, options: shuffledOptions });
        } else {
            generate();
        }
    };

    const generate = () => {
        // Fallback for infinite mode or if DB empty
        // Mode: Math or Standard (which is Math for now)
        if (dbItems.length > 0) {
            // Pick next random from local cache
            const next = dbItems[Math.floor(Math.random() * dbItems.length)];
            setProblem(next);
            return;
        }

        if (mode === 'Logic') {
            setProblem({ question: 'Odd one out: A, B, C, 1?', answer: '1', options: ['A', 'B', 'C', '1'] });
        } else {
            setProblem(ContentGenerator.generateMathProblem(difficulty));
        }
    };

    const handleAnswer = (ans: any) => {
        if (String(ans) === String(problem?.answer)) {
            const multiplier = Math.floor(combo / 5) + 1;
            onScore(10 * multiplier);
            setCombo(c => c + 1);
            setFeedback('CORRECT');
        } else {
            setCombo(0);
            setFeedback('WRONG');
        }

        setTimeout(() => {
            setFeedback('NONE');
            generate();
        }, 300); // Quick transition
    };

    if (!problem) return <Text>Loading...</Text>;

    return (
        <View style={styles.board}>
            <View style={styles.statsBar}>
                <Text variant="titleMedium" style={{ color: '#ff9800' }}>Combo: x{Math.floor(combo / 5) + 1} ({combo})</Text>
            </View>

            <Surface style={[styles.card, feedback === 'CORRECT' ? styles.correct : feedback === 'WRONG' ? styles.wrong : {}]} elevation={4}>
                <Text variant="displayLarge" style={{ textAlign: 'center' }}>{problem.question}</Text>
            </Surface>

            <View style={styles.optionsGrid}>
                {problem.options.map((opt, i) => (
                    <TouchableOpacity key={i} style={styles.optionBtn} onPress={() => handleAnswer(opt)}>
                        <Text variant="headlineSmall" style={{ color: 'white' }}>{opt}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

export default function RapidFire() {
    const router = useRouter();
    const [score, setScore] = useState(0);

    return (
        <GameContainer
            config={{ ...EXERCISE_REGISTRY['rapid_fire'], params: {} }}
            modes={['Math', 'Logic']} // Two modes for Rapid Fire
            onFinish={async () => {
                await sessionService.saveSession({
                    exerciseId: 'rapid_fire',
                    rawScore: score,
                    normalizedScore: Math.min(score / 5, 100),
                    metrics: { score },
                    durationSeconds: 60
                });
                router.back();
            }}
        >
            {({ isPlaying, difficulty, mode }) => (
                <RapidBoard
                    isPlaying={isPlaying}
                    difficulty={difficulty}
                    mode={mode}
                    onScore={(s) => setScore(prev => prev + s)}
                />
            )}
        </GameContainer>
    );
}

const styles = StyleSheet.create({
    board: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
    statsBar: { position: 'absolute', top: 20, right: 20 },
    card: { padding: 40, borderRadius: 20, marginBottom: 50, width: '90%', alignItems: 'center' },
    correct: { backgroundColor: '#dcedc8' },
    wrong: { backgroundColor: '#ffcdd2' },
    optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 20, justifyContent: 'center' },
    optionBtn: { width: '40%', height: 100, backgroundColor: '#6200ee', borderRadius: 15, justifyContent: 'center', alignItems: 'center' }
});
