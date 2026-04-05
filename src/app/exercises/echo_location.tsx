import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GameContainer } from '../../components/GameContainer';
import { EXERCISE_REGISTRY } from '../../features/engine/Registry';
import { sessionService } from '../../features/engine/SessionService';

const GRID = 3;
const CELL_SIZE = (Dimensions.get('window').width - 80) / GRID;

function EchoBoard({ isPlaying, score, onScore }: any) {
    const theme = useTheme();
    const [phase, setPhase] = useState<'SHOW' | 'RECALL' | 'IDLE'>('IDLE');
    const [targetCells, setTargetCells] = useState<number[]>([]);
    const [selected, setSelected] = useState<number[]>([]);
    const [round, setRound] = useState(1);
    const [feedback, setFeedback] = useState<boolean | null>(null);

    useEffect(() => { if (isPlaying) startRound(1); }, [isPlaying]);

    const startRound = (r: number) => {
        const count = Math.min(r + 1, 5);
        const cells: number[] = [];
        while (cells.length < count) {
            const c = Math.floor(Math.random() * (GRID * GRID));
            if (!cells.includes(c)) cells.push(c);
        }
        setTargetCells(cells);
        setSelected([]);
        setFeedback(null);
        setRound(r);
        setPhase('SHOW');
        setTimeout(() => setPhase('RECALL'), 1500);
    };

    const handleCellPress = (idx: number) => {
        if (phase !== 'RECALL') return;
        const newSelected = selected.includes(idx) ? selected.filter(x => x !== idx) : [...selected, idx];
        setSelected(newSelected);
        if (newSelected.length === targetCells.length) {
            const correct = targetCells.every(c => newSelected.includes(c)) && newSelected.every(c => targetCells.includes(c));
            setFeedback(correct);
            onScore(correct ? round * 5 : -5);
            setTimeout(() => startRound(correct ? round + 1 : Math.max(1, round - 1)), 800);
        }
    };

    if (!isPlaying) return <View />;

    return (
        <View style={styles.board}>
            <Text variant="titleMedium" style={{ marginBottom: 8, color: theme.colors.onBackground }}>
                {phase === 'SHOW' ? 'Memorize the lit cells!' : 'Tap the cells you saw'}
            </Text>
            <Text variant="bodySmall" style={{ color: '#666', marginBottom: 16 }}>Round {round} · Score: {score}</Text>

            <View style={styles.grid}>
                {Array.from({ length: GRID * GRID }).map((_, idx) => {
                    const isTarget = targetCells.includes(idx);
                    const isSelected = selected.includes(idx);
                    let bg = theme.colors.surfaceVariant;
                    if (phase === 'SHOW' && isTarget) bg = '#6200ee';
                    if (phase === 'RECALL' && isSelected) bg = '#2196F3';
                    if (feedback !== null) {
                        if (isTarget) bg = '#4CAF50';
                        else if (isSelected) bg = '#F44336';
                    }
                    return (
                        <TouchableOpacity key={idx} style={[styles.cell, { backgroundColor: bg }]} onPress={() => handleCellPress(idx)} />
                    );
                })}
            </View>
        </View>
    );
}

export default function EchoLocation() {
    const router = useRouter();
    const [score, setScore] = useState(0);
    return (
        <GameContainer config={{ ...EXERCISE_REGISTRY['echo_location'], params: {} }} onFinish={async () => {
            await sessionService.saveSession({ exerciseId: 'echo_location', rawScore: score, normalizedScore: Math.min(score * 5, 100), metrics: { score }, durationSeconds: 60 });
            router.back();
        }}>
            {({ isPlaying }) => <EchoBoard isPlaying={isPlaying} score={score} onScore={(s: number) => setScore(p => p + s)} />}
        </GameContainer>
    );
}

const styles = StyleSheet.create({
    board: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', width: CELL_SIZE * GRID + 6, gap: 3 },
    cell: { width: CELL_SIZE - 3, height: CELL_SIZE - 3, borderRadius: 8 },
});
