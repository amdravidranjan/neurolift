import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, ScrollView, Keyboard } from 'react-native';
import { Text, Button, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GameContainer } from '../../components/GameContainer';
import { EXERCISE_REGISTRY } from '../../features/engine/Registry';
import { sessionService } from '../../features/engine/SessionService';

function UsesBoard({ isPlaying, difficulty, mode, onScore, score }: any) {
    const [item, setItem] = useState('');
    const [constraint, setConstraint] = useState<string | null>(null);
    const [input, setInput] = useState('');
    const [uses, setUses] = useState<string[]>([]);

    useEffect(() => {
        if (isPlaying && !item) {
            setup();
        }
    }, [isPlaying, difficulty, mode]);

    const setup = () => {
        const ITEMS = ['Brick', 'Paperclip', 'Spoon', 'Towel', 'Shoe', 'Box', 'Pen'];
        setItem(ITEMS[Math.floor(Math.random() * ITEMS.length)]);

        if (mode === 'Constraints') {
            const CONS = ['Must involve water', 'Must be decorative', 'For a giant', 'Under 5 seconds', 'Silent usage'];
            setConstraint(CONS[Math.floor(Math.random() * CONS.length)]);
        } else {
            setConstraint(null);
        }
        setUses([]);
    };

    const addUse = () => {
        if (input.trim().length > 0) {
            setUses(p => [...p, input]);
            // Mock validation: In real app, AI would validate if it matches constraint
            // Here, we trust the user or just give points for quantity.
            // Constraint mode gets bonus points?
            onScore(1);
            setInput('');
        }
    };

    if (!isPlaying) return <View />;

    return (
        <View style={styles.board}>
            <View style={{ position: 'absolute', top: 20, right: 20 }}>
                <Text variant="titleMedium">Score: {score}</Text>
            </View>
            <Text variant="headlineSmall">How many uses for a:</Text>
            <Text variant="displayLarge" style={{ color: '#6200ee', marginVertical: 10, fontWeight: 'bold' }}>{item}</Text>

            {constraint && (
                <Chip icon="alert" style={{ marginBottom: 20, backgroundColor: '#ffebee' }}>Constraint: {constraint}</Chip>
            )}

            <View style={styles.inputArea}>
                <TextInput
                    style={styles.input}
                    value={input}
                    onChangeText={setInput}
                    placeholder="Type a use..."
                    onSubmitEditing={addUse}
                    autoFocus
                />
                <Button mode="contained" onPress={addUse}>Add</Button>
            </View>

            <ScrollView style={styles.list}>
                {uses.slice().reverse().map((u, i) => (
                    <Text key={i} style={styles.listItem}>• {u}</Text>
                ))}
            </ScrollView>

            <Text style={{ marginTop: 10, color: 'gray' }}>Total: {uses.length}</Text>
            <Button mode="text" onPress={Keyboard.dismiss}>Dismiss Keyboard</Button>
        </View>
    );
}

export default function AlternativeUses() {
    const router = useRouter();
    const [score, setScore] = useState(0);

    return (
        <GameContainer
            config={{ ...EXERCISE_REGISTRY['alternative_uses'], params: {} }}
            modes={['Standard', 'Constraints']}
            onFinish={async () => {
                await sessionService.saveSession({
                    exerciseId: 'alternative_uses',
                    rawScore: score,
                    normalizedScore: Math.min(score * 10, 100),
                    metrics: { uses_generated: score },
                    durationSeconds: 60
                });
                router.back();
            }}
        >
            {({ isPlaying, difficulty, mode }) => (
                <UsesBoard
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
    board: { flex: 1, padding: 20, alignItems: 'center' },
    inputArea: { flexDirection: 'row', width: '100%', gap: 10, marginBottom: 20 },
    input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, backgroundColor: 'white' },
    list: { width: '100%', flex: 1, backgroundColor: '#f9f9f9', padding: 10, borderRadius: 8 },
    listItem: { fontSize: 16, marginVertical: 4 }
});
