import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GameContainer } from '../../components/GameContainer';
import { EXERCISE_REGISTRY } from '../../features/engine/Registry';
import { sessionService } from '../../features/engine/SessionService';

function EchoBoard({ isPlaying, difficulty, mode, onScore }: any) {
    const [sequence, setSequence] = useState<string[]>([]);
    const [playerSeq, setPlayerSeq] = useState<string[]>([]);
    const [phase, setPhase] = useState<'WATCH' | 'PLAY'>('WATCH');
    const [activeRipple, setActiveRipple] = useState<string | null>(null);

    useEffect(() => {
        if (isPlaying && sequence.length === 0) startRound();
    }, [isPlaying, difficulty, mode]);

    const startRound = () => {
        const len = 3 + difficulty;
        const newSeq = [];
        const opts = ['LEFT', 'CENTER', 'RIGHT'];
        for (let i = 0; i < len; i++) {
            newSeq.push(opts[Math.floor(Math.random() * 3)]);
        }
        setSequence(newSeq);
        setPlayerSeq([]);
        setPhase('WATCH');
        playSequence(newSeq);
    };

    const playSequence = (seq: string[]) => {
        let i = 0;
        const interval = setInterval(() => {
            if (i >= seq.length) {
                clearInterval(interval);
                setActiveRipple(null);
                setPhase('PLAY');
                return;
            }
            setActiveRipple(seq[i]);
            setTimeout(() => setActiveRipple(null), 500);
            i++;
        }, 800);
    };

    const handlePress = (side: string) => {
        if (phase !== 'PLAY') return;

        // Immediate Feedback?
        setActiveRipple(side);
        setTimeout(() => setActiveRipple(null), 200);

        const newP = [...playerSeq, side];
        setPlayerSeq(newP);

        // Check so far
        if (newP[newP.length - 1] !== sequence[newP.length - 1]) {
            // Wrong
            onScore(-5);
            setSequence([]); // Reset rounds
        } else {
            if (newP.length === sequence.length) {
                // Correct
                onScore(10 * sequence.length);
                setSequence([]); // Next
            }
        }
    };

    if (!isPlaying) return <View />;

    return (
        <View style={styles.board}>
            <Text variant="headlineSmall" style={{ marginBottom: 20 }}>
                {phase === 'WATCH' ? 'Watch the Echoes...' : 'Repeat the Pattern!'}
            </Text>

            <View style={styles.field}>
                {activeRipple === 'LEFT' && <View style={[styles.ripple, { left: '10%' }]} />}
                {activeRipple === 'RIGHT' && <View style={[styles.ripple, { right: '10%' }]} />}
                {activeRipple === 'CENTER' && <View style={[styles.ripple, { alignSelf: 'center' }]} />}
                <View style={styles.user} />
            </View>

            <View style={styles.controls}>
                <Button mode="contained" onPress={() => handlePress('LEFT')} style={styles.btn}>Left</Button>
                <Button mode="contained" onPress={() => handlePress('CENTER')} style={styles.btn}>Center</Button>
                <Button mode="contained" onPress={() => handlePress('RIGHT')} style={styles.btn}>Right</Button>
            </View>
        </View>
    );
}

export default function EchoLocation() {
    const router = useRouter();
    const [score, setScore] = useState(0);

    return (
        <GameContainer
            config={{ ...EXERCISE_REGISTRY['echo_location'], params: {} }}
            modes={['Spatial Memory']}
            onFinish={async () => {
                await sessionService.saveSession({
                    exerciseId: 'echo_location',
                    rawScore: score,
                    normalizedScore: Math.min(score, 100),
                    metrics: { solved: score },
                    durationSeconds: 60
                });
                router.back();
            }}
        >
            {({ isPlaying, difficulty, mode }) => (
                <EchoBoard
                    isPlaying={isPlaying}
                    difficulty={difficulty}
                    mode={mode}
                    onScore={(s: number) => setScore(prev => prev + s)}
                />
            )}
        </GameContainer>
    );
}

const styles = StyleSheet.create({
    board: { flex: 1, padding: 20, alignItems: 'center' },
    field: { width: '100%', height: 250, backgroundColor: '#121212', marginBottom: 50, borderRadius: 10, justifyContent: 'center', position: 'relative' },
    ripple: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(0, 255, 255, 0.5)', position: 'absolute', top: '30%', borderWidth: 2, borderColor: 'cyan' },
    user: { width: 20, height: 20, backgroundColor: 'white', borderRadius: 10, position: 'absolute', bottom: 10, alignSelf: 'center' },
    controls: { flexDirection: 'row', gap: 20 },
    btn: { minWidth: 80 }
});
