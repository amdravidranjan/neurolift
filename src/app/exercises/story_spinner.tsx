import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, ScrollView, Keyboard } from 'react-native';
import { Text, Button, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GameContainer } from '../../components/GameContainer';
import { EXERCISE_REGISTRY } from '../../features/engine/Registry';
import { sessionService } from '../../features/engine/SessionService';

function StoryBoard({ isPlaying, difficulty, mode, onScore, score }: any) {
    const [prompts, setPrompts] = useState<string[]>([]);
    const [story, setStory] = useState('');
    const [genre, setGenre] = useState('');

    useEffect(() => {
        if (isPlaying && prompts.length === 0) setup();
    }, [isPlaying, difficulty, mode]);

    const setup = () => {
        if (mode === 'Genre Mode') {
            const genres = ['Sci-Fi', 'Fantasy', 'Noir', 'Comedy', 'Horror'];
            const g = genres[Math.floor(Math.random() * genres.length)];
            setGenre(g);

            // Mock content generator
            const PROMPTS: any = {
                'Sci-Fi': ['Spaceship', 'AI', 'Nebula'],
                'Fantasy': ['Dragon', 'Sword', 'Magic'],
                'Noir': ['Rain', 'Detective', 'Shadow'],
                'Comedy': ['Banana', 'Clown', 'Pie'],
                'Horror': ['Ghost', 'Attic', 'Whisper']
            };
            setPrompts(PROMPTS[g]);
        } else {
            // Standard Random
            setPrompts(['Key', 'Door', 'Future']);
        }
    };

    const submit = () => {
        if (story.length > 50) onScore(100);
        else onScore(50);
        Keyboard.dismiss();
    };

    if (!isPlaying) return <View />;

    return (
        <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.board}>
                <View style={{ position: 'absolute', top: 10, right: 20 }}>
                    <Text variant="titleMedium">Score: {score}</Text>
                </View>
                <Text variant="headlineSmall" style={{ marginTop: 20 }}>Write a story!</Text>

                {genre ? <Chip icon="book" style={{ marginVertical: 10, backgroundColor: '#e3f2fd' }}>{genre}</Chip> : null}

                <View style={styles.promptBox}>
                    {prompts.map((w, i) => (
                        <Chip key={i} style={styles.chip}>{w}</Chip>
                    ))}
                </View>

                <TextInput
                    style={styles.input}
                    multiline
                    placeholder="Once upon a time..."
                    value={story}
                    onChangeText={setStory}
                />

                <Button mode="contained" onPress={submit} style={{ marginTop: 20 }}>
                    Publish Story ({story.length} chars)
                </Button>
            </View>
        </ScrollView>
    );
}

export default function StorySpinner() {
    const router = useRouter();
    const [score, setScore] = useState(0);

    return (
        <GameContainer
            config={{ ...EXERCISE_REGISTRY['story_spinner'], params: {} }}
            modes={['Standard', 'Genre Mode']}
            onFinish={async () => {
                await sessionService.saveSession({
                    exerciseId: 'story_spinner',
                    rawScore: score,
                    normalizedScore: Math.min(score, 100),
                    metrics: { length: score },
                    durationSeconds: 60
                });
                router.back();
            }}
        >
            {({ isPlaying, difficulty, mode }) => (
                <StoryBoard
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
    scroll: { flexGrow: 1 },
    board: { padding: 20, alignItems: 'center' },
    promptBox: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginVertical: 20, justifyContent: 'center' },
    chip: { backgroundColor: '#fff9c4' },
    input: { width: '100%', height: 200, borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10, textAlignVertical: 'top', backgroundColor: 'white' }
});
