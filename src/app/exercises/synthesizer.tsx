import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GameContainer } from '../../components/GameContainer';
import { EXERCISE_REGISTRY } from '../../features/engine/Registry';
import { sessionService } from '../../features/engine/SessionService';
import { ContentGenerator } from '../../features/engine/ContentGenerator';

function SynthesizerBoard({ isPlaying, difficulty, mode, onScore, score }: any) {
    const [sources, setSources] = useState<string[]>([]);
    const [input, setInput] = useState('');

    useEffect(() => {
        if (isPlaying && sources.length === 0) {
            const count = 2 + difficulty;
            const newSources = [];
            for (let i = 0; i < count; i++) newSources.push(ContentGenerator.generateTextChunk(i));
            setSources(newSources);
        }
    }, [isPlaying, difficulty, mode]);

    const handleSubmit = () => {
        // Mock scoring based on length
        const len = input.length;
        const score = Math.min(100, len); // 1 point per char, cap 100
        onScore(score);
    };

    if (!isPlaying) return <View />;

    return (
        <ScrollView contentContainerStyle={styles.board}>
            <View style={{ alignSelf: 'flex-end', marginBottom: 10 }}>
                <Text variant="titleMedium">Score: {score}</Text>
            </View>
            <Text variant="titleMedium" style={{ marginBottom: 10 }}>Synthesize these {sources.length} sources:</Text>
            <View style={styles.sourceContainer}>
                {sources.map((s, i) => (
                    <Surface key={i} style={styles.sourceCard} elevation={2}>
                        <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Source {i + 1}</Text>
                        <Text numberOfLines={5}>{s}</Text>
                    </Surface>
                ))}
            </View>
            <TextInput
                style={styles.input}
                multiline
                placeholder="Write your summary here..."
                value={input}
                onChangeText={setInput}
            />
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>SUBMIT</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

export default function Synthesizer() {
    const router = useRouter();
    const [score, setScore] = useState(0);

    return (
        <GameContainer
            config={{ ...EXERCISE_REGISTRY['synthesizer'], params: {} }}
            modes={['Summary', 'Comparison']}
            onFinish={async () => {
                await sessionService.saveSession({
                    exerciseId: 'synthesizer',
                    rawScore: score,
                    normalizedScore: Math.min(score, 100),
                    metrics: { length: score },
                    durationSeconds: 60
                });
                router.back();
            }}
        >
            {({ isPlaying, difficulty, mode }) => (
                <SynthesizerBoard
                    isPlaying={isPlaying}
                    difficulty={difficulty}
                    mode={mode}
                    score={score}
                    onScore={(s: number) => setScore(s)}
                />
            )}
        </GameContainer>
    );
}

const styles = StyleSheet.create({
    board: { padding: 20, alignItems: 'center' },
    sourceContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 20 },
    sourceCard: { width: '45%', padding: 10, backgroundColor: '#e3f2fd', borderRadius: 8, marginBottom: 10 },
    input: { width: '100%', minHeight: 100, backgroundColor: 'white', borderColor: '#ccc', borderWidth: 1, padding: 10, borderRadius: 5 },
    submitBtn: { marginTop: 20, backgroundColor: '#6200ee', padding: 15, borderRadius: 25, width: 200, alignItems: 'center' }
});
