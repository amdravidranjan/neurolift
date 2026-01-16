import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, Button, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GameContainer } from '../../components/GameContainer';
import { EXERCISE_REGISTRY } from '../../features/engine/Registry';
import { sessionService } from '../../features/engine/SessionService';
import { ContentGenerator } from '../../features/engine/ContentGenerator';

function ConceptBoard({ isPlaying, difficulty, mode, onScore }: any) {
    const [phase, setPhase] = useState<'LEARN' | 'TEST'>('LEARN');
    const [timeLeft, setTimeLeft] = useState(5);

    // Mode: Symbol Mapping (Learn associations)
    const [map, setMap] = useState<any[]>([]);
    const [testItem, setTestItem] = useState<any>(null);

    // Mode: Category Sprint (Is this X?)
    const [category, setCategory] = useState<string>('');
    const [word, setWord] = useState<string>('');

    useEffect(() => {
        if (isPlaying && map.length === 0 && !category) setup();
    }, [isPlaying, difficulty, mode]);

    const setup = () => {
        if (mode === 'Symbol Mapping') {
            // Generate 3-5 symbols
            const syms = ['Ω', '∑', '≈', '∆', '∫', '¥'];
            const words = ['Human', 'Machine', 'Water', 'Fire', 'Earth', 'Air'];
            const count = 3 + difficulty;

            const newMap: { sym: string, word: string }[] = [];
            for (let i = 0; i < count; i++) {
                newMap.push({ sym: syms[i], word: words[i] });
            }
            setMap(newMap);
            setPhase('LEARN');
            setTimeLeft(5 + (difficulty * 2)); // More time for harder levels

            // Countdown for Learn phase
            const timer = setInterval(() => {
                setTimeLeft(t => {
                    if (t <= 1) {
                        clearInterval(timer);
                        setPhase('TEST');
                        pickTest(newMap);
                        return 0;
                    }
                    return t - 1;
                });
            }, 1000);

        } else {
            // Category Sprint
            setPhase('TEST');
            nextCategorySprint();
        }
    };

    const pickTest = (currentMap: any[]) => {
        const item = currentMap[Math.floor(Math.random() * currentMap.length)];
        setTestItem(item);
    };

    const nextCategorySprint = () => {
        const cats = ['Living', 'Man-made', 'Edible'];
        const target = cats[Math.floor(Math.random() * cats.length)];

        // Generate a word that might or might not encompass it
        // Mock data for speed
        const DATA: any = {
            'Living': ['Tree', 'Dog', 'Bacteria', 'Human'],
            'Man-made': ['Car', 'Computer', 'Brick', 'Paper'],
            'Edible': ['Apple', 'Bread', 'Soup', 'Cake']
        };

        const isMatch = Math.random() > 0.5;
        let w = '';
        if (isMatch) {
            const list = DATA[target];
            w = list[Math.floor(Math.random() * list.length)];
        } else {
            // Pick from others
            const otherCat = cats.filter(c => c !== target)[0];
            const list = DATA[otherCat];
            w = list[Math.floor(Math.random() * list.length)];
        }

        setCategory(target);
        setWord(w);
        // Store if it's a match for checking later? 
        // We'll calculate on the fly or store it in state if complex.
    };

    const handleAnswer = (val: string) => {
        if (mode === 'Symbol Mapping') {
            if (val === testItem.word) {
                onScore(10);
            } else {
                onScore(-5);
            }
            pickTest(map);
        } else {
            // Category Sprint: YES/NO
            // Check match again logic (simplified duplication for reliability)
            const DATA: any = {
                'Living': ['Tree', 'Dog', 'Bacteria', 'Human'],
                'Man-made': ['Car', 'Computer', 'Brick', 'Paper'],
                'Edible': ['Apple', 'Bread', 'Soup', 'Cake']
            };
            const isActuallyMatch = DATA[category]?.includes(word);

            if ((val === 'YES' && isActuallyMatch) || (val === 'NO' && !isActuallyMatch)) {
                onScore(5);
            } else {
                onScore(-2);
            }
            nextCategorySprint();
        }
    };

    if (!isPlaying) return <View />;

    // RENDER
    if (mode === 'Symbol Mapping' && phase === 'LEARN') {
        return (
            <View style={styles.board}>
                <Text variant="headlineMedium">Memorize!</Text>
                <View style={styles.grid}>
                    {map.map((m, i) => (
                        <Surface key={i} style={styles.card} elevation={2}>
                            <Text variant="displaySmall">{m.sym}</Text>
                            <Text variant="bodyLarge">{m.word}</Text>
                        </Surface>
                    ))}
                </View>
                <Text variant="displayLarge" style={{ color: 'red', marginTop: 20 }}>{timeLeft}</Text>
            </View>
        );
    }

    if (mode === 'Symbol Mapping' && phase === 'TEST') {
        return (
            <View style={styles.board}>
                <Text variant="headlineSmall">What represents:</Text>
                <Text variant="displayLarge" style={{ marginVertical: 20 }}>{testItem?.sym}</Text>
                <View style={styles.controls}>
                    {map.map((m, i) => (
                        <Button key={i} mode="contained" onPress={() => handleAnswer(m.word)} style={styles.btn}>
                            {m.word}
                        </Button>
                    ))}
                </View>
            </View>
        );
    }

    // Category Sprint
    return (
        <View style={styles.board}>
            <Text variant="titleMedium">Category:</Text>
            <Text variant="headlineLarge" style={{ fontWeight: 'bold', color: '#6200ee' }}>{category}</Text>

            <Surface style={styles.bigCard} elevation={4}>
                <Text variant="displayMedium">{word}</Text>
            </Surface>

            <View style={styles.controls}>
                <Button mode="contained" buttonColor="green" onPress={() => handleAnswer('YES')} style={styles.btnLarge}>YES</Button>
                <Button mode="contained" buttonColor="red" onPress={() => handleAnswer('NO')} style={styles.btnLarge}>NO</Button>
            </View>
        </View>
    );
}

export default function ConceptSprint() {
    const router = useRouter();
    const [score, setScore] = useState(0);

    return (
        <GameContainer
            config={{ ...EXERCISE_REGISTRY['concept_sprint'], params: {} }}
            modes={['Symbol Mapping', 'Category Sprint']}
            onFinish={async () => {
                await sessionService.saveSession({
                    exerciseId: 'concept_sprint',
                    rawScore: score,
                    normalizedScore: Math.min(score * 5, 100),
                    metrics: { correct: score },
                    durationSeconds: 60
                });
                router.back();
            }}
        >
            {({ isPlaying, difficulty, mode }) => (
                <ConceptBoard
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
    board: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 20 },
    card: { padding: 10, alignItems: 'center', backgroundColor: 'white', borderRadius: 8, minWidth: 80 },
    bigCard: { padding: 40, marginVertical: 40, backgroundColor: 'white', borderRadius: 10, minWidth: 200, alignItems: 'center' },
    controls: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
    btn: { minWidth: 100, margin: 5 },
    btnLarge: { minWidth: 120, height: 50, justifyContent: 'center' }
});
