import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GameContainer } from '../../components/GameContainer';
import { EXERCISE_REGISTRY } from '../../features/engine/Registry';
import { sessionService } from '../../features/engine/SessionService';
import { ContentGenerator } from '../../features/engine/ContentGenerator';

interface WorkbenchBoardProps {
    isPlaying: boolean;
    settings: any;
    score: number;
    onScore: (s: number) => void;
}

function WorkbenchBoard({ isPlaying, settings, score, onScore }: WorkbenchBoardProps) {
    const [stage, setStage] = useState<'MEMORIZE' | 'MANIPULATE' | 'ANSWER'>('MEMORIZE');
    const [currentNumber, setCurrentNumber] = useState(0);
    const [history, setHistory] = useState<string[]>([]); // "5", "+ 3", "x 2"
    const [stepIndex, setStepIndex] = useState(0);
    const [correctAnswer, setCorrectAnswer] = useState(0);
    const [generatedOptions, setGeneratedOptions] = useState<number[]>([]);

    const totalSteps = settings.steps || 2;
    const speed = settings.speed || 2000;

    useEffect(() => {
        if (isPlaying && stage === 'MEMORIZE' && history.length === 0) {
            startRound();
        }
    }, [isPlaying, stage, history.length]);

    const startRound = () => {
        const startNum = Math.floor(Math.random() * 10) + 1;
        setCurrentNumber(startNum);
        setHistory([String(startNum)]);
        setStepIndex(0);

        // Wait speed then next
        setTimeout(() => {
            setStage('MANIPULATE');
            nextManipulation(startNum, 0);
        }, speed);
    };

    const nextManipulation = (runningTotal: number, currentStep: number) => {
        if (currentStep >= totalSteps) {
            setCorrectAnswer(runningTotal);
            generateOptions(runningTotal);
            setStage('ANSWER');
            return;
        }

        // Generate Op
        const mode = settings.ops || 'Add/Sub';
        let type = 'ADD';

        if (mode === 'Add/Sub') {
            type = Math.random() > 0.5 ? 'ADD' : 'SUB';
        } else if (mode === 'Mixed (X /)') {
            // Only X /
            type = Math.random() > 0.5 ? 'MUL' : 'DIV';
        } else {
            // All: Mixed + - x /
            const r = Math.random();
            if (r < 0.25) type = 'ADD';
            else if (r < 0.5) type = 'SUB';
            else if (r < 0.75) type = 'MUL';
            else type = 'DIV';
        }

        let val = Math.floor(Math.random() * 5) + 1; // Default small

        if (type === 'MUL') {
            val = Math.floor(Math.random() * 3) + 2;
        } else if (type === 'DIV') {
            const divisors = [2, 3, 4, 5].filter(d => runningTotal % d === 0 && runningTotal !== 0);
            if (divisors.length > 0) {
                val = divisors[Math.floor(Math.random() * divisors.length)];
            } else {
                // Fallback to ADD if division impossible
                type = 'ADD';
                val = Math.floor(Math.random() * 5) + 1;
            }
        }

        let nextTotal = runningTotal;
        let opStr = '';

        if (type === 'ADD') { nextTotal += val; opStr = `+ ${val}`; }
        else if (type === 'SUB') { nextTotal -= val; opStr = `- ${val}`; }
        else if (type === 'MUL') { nextTotal *= val; opStr = `× ${val}`; }
        else if (type === 'DIV') { nextTotal /= val; opStr = `÷ ${val}`; }

        setHistory(prev => [...prev, opStr]);
        setCurrentNumber(nextTotal);

        setTimeout(() => {
            nextManipulation(nextTotal, currentStep + 1);
        }, speed);
    };

    const generateOptions = (answer: number) => {
        const opts = new Set<number>();
        opts.add(answer);
        opts.add(answer + 1);
        opts.add(answer - 1);
        opts.add(answer + (Math.random() > 0.5 ? 2 : -2));
        while (opts.size < 4) opts.add(Math.floor(Math.random() * 20)); // Fallback
        setGeneratedOptions(Array.from(opts).sort(() => Math.random() - 0.5));
    };

    const handleAnswer = (val: number) => {
        if (val === correctAnswer) onScore(10);
        else onScore(0);

        setHistory([]);
        setStage('MEMORIZE');
    };

    if (history.length === 0) return <View />;

    return (
        <View style={styles.board}>
            <Text variant="titleMedium" style={{ position: 'absolute', top: 20, right: 20, color: '#666' }}>Score: {score}</Text>
            {stage === 'MEMORIZE' && (
                <View style={{ alignItems: 'center' }}>
                    <Text variant="displayLarge">{history[0]}</Text>
                    <Text variant="titleMedium" style={{ marginTop: 10 }}>Hold this number.</Text>
                </View>
            )}

            {stage === 'MANIPULATE' && (
                <View style={{ alignItems: 'center' }}>
                    {/* Show only the LATEST operation, not history */}
                    <Text variant="displayLarge" style={{ color: '#6200ee', fontWeight: 'bold' }}>
                        {history[history.length - 1]}
                    </Text>
                    <Text variant="bodyLarge">Update your total...</Text>
                </View>
            )}

            {stage === 'ANSWER' && (
                <View style={styles.numpad}>
                    <Text variant="titleMedium" style={{ marginBottom: 20 }}>Final Result?</Text>
                    <View style={styles.options}>
                        {generatedOptions.map((opt, i) => (
                            <Button key={i} mode="contained" onPress={() => handleAnswer(opt)} style={styles.btn}>
                                {opt}
                            </Button>
                        ))}
                    </View>
                </View>
            )}
        </View>
    );
}

export default function MentalWorkbench() {
    const router = useRouter();
    const [score, setScore] = useState(0);

    return (
        <GameContainer
            config={{ ...EXERCISE_REGISTRY['mental_workbench'], params: {} }}
            modes={['Standard']}
            onFinish={async () => {
                await sessionService.saveSession({
                    exerciseId: 'mental_workbench',
                    rawScore: score,
                    normalizedScore: Math.min(score * 5, 100),
                    metrics: { correct: score / 10 },
                    durationSeconds: 60
                });
                router.back();
            }}
        >
            {({ isPlaying, customSettings }) => (
                <WorkbenchBoard
                    isPlaying={isPlaying}
                    settings={customSettings}
                    score={score || 0}
                    onScore={(s: number) => setScore(prev => prev + s)}
                />
            )}
        </GameContainer>
    );
}

const styles = StyleSheet.create({
    board: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    numpad: { alignItems: 'center' },
    options: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
    btn: { margin: 5, minWidth: 80 }
});
