import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GameContainer } from '../../components/GameContainer';
import { EXERCISE_REGISTRY } from '../../features/engine/Registry';
import { sessionService } from '../../features/engine/SessionService';

function EagleBoard({ isPlaying, difficulty, mode, onFound, score }: any) {
    const [targetPos, setTargetPos] = useState({ top: 0, left: 0 });
    const [distractors, setDistractors] = useState<any[]>([]);

    // Animation for Moving Mode
    const moveAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

    useEffect(() => {
        if (isPlaying) resetRound();
    }, [isPlaying]);

    useEffect(() => {
        if (mode === 'Moving' && isPlaying) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(moveAnim, { toValue: { x: 100, y: 100 }, duration: 2000, useNativeDriver: false }),
                    Animated.timing(moveAnim, { toValue: { x: -100, y: 50 }, duration: 2000, useNativeDriver: false }),
                    Animated.timing(moveAnim, { toValue: { x: 0, y: 0 }, duration: 2000, useNativeDriver: false })
                ])
            ).start();
        } else {
            moveAnim.setValue({ x: 0, y: 0 }); // Reset
        }
    }, [mode, isPlaying]);

    const resetRound = () => {
        setTargetPos({
            top: Math.random() * 250,
            left: Math.random() * 250
        });
        // Distractors (Clutter) - Difficulty increases count
        const count = 10 + (difficulty * 20);
        const d = [];
        for (let i = 0; i < count; i++) {
            d.push({ top: Math.random() * 280, left: Math.random() * 280, label: 'O' }); // Close to 'Q'
        }
        setDistractors(d);
    };

    const handlePress = (isTarget: boolean) => {
        if (isTarget) {
            onFound();
            resetRound();
        }
    };

    return (
        <View style={styles.board}>
            <Text variant="titleMedium" style={{ position: 'absolute', top: 20, right: 20, color: '#666' }}>Score: {score}</Text>
            <View style={styles.field}>
                {distractors.map((d, i) => (
                    <Text key={i} style={[styles.item, { top: d.top, left: d.left }]}>{d.label}</Text>
                ))}

                {/* Target */}
                <Animated.View style={{
                    position: 'absolute',
                    top: targetPos.top, left: targetPos.left,
                    transform: mode === 'Moving' ? moveAnim.getTranslateTransform() : []
                }}>
                    <TouchableOpacity onPress={() => handlePress(true)} style={styles.targetArea}>
                        <Text style={[styles.item]}>Q</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
            <Text style={{ marginTop: 20 }}>Find the 'Q' among 'O's!</Text>
        </View>
    );
}

export default function EagleEye() {
    const router = useRouter();
    const [score, setScore] = useState(0);

    return (
        <GameContainer
            config={{ ...EXERCISE_REGISTRY['eagle_eye'], params: {} }}
            modes={['Standard', 'Moving', 'Cluttered']}
            onFinish={async () => {
                await sessionService.saveSession({
                    exerciseId: 'eagle_eye',
                    rawScore: score,
                    normalizedScore: Math.min(score * 10, 100),
                    metrics: { found: score },
                    durationSeconds: 60
                });
                router.back();
            }}
        >
            {({ isPlaying, difficulty, mode }) => (
                <EagleBoard
                    isPlaying={isPlaying}
                    difficulty={difficulty}
                    mode={mode}
                    score={score}
                    onFound={() => setScore(s => s + 1)}
                />
            )}
        </GameContainer>
    );
}

const styles = StyleSheet.create({
    board: { flex: 1, alignItems: 'center' },
    field: { width: 300, height: 300, backgroundColor: '#eee', position: 'relative', overflow: 'hidden' },
    item: { position: 'absolute', fontSize: 20, fontWeight: 'bold' },
    targetArea: { padding: 10 } // Larger hit area
});
