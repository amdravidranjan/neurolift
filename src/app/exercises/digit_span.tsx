import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { Text, Button, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GameContainer } from '../../components/GameContainer';
import { EXERCISE_REGISTRY } from '../../features/engine/Registry';
import { sessionService } from '../../features/engine/SessionService';

interface DigitSpanBoardProps {
    isPlaying: boolean;
    settings: any;
    onScore: (s: number) => void;
}

function DigitSpanBoard({ isPlaying, settings, onScore }: DigitSpanBoardProps) {
    const [sequence, setSequence] = useState<number[]>([]);
    const [displayDigit, setDisplayDigit] = useState<number | string | null>(null);
    const [phase, setPhase] = useState<'IDLE' | 'SHOWING' | 'INPUT' | 'FEEDBACK'>('IDLE');
    const [input, setInput] = useState('');
    const [span, setSpan] = useState(3);
    const [feedback, setFeedback] = useState('');

    const isReverse = (settings.mode || 'Forward') === 'Reverse';
    const speed = settings.speed || 1000;

    useEffect(() => {
        if (isPlaying && phase === 'IDLE') {
            startRound();
        }
    }, [isPlaying, phase]);

    const startRound = () => {
        // Generate sequence
        const newSeq = Array.from({ length: span }, () => Math.floor(Math.random() * 10));
        setSequence(newSeq);
        setPhase('SHOWING');
        setInput('');
        setFeedback('');

        // Play Sequence
        let i = 0;
        const interval = setInterval(() => {
            if (i < newSeq.length) {
                setDisplayDigit(newSeq[i]);
                i++;
                // Clear digit shortly after to prevent staring? 
                // Or just show for full duration. Standard is 1s ON, but maybe 500ms ON, 500ms OFF.
            } else {
                clearInterval(interval);
                setDisplayDigit(null);
                setPhase('INPUT');
            }
        }, speed);
    };

    const handleSubmit = () => {
        const target = isReverse ? [...sequence].reverse().join('') : sequence.join('');
        if (input === target) {
            setFeedback('CORRECT!');
            onScore(span * 10);
            setSpan(s => s + 1); // Increase span
            setTimeout(() => setPhase('IDLE'), 1000);
        } else {
            setFeedback(`WRONG! Was: ${target}`);
            setSpan(s => Math.max(3, s - 1)); // Decrease span
            setTimeout(() => setPhase('IDLE'), 2000);
        }
    };

    if (!isPlaying) return <View />;

    return (
        <View style={styles.board}>
            <Text variant="headlineSmall" style={{ marginBottom: 20 }}>
                {isReverse ? "Recall in REVERSE" : "Recall in ORDER"} (Span: {span})
            </Text>

            <Surface style={styles.displayArea} elevation={4}>
                {phase === 'SHOWING' && (
                    <Text style={{ fontSize: 80, fontWeight: 'bold' }}>{displayDigit}</Text>
                )}
                {phase === 'INPUT' && (
                    <Text style={{ fontSize: 30, color: '#666' }}>Your Turn...</Text>
                )}
                {phase === 'FEEDBACK' && (
                    <Text style={{ fontSize: 40, color: 'red' }}>{feedback}</Text>
                )}
            </Surface>

            {phase === 'INPUT' && (
                <View style={styles.inputArea}>
                    <TextInput
                        style={styles.input}
                        value={input}
                        onChangeText={setInput}
                        keyboardType="number-pad"
                        autoFocus
                        placeholder="Type Digits"
                        onSubmitEditing={handleSubmit}
                    />
                    <Button mode="contained" onPress={handleSubmit} style={{ marginTop: 20 }}>
                        Submit
                    </Button>
                </View>
            )}

            {feedback !== '' && <Text style={{ fontSize: 24, marginTop: 20, color: feedback.includes('WRONG') ? 'red' : 'green' }}>{feedback}</Text>}
        </View>
    );
}

export default function DigitSpan() {
    const router = useRouter();

    return (
        <GameContainer
            config={{ ...EXERCISE_REGISTRY['digit_span'], params: {} }}
            onFinish={async (results) => {
                const finalScore = results?.raw || 0;
                await sessionService.saveSession({
                    exerciseId: 'digit_span',
                    rawScore: finalScore,
                    normalizedScore: Math.min(finalScore, 100),
                    metrics: { score: finalScore },
                    durationSeconds: 60
                });
                router.back();
            }}
        >
            {({ isPlaying, customSettings, setScore }) => (
                <DigitSpanBoard
                    isPlaying={isPlaying}
                    settings={customSettings}
                    onScore={(s: number) => setScore((prev: number) => prev + s)}
                />
            )}
        </GameContainer>
    );
}

const styles = StyleSheet.create({
    board: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    displayArea: { width: 200, height: 200, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', borderRadius: 20, marginBottom: 40 },
    inputArea: { width: '80%', alignItems: 'center' },
    input: { width: '100%', height: 60, fontSize: 30, textAlign: 'center', backgroundColor: '#eee', borderRadius: 10 }
});
