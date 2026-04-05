import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GameContainer } from '../../components/GameContainer';
import { EXERCISE_REGISTRY } from '../../features/engine/Registry';
import { sessionService } from '../../features/engine/SessionService';

function VigilanceBoard({ isPlaying, mode, difficulty, onHit, onMiss, onFalseAlarm }: {
    isPlaying: boolean; mode: string; difficulty: number;
    onHit: (rt: number) => void; onMiss: () => void; onFalseAlarm: () => void;
}) {
    const streams = mode === 'Single' ? [0] : [0, 1, 2, 3];
    const [signals, setSignals] = useState<Record<number, boolean>>({});
    const lastSignalTime = useRef<Record<number, number>>({});
    const isPlayingRef = useRef(isPlaying);
    const tappedRef = useRef<Record<number, boolean>>({});

    useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

    useEffect(() => {
        if (!isPlaying) { setSignals({}); return; }

        const minGap = 2500 - difficulty * 900; // 0→2500ms, 1→1600ms, 2→700ms
        const timers: ReturnType<typeof setTimeout>[] = [];

        const scheduleStream = (id: number) => {
            const delay = Math.random() * 2000 + minGap;
            const showT = setTimeout(() => {
                if (!isPlayingRef.current) return;
                tappedRef.current[id] = false;
                lastSignalTime.current[id] = Date.now();
                setSignals(prev => ({ ...prev, [id]: true }));

                const hideT = setTimeout(() => {
                    setSignals(prev => {
                        if (prev[id] && !tappedRef.current[id]) onMiss();
                        return { ...prev, [id]: false };
                    });
                    if (isPlayingRef.current) scheduleStream(id);
                }, 900);
                timers.push(hideT);
            }, delay);
            timers.push(showT);
        };

        streams.forEach(id => scheduleStream(id));
        return () => timers.forEach(clearTimeout);
    }, [isPlaying, difficulty, mode]);

    const handlePress = (id: number) => {
        if (signals[id]) {
            if (tappedRef.current[id]) return; // already tapped this flash
            tappedRef.current[id] = true;
            onHit(Date.now() - lastSignalTime.current[id]);
            setSignals(prev => ({ ...prev, [id]: false }));
        } else {
            onFalseAlarm();
        }
    };

    return (
        <View style={[styles.grid, mode === 'Single' ? styles.singleGrid : styles.multiGrid]}>
            {streams.map(id => (
                <TouchableOpacity
                    key={id}
                    style={[styles.stream, signals[id] ? styles.active : styles.inactive]}
                    onPress={() => handlePress(id)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.streamLabel}>{signals[id] ? 'TAP!' : '●'}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

export default function VigilanceSentry() {
    const router = useRouter();
    const [hits, setHits] = useState(0);
    const [misses, setMisses] = useState(0);
    const [falseAlarms, setFalseAlarms] = useState(0);
    const [totalRt, setTotalRt] = useState(0);

    const avgRt = hits > 0 ? Math.round(totalRt / hits) : 0;
    const rawScore = Math.max(0, hits * 10 - falseAlarms * 8 - misses * 3);

    return (
        <GameContainer
            config={{ ...EXERCISE_REGISTRY['vigilance_sentry'], params: {} }}
            modes={['Single', 'Multi-Stream']}
            onFinish={async () => {
                await sessionService.saveSession({
                    exerciseId: 'vigilance_sentry',
                    rawScore,
                    normalizedScore: Math.min(100, rawScore),
                    metrics: { hits, misses, false_alarms: falseAlarms, avg_rt: avgRt },
                    durationSeconds: 60,
                });
                router.back();
            }}
        >
            {({ isPlaying, difficulty, mode }) => (
                <View style={styles.board}>
                    <View style={styles.statsRow}>
                        <View style={styles.statBox}>
                            <Text style={styles.statNum}>{hits}</Text>
                            <Text style={styles.statLabel}>Hits</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={[styles.statNum, { color: '#ef9a9a' }]}>{falseAlarms}</Text>
                            <Text style={styles.statLabel}>False Alarms</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statNum}>{avgRt > 0 ? `${avgRt}ms` : '—'}</Text>
                            <Text style={styles.statLabel}>Avg RT</Text>
                        </View>
                    </View>

                    <VigilanceBoard
                        isPlaying={isPlaying}
                        mode={mode ?? 'Single'}
                        difficulty={difficulty}
                        onHit={rt => { setHits(h => h + 1); setTotalRt(t => t + rt); }}
                        onMiss={() => setMisses(m => m + 1)}
                        onFalseAlarm={() => setFalseAlarms(f => f + 1)}
                    />

                    <Text style={styles.hint}>
                        {mode === 'Multi-Stream'
                            ? 'Tap a square ONLY when it flashes red. False taps cost points.'
                            : 'Tap when the square flashes red. Accuracy matters.'}
                    </Text>
                </View>
            )}
        </GameContainer>
    );
}

const styles = StyleSheet.create({
    board: { flex: 1, alignItems: 'center', justifyContent: 'space-evenly', padding: 20 },
    statsRow: { flexDirection: 'row', gap: 24 },
    statBox: { alignItems: 'center' },
    statNum: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
    statLabel: { fontSize: 11, color: '#aaa', marginTop: 2 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    singleGrid: { justifyContent: 'center', alignItems: 'center' },
    multiGrid: { width: 300, justifyContent: 'center' },
    stream: { width: 130, height: 130, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    active: { backgroundColor: '#ef5350' },
    inactive: { backgroundColor: '#37474f' },
    streamLabel: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
    hint: { color: '#888', fontSize: 13, textAlign: 'center', paddingHorizontal: 20 },
});
