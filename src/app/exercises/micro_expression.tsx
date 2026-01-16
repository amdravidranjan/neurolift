import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GameContainer } from '../../components/GameContainer';
import { EXERCISE_REGISTRY } from '../../features/engine/Registry';
import { sessionService } from '../../features/engine/SessionService';

function MicroBoard({ isPlaying, difficulty, mode, onScore }: any) {
    const [phase, setPhase] = useState<'WAIT' | 'FLASH' | 'MASK' | 'ANSWER'>('WAIT');
    const [emotion, setEmotion] = useState('');

    useEffect(() => {
        if (isPlaying && phase === 'WAIT') nextRound();
    }, [isPlaying, difficulty, mode, phase]);

    const nextRound = () => {
        const emotions = ['Happy', 'Sad', 'Angry', 'Surprise', 'Fear', 'Disgust'];
        const e = emotions[Math.floor(Math.random() * emotions.length)];
        setEmotion(e);

        // Random Wait
        setTimeout(() => {
            setPhase('FLASH');
            // Flash Duration: 200ms (Micro) -> 500ms (Easy)
            const duration = difficulty === 0 ? 500 : (difficulty === 1 ? 300 : 150);

            setTimeout(() => {
                setPhase('MASK');
                setTimeout(() => {
                    setPhase('ANSWER');
                }, 100); // Short mask
            }, duration);
        }, 1000);
    };

    const handleAnswer = (ans: string) => {
        if (ans === emotion) onScore(10);
        else onScore(-5);

        setPhase('WAIT');
    };

    if (!isPlaying) return <View />;

    // Emojis mapping
    const FACE_MAP: any = {
        'Happy': '😊', 'Sad': '😢', 'Angry': '😠', 'Surprise': '😲', 'Fear': '😱', 'Disgust': '🤢'
    };

    return (
        <View style={styles.board}>
            <Surface style={styles.faceCard} elevation={4}>
                {phase === 'FLASH' ? (
                    <Text style={{ fontSize: 100 }}>{FACE_MAP[emotion]}</Text>
                ) : phase === 'ANSWER' ? (
                    <Text style={{ fontSize: 40 }}>?</Text>
                ) : (
                    <Text>...</Text>
                )}
            </Surface>

            {phase === 'ANSWER' && (
                <View style={styles.options}>
                    {['Happy', 'Sad', 'Angry', 'Surprise', 'Fear', 'Disgust'].map(e => (
                        <TouchableOpacity key={e} style={styles.btn} onPress={() => handleAnswer(e)}>
                            <Text style={styles.btnText}>{e}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
}

export default function MicroExpressionTrainer() {
    const router = useRouter();
    const [score, setScore] = useState(0);

    return (
        <GameContainer
            config={{ ...EXERCISE_REGISTRY['micro_expression_trainer'], params: {} }}
            modes={['Standard', 'Flash Mode']}
            onFinish={async () => {
                await sessionService.saveSession({
                    exerciseId: 'micro_expression_trainer',
                    rawScore: score,
                    normalizedScore: Math.min(score * 2, 100),
                    metrics: { correct: score / 10 },
                    durationSeconds: 60
                });
                router.back();
            }}
        >
            {({ isPlaying, difficulty, mode }) => (
                <MicroBoard
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
    board: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    faceCard: { width: 200, height: 200, alignItems: 'center', justifyContent: 'center', marginBottom: 40, borderRadius: 20, backgroundColor: 'white' },
    options: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', width: 300 },
    btn: { padding: 15, backgroundColor: '#6200ee', borderRadius: 8, minWidth: 80, alignItems: 'center' },
    btnText: { color: 'white', fontWeight: 'bold' }
});
