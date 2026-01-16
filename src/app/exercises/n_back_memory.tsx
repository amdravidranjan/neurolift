import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GameContainer } from '../../components/GameContainer';
import { EXERCISE_REGISTRY } from '../../features/engine/Registry';
import { sessionService } from '../../features/engine/SessionService';

interface NBackBoardProps {
    isPlaying: boolean;
    settings: any;
    score: number;
    onScore: (delta: number) => void;
}

function NBackBoard({ isPlaying, settings, onScore, score }: NBackBoardProps) {
    const [history, setHistory] = useState<{ pos: number, audio: string }[]>([]);
    const [current, setCurrent] = useState<{ pos: number, audio: string } | null>(null);
    const [feedback, setFeedback] = useState('');

    const n = settings.n || 2;
    const mode = settings.mode || 'Visual';
    const intervalTime = settings.interval || 2500;

    useEffect(() => {
        if (isPlaying) {
            const interval = setInterval(nextStimulus, intervalTime);
            return () => clearInterval(interval);
        }
    }, [isPlaying, intervalTime]);

    const nextStimulus = () => {
        const gridPos = Math.floor(Math.random() * 9);
        const letters = ['A', 'B', 'C', 'D', 'E'];
        const letter = letters[Math.floor(Math.random() * letters.length)];

        const newItem = { pos: gridPos, audio: letter };
        setCurrent(newItem);
        setHistory(h => [...h, newItem]);
        setFeedback(''); // Clear feedback
    };

    const checkMatch = (type: 'POS' | 'AUDIO') => {
        if (history.length < n + 1) return; // Not enough history
        const target = history[history.length - 1 - n]; // N steps ago
        const now = history[history.length - 1];

        if (type === 'POS') {
            if (target.pos === now.pos) {
                setFeedback('MATCH POS!');
                onScore(1); // HIT
            } else {
                setFeedback('WRONG');
                onScore(-1); // FALSE ALARM
            }
        } else if (type === 'AUDIO') {
            if (target.audio === now.audio) {
                setFeedback('MATCH AUDIO!');
                onScore(1); // HIT
            } else {
                setFeedback('WRONG');
                onScore(-1); // FALSE ALARM
            }
        }
    };

    if (!current) return <View style={styles.board}><Text>Get Ready...</Text></View>;

    return (
        <View style={styles.board}>
            <View style={{ position: 'absolute', top: 20, right: 20 }}>
                <Text variant="titleMedium">Score: {score}</Text>
            </View>
            <Text variant="headlineSmall" style={{ marginBottom: 20 }}>N = {n} ({mode})</Text>

            {/* Grid for Position */}
            <View style={styles.grid}>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <View key={i} style={[styles.cell, current.pos === i && styles.activeCell]} />
                ))}
            </View>

            {/* Audio/Letter Display */}
            {(mode === 'Audio' || mode === 'Dual') && (
                <Text variant="displayMedium" style={{ marginTop: 20 }}>{current.audio}</Text>
            )}

            <Text style={{ height: 30, color: feedback === 'WRONG' ? 'red' : 'green', fontWeight: 'bold' }}>{feedback}</Text>

            <View style={styles.controls}>
                {(mode === 'Visual' || mode === 'Dual') && (
                    <Button mode="contained" onPress={() => checkMatch('POS')} style={{ backgroundColor: '#2196f3' }}>
                        Position Match
                    </Button>
                )}
                {(mode === 'Audio' || mode === 'Dual') && (
                    <Button mode="contained" onPress={() => checkMatch('AUDIO')} style={{ backgroundColor: '#ff9800' }}>
                        Audio Match
                    </Button>
                )}
            </View>
        </View>
    );
}

export default function NBackMemory() {
    const router = useRouter();

    return (
        <GameContainer
            config={{ ...EXERCISE_REGISTRY['n_back_memory'], params: {} }}
            modes={['Visual', 'Audio', 'Dual']}
            onFinish={async (results) => {
                const finalScore = results?.raw || 0;
                await sessionService.saveSession({
                    exerciseId: 'n_back_memory',
                    rawScore: finalScore,
                    normalizedScore: Math.min(Math.max(finalScore * 10, 0), 100),
                    metrics: { score: finalScore },
                    durationSeconds: 60
                });
                router.back();
            }}
        >
            {({ isPlaying, customSettings, score, setScore }) => (
                <NBackBoard
                    isPlaying={isPlaying}
                    settings={customSettings}
                    score={score || 0}
                    onScore={(delta: number) => setScore((s: number) => s + delta)}
                />
            )}
        </GameContainer>
    );
}

const styles = StyleSheet.create({
    board: { flex: 1, padding: 20, alignItems: 'center' },
    grid: { width: 300, height: 300, flexDirection: 'row', flexWrap: 'wrap' },
    cell: { width: '33%', height: '33%', borderWidth: 1, borderColor: '#ccc' },
    activeCell: { backgroundColor: '#4caf50' },
    controls: { flexDirection: 'row', gap: 20, marginTop: 40 }
});
