import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GameContainer } from '../../components/GameContainer';
import { EXERCISE_REGISTRY } from '../../features/engine/Registry';
import { sessionService } from '../../features/engine/SessionService';
import { ContentGenerator } from '../../features/engine/ContentGenerator';
import { database } from '../../database';
import ContentItem from '../../database/models/ContentItem';
import { Q } from '@nozbe/watermelondb';

function ContextBoard({ isPlaying, difficulty, mode, onScore, score }: any) {
    const [clues, setClues] = useState<string[]>([]);
    const [revealed, setRevealed] = useState(0);
    const [target, setTarget] = useState('');
    const [options, setOptions] = useState<string[]>([]);

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
                Q.where('exercise_id', 'context_hunter'),
                Q.take(20)
            ).fetch();

            if (items.length > 0) {
                const shuffled = items.sort(() => Math.random() - 0.5);
                setDbItems(shuffled.map(i => JSON.parse(i.contentJson)));
                generateFromDb(JSON.parse(shuffled[0].contentJson));
            } else {
                reset();
            }
        } catch (e) {
            console.error(e);
            reset();
        }
    };

    const generateFromDb = (prob: any) => {
        setTarget(prob.target);
        setClues(prob.clues);
        setOptions(prob.options);
        setRevealed(1);
    };

    const reset = () => {
        if (dbItems.length > 0) {
            const next = dbItems[Math.floor(Math.random() * dbItems.length)];
            generateFromDb(next);
            return;
        }

        // Procedural Analogy as a placeholder for "Context"
        // In real app, this would be a "Find the word that links these clues"
        // Using Analogy generator loosely for now
        const prob = ContentGenerator.generateAnalogy(difficulty);
        setTarget(prob.answer);

        // Clues: A, B, C...
        setClues([prob.a, prob.b, prob.c]);
        setOptions(prob.options);
        setRevealed(1);
    };

    const handleGuess = (guess: string) => {
        if (guess === target) {
            // Score based on fewer clues needed
            const points = 4 - revealed;
            onScore(points);
        }
        reset();
    };

    const revealMore = () => {
        if (revealed < clues.length) setRevealed(r => r + 1);
    };

    if (!target) return <Text>Loading Context...</Text>;

    return (
        <View style={styles.board}>
            <View style={{ position: 'absolute', top: 20, right: 20 }}>
                <Text variant="titleMedium" style={{ color: '#666' }}>Score: {score}</Text>
            </View>
            <Text variant="titleMedium" style={{ marginBottom: 20 }}>Identify the relation...</Text>

            <Surface style={styles.clueBox} elevation={2}>
                {clues.slice(0, revealed).map((c, i) => (
                    <Text key={i} variant="displaySmall" style={styles.clueText}>{c}</Text>
                ))}
                {revealed < clues.length && (
                    <TouchableOpacity onPress={revealMore}>
                        <Text style={{ color: '#6200ee', marginTop: 10 }}>Tap for Hint (-1 pt)</Text>
                    </TouchableOpacity>
                )}
            </Surface>

            <View style={styles.options}>
                {options.map((opt, i) => (
                    <TouchableOpacity key={i} style={styles.btn} onPress={() => handleGuess(opt)}>
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>{opt}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

export default function ContextHunter() {
    const router = useRouter();
    const [score, setScore] = useState(0);

    return (
        <GameContainer
            config={{ ...EXERCISE_REGISTRY['context_hunter'], params: {} }}
            modes={['Standard', 'Vague', 'Timed']}
            onFinish={async () => {
                await sessionService.saveSession({
                    exerciseId: 'context_hunter',
                    rawScore: score,
                    normalizedScore: Math.min(score * 5, 100),
                    metrics: { correct: score },
                    durationSeconds: 60
                });
                router.back();
            }}
        >
            {({ isPlaying, difficulty, mode }) => (
                <ContextBoard
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
    board: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
    clueBox: { width: '100%', padding: 20, alignItems: 'center', marginBottom: 40, minHeight: 150, justifyContent: 'center' },
    clueText: { marginVertical: 5 },
    options: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
    btn: { backgroundColor: '#4caf50', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 20, minWidth: 100, alignItems: 'center' }
});
