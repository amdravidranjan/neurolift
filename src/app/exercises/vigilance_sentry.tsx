import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GameContainer } from '../../components/GameContainer';
import { EXERCISE_REGISTRY } from '../../features/engine/Registry';
import { sessionService } from '../../features/engine/SessionService';

interface VigilanceBoardProps {
    isPlaying: boolean;
    mode: 'Single' | 'Multi-Stream';
    difficulty: number;
    avgRt: number;
    onReact: (timeMs: number) => void;
}

function VigilanceBoard({ isPlaying, mode, difficulty, onReact, avgRt }: VigilanceBoardProps) {
    // Multi-stream: 4 quadrants. 
    // Single: 1 center.
    const streams = mode === 'Single' ? [0] : [0, 1, 2, 3];
    const [signals, setSignals] = useState<Record<number, boolean>>({}); // { streamId: active }
    const lastSignalTime = useRef<Record<number, number>>({});

    useEffect(() => {
        if (!isPlaying) return;

        // Difficulty 0 = Slow (3-5s), 1 = Med (1-3s), 2 = Fast (0.5-1.5s)
        const minGap = 1500 - (difficulty * 500);

        const loops = streams.map(id => {
            const loop = () => {
                const delay = Math.random() * 2000 + minGap;
                return setTimeout(() => {
                    // Trigger Signal
                    setSignals(prev => ({ ...prev, [id]: true }));
                    lastSignalTime.current[id] = Date.now();

                    // Auto-hide after 1s (Missed)
                    setTimeout(() => {
                        setSignals(prev => ({ ...prev, [id]: false }));
                        // Loop again
                        if (isPlaying) loop();
                    }, 1000);
                }, delay);
            };
            return loop();
        });

        return () => loops.forEach(clearTimeout);
    }, [isPlaying, difficulty, mode]);

    const handlePress = (id: number) => {
        if (signals[id]) {
            const rt = Date.now() - lastSignalTime.current[id];
            onReact(rt);
            setSignals(prev => ({ ...prev, [id]: false })); // Feedback
        } else {
            // False Alarm logic (could apply penalty)
        }
    };

    return (
        <View style={styles.board}>
            <View style={{ position: 'absolute', top: 20 }}>
                <Text variant="titleLarge">Avg RT: {avgRt} ms</Text>
            </View>
            <View style={[styles.grid, mode === 'Single' ? styles.singleGrid : styles.multiGrid]}>
                {streams.map(id => (
                    <TouchableOpacity
                        key={id}
                        style={[styles.stream, signals[id] ? styles.active : styles.inactive]}
                        onPress={() => handlePress(id)}
                        activeOpacity={0.8}
                    >
                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                            {signals[id] ? 'SIGNAL!' : '...'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <Text style={{ marginTop: 20 }}>
                {mode === 'Multi-Stream' ? 'Tap ANY quadrant when it turns RED.' : 'Tap center when RED.'}
            </Text>
        </View>
    );
}

export default function VigilanceSentry() {
    const router = useRouter();
    const [rts, setRts] = useState<number[]>([]);

    return (
        <GameContainer
            config={{ ...EXERCISE_REGISTRY['vigilance_sentry'], params: {} }}
            modes={['Single', 'Multi-Stream']}
            onFinish={async () => {
                const avg = rts.length ? rts.reduce((a, b) => a + b, 0) / rts.length : 0;
                await sessionService.saveSession({
                    exerciseId: 'vigilance_sentry',
                    rawScore: Math.floor(avg),
                    normalizedScore: Math.max(0, 100 - (avg / 10)), // Lower RT is better
                    metrics: { avg_rt: avg, count: rts.length },
                    durationSeconds: 60
                });
                router.back();
            }}
        >
            {({ isPlaying, difficulty, mode }) => {
                const avg = rts.length ? Math.round(rts.reduce((a, b) => a + b, 0) / rts.length) : 0;
                return (
                    <VigilanceBoard
                        isPlaying={isPlaying}
                        mode={mode as any}
                        difficulty={difficulty}
                        avgRt={avg}
                        onReact={(rt) => setRts(prev => [...prev, rt])}
                    />
                );
            }}
        </GameContainer>
    );
}

const styles = StyleSheet.create({
    board: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', width: 300, height: 300 },
    singleGrid: { justifyContent: 'center', alignItems: 'center' },
    multiGrid: { justifyContent: 'space-between' },
    stream: { width: 140, height: 140, borderRadius: 10, justifyContent: 'center', alignItems: 'center', margin: 5 },
    active: { backgroundColor: '#f44336' }, // Red alert
    inactive: { backgroundColor: '#4caf50' } // Green safe
});
