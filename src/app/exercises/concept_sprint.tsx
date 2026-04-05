import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Surface, useTheme, ProgressBar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GameContainer } from '../../components/GameContainer';
import { EXERCISE_REGISTRY } from '../../features/engine/Registry';
import { sessionService } from '../../features/engine/SessionService';

const PAIRS = [
    { symbol: '⬛', concept: 'Night' }, { symbol: '🔺', concept: 'Danger' },
    { symbol: '💧', concept: 'Calm' }, { symbol: '⚡', concept: 'Speed' },
    { symbol: '🌀', concept: 'Chaos' }, { symbol: '🔒', concept: 'Safety' },
    { symbol: '🌱', concept: 'Growth' }, { symbol: '🔥', concept: 'Energy' },
    { symbol: '⭐', concept: 'Excellence' }, { symbol: '🌊', concept: 'Flow' },
];

type Phase = 'LEARN' | 'TEST';

function ConceptBoard({ isPlaying, score, onScore }: any) {
    const theme = useTheme();
    const [phase, setPhase] = useState<Phase>('LEARN');
    const [learnIdx, setLearnIdx] = useState(0);
    const [batch, setBatch] = useState<typeof PAIRS>([]);
    const [question, setQuestion] = useState<typeof PAIRS[0] | null>(null);
    const [options, setOptions] = useState<string[]>([]);
    const [answered, setAnswered] = useState<string | null>(null);
    const BATCH_SIZE = 3;

    useEffect(() => {
        if (isPlaying) startBatch();
    }, [isPlaying]);

    const startBatch = () => {
        const shuffled = [...PAIRS].sort(() => Math.random() - 0.5).slice(0, BATCH_SIZE);
        setBatch(shuffled);
        setLearnIdx(0);
        setPhase('LEARN');
    };

    const nextLearn = () => {
        if (learnIdx + 1 < batch.length) setLearnIdx(l => l + 1);
        else startTest(batch);
    };

    const startTest = (b: typeof PAIRS) => {
        const q = b[Math.floor(Math.random() * b.length)];
        setQuestion(q);
        const distractors = PAIRS.filter(p => p.concept !== q.concept).sort(() => Math.random() - 0.5).slice(0, 3).map(p => p.concept);
        setOptions([q.concept, ...distractors].sort(() => Math.random() - 0.5));
        setAnswered(null);
        setPhase('TEST');
    };

    const handleAnswer = (choice: string) => {
        setAnswered(choice);
        if (question && choice === question.concept) onScore(10);
        else onScore(-5);
        setTimeout(() => startBatch(), 800);
    };

    if (!isPlaying || batch.length === 0) return <View />;

    if (phase === 'LEARN') {
        const current = batch[learnIdx];
        return (
            <View style={styles.board}>
                <Text variant="labelMedium" style={{ color: '#aaa', marginBottom: 20 }}>LEARN · {learnIdx + 1}/{batch.length}</Text>
                <ProgressBar progress={(learnIdx + 1) / batch.length} color="#6200ee" style={styles.progress} />
                <Surface style={styles.card} elevation={3}>
                    <Text style={{ fontSize: 80, textAlign: 'center' }}>{current.symbol}</Text>
                    <Text variant="displaySmall" style={{ textAlign: 'center', color: '#6200ee', fontWeight: 'bold', marginTop: 16 }}>
                        {current.concept}
                    </Text>
                </Surface>
                <Button mode="contained" onPress={nextLearn} style={styles.btn} contentStyle={{ height: 52 }}>
                    {learnIdx + 1 < batch.length ? 'Next →' : 'Start Quiz!'}
                </Button>
            </View>
        );
    }

    if (phase === 'TEST' && question) {
        return (
            <View style={styles.board}>
                <Text variant="titleLarge" style={{ marginBottom: 8, color: theme.colors.onBackground }}>Score: {score}</Text>
                <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 20 }}>What does this symbol mean?</Text>
                <Text style={{ fontSize: 80, marginBottom: 24 }}>{question.symbol}</Text>
                <View style={styles.options}>
                    {options.map(opt => {
                        let col = theme.colors.primary;
                        if (answered) col = opt === question.concept ? '#4CAF50' : opt === answered ? '#F44336' : '#aaa';
                        return (
                            <Button key={opt} mode="contained" onPress={() => !answered && handleAnswer(opt)}
                                style={[styles.optBtn, { backgroundColor: col }]}>
                                {opt}
                            </Button>
                        );
                    })}
                </View>
            </View>
        );
    }

    return <View />;
}

export default function ConceptSprint() {
    const router = useRouter();
    const [score, setScore] = useState(0);
    return (
        <GameContainer config={{ ...EXERCISE_REGISTRY['concept_sprint'], params: {} }} onFinish={async () => {
            await sessionService.saveSession({ exerciseId: 'concept_sprint', rawScore: score, normalizedScore: Math.min(score, 100), metrics: { score }, durationSeconds: 60 });
            router.back();
        }}>
            {({ isPlaying }) => <ConceptBoard isPlaying={isPlaying} score={score} onScore={(s: number) => setScore(p => p + s)} />}
        </GameContainer>
    );
}

const styles = StyleSheet.create({
    board: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
    card: { padding: 40, borderRadius: 20, width: '100%', alignItems: 'center', backgroundColor: 'white', marginBottom: 32 },
    btn: { width: '100%', borderRadius: 10 },
    progress: { width: '100%', height: 6, borderRadius: 3, marginBottom: 24 },
    options: { width: '100%', gap: 12 },
    optBtn: { borderRadius: 10 },
});
