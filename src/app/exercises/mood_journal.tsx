import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Surface, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GameContainer } from '../../components/GameContainer';
import { EXERCISE_REGISTRY } from '../../features/engine/Registry';
import { sessionService } from '../../features/engine/SessionService';

function MoodBoard({ isPlaying, difficulty, mode, onScore }: any) {
    const [mood, setMood] = useState<number | null>(null);
    const [selectedPattern, setSelectedPattern] = useState('');

    const PATTERNS = [
        'Anxious -> Calm', 'Energetic -> Tired', 'Focused -> Distracted', 'Steady -> Steady'
    ];

    const handleMood = (m: number) => {
        setMood(m);
        // If Just "Check-in", finish
        if (mode === 'Check-in') {
            // Delay to show selection then finish
            setTimeout(() => onScore(100), 500);
        }
    };

    const handlePattern = (p: string) => {
        setSelectedPattern(p);
        setTimeout(() => onScore(100), 500);
    };

    if (!isPlaying) return <View />;

    if (mode === 'Insight') {
        return (
            <View style={styles.board}>
                <Surface style={styles.card} elevation={2}>
                    <Text variant="titleLarge" style={{ marginBottom: 10 }}>Weekly Insight</Text>
                    <Text variant="bodyLarge">
                        We noticed a pattern: On days you play <Text style={{ fontWeight: 'bold' }}>Shape Crafter</Text>, your mood is 20% higher.
                    </Text>
                    <View style={{ marginTop: 20, flexDirection: 'row', gap: 10 }}>
                        <Chip icon="lightbulb-on">Creative Flow</Chip>
                        <Chip icon="brain">Spatial Activation</Chip>
                    </View>
                </Surface>
                <Button mode="contained" onPress={() => onScore(100)} style={{ marginTop: 20 }}>Acknowledge</Button>
            </View>
        );
    }

    return (
        <View style={styles.board}>
            <Text variant="headlineSmall" style={{ marginBottom: 40 }}>
                {mode === 'Pattern Recognition' ? 'Identify your Energy Trend:' : 'How are you feeling?'}
            </Text>

            {mode === 'Pattern Recognition' ? (
                <View style={{ gap: 10, width: '100%' }}>
                    {PATTERNS.map((p, i) => (
                        <Button key={i} mode={selectedPattern === p ? "contained" : "outlined"} onPress={() => handlePattern(p)}>
                            {p}
                        </Button>
                    ))}
                </View>
            ) : (
                <View style={styles.options}>
                    {['😢', '😕', '😐', '🙂', '😄'].map((emoji, i) => (
                        <Button
                            key={i}
                            mode={mood === i + 1 ? 'contained' : 'outlined'}
                            onPress={() => handleMood(i + 1)}
                            style={{ margin: 5 }}
                        >
                            <Text style={{ fontSize: 24 }}>{emoji}</Text>
                        </Button>
                    ))}
                </View>
            )}
        </View>
    );
}

export default function MoodJournal() {
    const router = useRouter();
    const [score, setScore] = useState(0);

    return (
        <GameContainer
            config={{ ...EXERCISE_REGISTRY['mood_journal'], params: {} }}
            modes={['Check-in', 'Pattern Recognition', 'Insight']}
            hideTimer={true}
            hideDifficulty={true}
            onFinish={async () => {
                await sessionService.saveSession({
                    exerciseId: 'mood_journal',
                    rawScore: 100,
                    normalizedScore: 100,
                    metrics: { completed: 1 },
                    durationSeconds: 60
                });
                router.back();
            }}
        >
            {({ isPlaying, difficulty, mode }) => (
                <MoodBoard
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
    board: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
    options: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' },
    card: { padding: 30, backgroundColor: 'white', borderRadius: 15, width: '100%', alignItems: 'center' }
});
