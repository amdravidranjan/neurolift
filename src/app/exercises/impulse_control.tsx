import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GameContainer } from '../../components/GameContainer';
import { EXERCISE_REGISTRY } from '../../features/engine/Registry';
import { sessionService } from '../../features/engine/SessionService';

interface ImpulseBoardProps {
    isPlaying: boolean;
    settings: any;
    score: number;
    onScore: (s: number) => void;
}

function ImpulseBoard({ isPlaying, settings, score, onScore }: ImpulseBoardProps) {
    const [stimulus, setStimulus] = useState<any>(null); // { text, color, isGo }
    const [state, setState] = useState<'WAIT' | 'ACTIVE'>('WAIT');

    const mode = settings.mode || 'Go/No-Go';
    const ssd = settings.ssd ?? 200; // 0 is valid
    const stopProb = (settings.prob || 30) / 100;

    useEffect(() => {
        let timer: any;
        if (isPlaying && state === 'WAIT') {
            const delay = Math.random() * 1000 + 1000;
            timer = setTimeout(spawn, delay);
        }
        return () => clearTimeout(timer);
    }, [isPlaying, state]);

    const spawn = () => {
        const isStopTrial = Math.random() < stopProb;

        if (mode === 'Stop-Signal (SST)') {
            // SST Logic: Always start with GO
            setStimulus({ text: 'GO!', color: 'green', isGo: true });
            setState('ACTIVE');

            if (isStopTrial) {
                // Schedule STOP signal
                setTimeout(() => {
                    // Check if still active (didn't press yet)
                    // We need a ref or functional update to know if user already pressed?
                    // React state updates might be too slow for ms precision, but for UI feedback it's ok.
                    // Ideally we'd valid this check in the render or ref, but let's try strict state update.
                    setStimulus((prev: any) => {
                        if (!prev) return null; // Already handled
                        return { text: 'STOP!', color: 'red', isGo: false };
                    });
                }, ssd);
            }
        } else {
            // Standard Go/No-Go
            const isGo = !isStopTrial; // 70% Go
            setStimulus({
                text: isGo ? 'GO!' : 'WAIT', // Or STOP
                color: isGo ? 'green' : 'red',
                isGo
            });
            setState('ACTIVE');
        }

        // Response Window / Timeout
        setTimeout(() => {
            handleTimeout();
        }, 1500);
    };

    const handleTimeout = () => {
        setStimulus((prev: any) => {
            if (prev) {
                // If we are here, user didn't press.
                if (prev.isGo) {
                    onScore(-10); // Missed Go
                } else {
                    onScore(10); // Successful Inhibition
                }
            }
            return null;
        });
        setState('WAIT');
    };

    const handlePress = () => {
        if (state !== 'ACTIVE' || !stimulus) return;

        if (stimulus.isGo) {
            onScore(10); // Fast Hit
        } else {
            onScore(-10); // Commission Error (Failed Inhibition)
        }
        setStimulus(null);
        setState('WAIT');
    };

    if (!isPlaying) return <View />;

    return (
        <TouchableOpacity style={styles.board} onPress={handlePress} activeOpacity={1}>
            <Text variant="titleMedium" style={{ position: 'absolute', top: 20, right: 20, color: '#666' }}>Score: {score}</Text>
            {state === 'ACTIVE' && stimulus ? (
                <View style={[styles.signal, { backgroundColor: stimulus.color }]}>
                    <Text style={styles.signalText}>{stimulus.text}</Text>
                    {mode === 'Stop-Signal (SST)' && stimulus.isGo && (
                        <Text style={{ position: 'absolute', bottom: 50, color: 'white' }}>
                            (Be Ready to Stop!)
                        </Text>
                    )}
                </View>
            ) : (
                <Text style={{ opacity: 0.5 }}>Wait for signal...</Text>
            )}
        </TouchableOpacity>
    );
}

export default function ImpulseControl() {
    const router = useRouter();
    const [score, setScore] = useState(0);

    return (
        <GameContainer
            config={{ ...EXERCISE_REGISTRY['impulse_control'], params: {} }}
            modes={['Standard', 'SST']}
            onFinish={async (results) => {
                const finalScore = score; // Use local score
                await sessionService.saveSession({
                    exerciseId: 'impulse_control',
                    rawScore: finalScore,
                    normalizedScore: Math.min(Math.max(finalScore, 0) * 2, 100),
                    metrics: { score: finalScore },
                    durationSeconds: 60
                });
                router.back();
            }}
        >
            {({ isPlaying, customSettings }) => (
                <ImpulseBoard
                    isPlaying={isPlaying}
                    settings={customSettings}
                    score={score}
                    onScore={(s: number) => setScore((prev) => prev + s)}
                />
            )}
        </GameContainer>
    );
}

const styles = StyleSheet.create({
    board: { flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%' },
    signal: { width: 250, height: 250, borderRadius: 125, justifyContent: 'center', alignItems: 'center', elevation: 10 },
    signalText: { fontSize: 40, fontWeight: 'bold', color: 'white' }
});
