import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, ScrollView } from 'react-native';
import { Text, Button, Chip, Surface, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GameContainer } from '../../components/GameContainer';
import { EXERCISE_REGISTRY } from '../../features/engine/Registry';
import { sessionService } from '../../features/engine/SessionService';

const WORD_POOL = [
    ['Ocean', 'Clock', 'Stranger'], ['Mirror', 'Forest', 'Music'],
    ['Robot', 'Library', 'Storm'], ['Garden', 'Detective', 'Map'],
    ['Castle', 'Scientist', 'Dream'], ['Market', 'Shadow', 'Key'],
    ['Mountain', 'Inventor', 'Fog'], ['Ship', 'Child', 'Secret'],
];

function StoryBoard({ isPlaying, score, onScore }: any) {
    const theme = useTheme();
    const [words, setWords] = useState<string[]>([]);
    const [story, setStory] = useState('');
    const [phase, setPhase] = useState<'WRITE' | 'RATE'>('WRITE');

    useEffect(() => {
        if (isPlaying) {
            setWords(WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)]);
            setStory('');
            setPhase('WRITE');
        }
    }, [isPlaying]);

    const handleSubmit = () => {
        if (story.trim().length < 20) return;
        setPhase('RATE');
    };

    const handleRate = (stars: number) => {
        onScore(stars * 4);
        setWords(WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)]);
        setStory('');
        setPhase('WRITE');
    };

    if (!isPlaying) return <View />;

    if (phase === 'RATE') {
        return (
            <View style={styles.board}>
                <Text variant="headlineMedium" style={{ color: theme.colors.onBackground, marginBottom: 16 }}>Your Story:</Text>
                <Surface style={styles.storyCard} elevation={2}>
                    <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>{story}</Text>
                </Surface>
                <Text variant="titleMedium" style={{ marginTop: 24, marginBottom: 12 }}>Rate your creativity:</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    {[1, 2, 3, 4, 5].map(n => (
                        <Button key={n} mode="outlined" onPress={() => handleRate(n)} style={{ borderRadius: 8 }}>{n}⭐</Button>
                    ))}
                </View>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.board}>
            <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 12 }}>
                Write a sentence connecting all 3 words:
            </Text>
            <View style={styles.wordRow}>
                {words.map(w => <Chip key={w} style={{ backgroundColor: '#6200ee22', margin: 4 }} textStyle={{ color: '#6200ee', fontWeight: 'bold' }}>{w}</Chip>)}
            </View>
            <TextInput
                style={[styles.input, { borderColor: theme.colors.outline, color: theme.colors.onSurface }]}
                placeholder="Write your story here..."
                placeholderTextColor="#aaa"
                value={story}
                onChangeText={setStory}
                multiline
            />
            <Text variant="bodySmall" style={{ color: '#aaa', marginBottom: 12 }}>{story.length} characters</Text>
            <Button mode="contained" onPress={handleSubmit} disabled={story.trim().length < 20} style={{ borderRadius: 10, width: '100%' }}>
                Submit Story
            </Button>
        </ScrollView>
    );
}

export default function StorySpinner() {
    const router = useRouter();
    const [score, setScore] = useState(0);
    return (
        <GameContainer config={{ ...EXERCISE_REGISTRY['story_spinner'], params: {} }} hideTimer hideDifficulty onFinish={async () => {
            await sessionService.saveSession({ exerciseId: 'story_spinner', rawScore: score, normalizedScore: Math.min(score, 100), metrics: { score }, durationSeconds: 60 });
            router.back();
        }}>
            {({ isPlaying }) => <StoryBoard isPlaying={isPlaying} score={score} onScore={(s: number) => setScore(p => p + s)} />}
        </GameContainer>
    );
}

const styles = StyleSheet.create({
    board: { flexGrow: 1, padding: 20, alignItems: 'center', paddingTop: 40 },
    wordRow: { flexDirection: 'row', marginBottom: 20, flexWrap: 'wrap', justifyContent: 'center' },
    input: { width: '100%', height: 150, borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 8, textAlignVertical: 'top' },
    storyCard: { padding: 20, borderRadius: 12, width: '100%', backgroundColor: 'white' },
});
