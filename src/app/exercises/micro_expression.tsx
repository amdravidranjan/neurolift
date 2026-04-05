import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GameContainer } from '../../components/GameContainer';
import { EXERCISE_REGISTRY } from '../../features/engine/Registry';
import { sessionService } from '../../features/engine/SessionService';

const EXPRESSIONS = [
    { emoji: '😊', emotion: 'Happy', options: ['Happy', 'Sad', 'Angry', 'Surprised'] },
    { emoji: '😢', emotion: 'Sad', options: ['Sad', 'Happy', 'Fearful', 'Disgusted'] },
    { emoji: '😠', emotion: 'Angry', options: ['Angry', 'Happy', 'Sad', 'Surprised'] },
    { emoji: '😨', emotion: 'Fearful', options: ['Fearful', 'Angry', 'Happy', 'Disgusted'] },
    { emoji: '😲', emotion: 'Surprised', options: ['Surprised', 'Happy', 'Fearful', 'Sad'] },
    { emoji: '🤢', emotion: 'Disgusted', options: ['Disgusted', 'Angry', 'Sad', 'Surprised'] },
    { emoji: '😏', emotion: 'Smug', options: ['Smug', 'Happy', 'Calm', 'Proud'] },
    { emoji: '😔', emotion: 'Melancholic', options: ['Melancholic', 'Happy', 'Angry', 'Calm'] },
    { emoji: '😌', emotion: 'Calm', options: ['Calm', 'Fearful', 'Angry', 'Sad'] },
    { emoji: '🥺', emotion: 'Pleading', options: ['Pleading', 'Happy', 'Angry', 'Disgusted'] },
];

function MicroBoard({ isPlaying, score, onScore, settings }: any) {
    const theme = useTheme();
    const [current, setCurrent] = useState<any>(null);
    const [phase, setPhase] = useState<'FLASH' | 'ANSWER' | 'IDLE'>('IDLE');
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const flashDuration = settings?.flashMs || 500;

    useEffect(() => { if (isPlaying) nextRound(); }, [isPlaying]);

    const nextRound = () => {
        const raw = EXPRESSIONS[Math.floor(Math.random() * EXPRESSIONS.length)];
        const shuffled = { ...raw, options: [...raw.options].sort(() => Math.random() - 0.5) };
        setCurrent(shuffled);
        setPhase('FLASH');
        Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
            Animated.delay(flashDuration),
            Animated.timing(fadeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
        ]).start(() => setPhase('ANSWER'));
    };

    const [answered, setAnswered] = useState(false);

    const handleAnswer = (choice: string) => {
        if (answered) return;
        setAnswered(true);
        if (choice === current.emotion) onScore(10);
        else onScore(-5);
        setTimeout(() => { setAnswered(false); nextRound(); }, 500);
    };

    if (!isPlaying || !current) return <View />;

    return (
        <View style={styles.board}>
            <Text variant="titleMedium" style={{ position: 'absolute', top: 20, right: 20, color: '#666' }}>Score: {score}</Text>

            {phase === 'FLASH' && (
                <Animated.Text style={[styles.emoji, { opacity: fadeAnim }]}>
                    {current.emoji}
                </Animated.Text>
            )}

            {phase === 'ANSWER' && (
                <>
                    <Text variant="titleLarge" style={{ marginBottom: 24, color: theme.colors.onBackground }}>What emotion was that?</Text>
                    <View style={styles.options}>
                        {current.options.map((opt: string) => (
                            <Button key={opt} mode="contained" onPress={() => handleAnswer(opt)}
                                style={styles.optBtn} contentStyle={{ height: 52 }}>
                                {opt}
                            </Button>
                        ))}
                    </View>
                </>
            )}

            {phase === 'IDLE' && <Text>Get ready...</Text>}
        </View>
    );
}

export default function MicroExpression() {
    const router = useRouter();
    const [score, setScore] = useState(0);
    return (
        <GameContainer config={{ ...EXERCISE_REGISTRY['micro_expression'], params: {} }} onFinish={async () => {
            await sessionService.saveSession({ exerciseId: 'micro_expression', rawScore: score, normalizedScore: Math.min(score, 100), metrics: { score }, durationSeconds: 60 });
            router.back();
        }}>
            {({ isPlaying, customSettings }) => (
                <MicroBoard isPlaying={isPlaying} score={score} settings={customSettings} onScore={(s: number) => setScore(p => p + s)} />
            )}
        </GameContainer>
    );
}

const styles = StyleSheet.create({
    board: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
    emoji: { fontSize: 120, textAlign: 'center' },
    options: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
    optBtn: { minWidth: 140, borderRadius: 10 },
});
