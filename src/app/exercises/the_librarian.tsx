import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GameContainer } from '../../components/GameContainer';
import { EXERCISE_REGISTRY } from '../../features/engine/Registry';
import { sessionService } from '../../features/engine/SessionService';
import { ContentGenerator } from '../../features/engine/ContentGenerator';

function LibrarianBoard({ isPlaying, difficulty, mode, onScore, score }: any) {
    const [currentWord, setCurrentWord] = useState<{ word: string, cat: string } | null>(null);
    const [activeCats, setActiveCats] = useState<string[]>([]);

    useEffect(() => {
        if (isPlaying && activeCats.length === 0) setup();
    }, [isPlaying, difficulty, mode]);

    const setup = () => {
        // Select 2-3 categories
        const cats = ['Fruit', 'Furniture', 'City', 'Animal', 'Profession'];
        const playCats = cats.sort(() => Math.random() - 0.5).slice(0, mode === 'Advanced' ? 3 : 2);
        setActiveCats(playCats);
        nextWord(playCats);
    };

    const nextWord = (cats: string[]) => {
        // Generate word from one of the active categories
        const targetCat = cats[Math.floor(Math.random() * cats.length)];
        // Mock DB
        const WORDS: any = {
            'Fruit': ['Apple', 'Banana', 'Lime', 'Mango'],
            'Furniture': ['Chair', 'Desk', 'Sofa', 'Bed'],
            'City': ['Paris', 'London', 'Tokyo', 'Rome'],
            'Animal': ['Dog', 'Cat', 'Lion', 'Eagle'],
            'Profession': ['Doctor', 'Artist', 'Coder', 'Chef']
        };

        const list = WORDS[targetCat];
        const val = list[Math.floor(Math.random() * list.length)];
        setCurrentWord({ word: val, cat: targetCat });
    };

    const handleSort = (cat: string) => {
        if (!currentWord) return;

        if (cat === currentWord.cat) {
            onScore(1);
        } else {
            onScore(-1); // Penalty
        }
        nextWord(activeCats);
    };

    if (!currentWord) return <Text>Opening Books...</Text>;

    return (
        <View style={styles.board}>
            <View style={{ position: 'absolute', top: 20, right: 20 }}>
                <Text variant="titleMedium" style={{ color: '#666' }}>Score: {score}</Text>
            </View>
            <Surface style={styles.card} elevation={4}>
                <Text variant="displaySmall" style={{ fontWeight: 'bold' }}>{currentWord.word}</Text>
            </Surface>

            <Text style={{ marginVertical: 30 }}>File under:</Text>

            <View style={styles.shelves}>
                {activeCats.map((cat, i) => (
                    <TouchableOpacity key={i} style={styles.shelfBtn} onPress={() => handleSort(cat)}>
                        <Text style={styles.shelfText}>{cat}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

export default function TheLibrarian() {
    const router = useRouter();
    const [score, setScore] = useState(0);

    return (
        <GameContainer
            config={{ ...EXERCISE_REGISTRY['the_librarian'], params: {} }}
            modes={['Sorting', 'Advanced']}
            onFinish={async () => {
                await sessionService.saveSession({
                    exerciseId: 'the_librarian',
                    rawScore: score,
                    normalizedScore: Math.min(score * 5, 100),
                    metrics: { correct: score },
                    durationSeconds: 60
                });
                router.back();
            }}
        >
            {({ isPlaying, difficulty, mode }) => (
                <LibrarianBoard
                    isPlaying={isPlaying}
                    difficulty={difficulty}
                    mode={mode}
                    score={score}
                    onScore={(s: number) => setScore(prev => prev + s)}
                />
            )}
        </GameContainer>
    );
}

const styles = StyleSheet.create({
    board: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    card: { padding: 40, backgroundColor: 'white', borderRadius: 10, marginBottom: 20, minWidth: 200, alignItems: 'center' },
    shelves: { flexDirection: 'row', gap: 20, flexWrap: 'wrap', justifyContent: 'center' },
    shelfBtn: { padding: 20, backgroundColor: '#795548', borderRadius: 5, width: 120, alignItems: 'center' },
    shelfText: { color: 'white', fontWeight: 'bold' }
});
