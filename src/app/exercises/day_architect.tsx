import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Button, Checkbox, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GameContainer } from '../../components/GameContainer';
import { EXERCISE_REGISTRY } from '../../features/engine/Registry';
import { sessionService } from '../../features/engine/SessionService';

function DayBoard({ isPlaying, difficulty, mode, onScore }: any) {
    const [tasks, setTasks] = useState([
        { id: 1, text: 'Morning Exercise', checked: false, priority: 1 },
        { id: 2, text: 'Deep Work Block', checked: false, priority: 2 },
        { id: 3, text: 'Social Connection', checked: false, priority: 3 },
        { id: 4, text: 'Read 10 Pages', checked: false, priority: 4 },
    ]);

    // Optimize Mode State
    const [optList, setOptList] = useState<any[]>([]);

    useEffect(() => {
        if (isPlaying && mode === 'Schedule Optimizer' && optList.length === 0) {
            setupOptimizer();
        }
    }, [isPlaying, difficulty, mode]);

    const setupOptimizer = () => {
        const events = [
            { id: 1, text: 'High Focus Work', energy: 'High' },
            { id: 2, text: 'Email/Admin', energy: 'Low' },
            { id: 3, text: 'Creative Storming', energy: 'High' },
            { id: 4, text: 'Nap', energy: 'Recharge' }
        ];
        setOptList(events.sort(() => Math.random() - 0.5));
    };

    const moveUp = (index: number) => {
        if (index === 0) return;
        const n = [...optList];
        [n[index], n[index - 1]] = [n[index - 1], n[index]];
        setOptList(n);
    };

    const toggle = (id: number) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, checked: !t.checked } : t));
    };

    if (!isPlaying) return <View />;

    if (mode === 'Schedule Optimizer') {
        return (
            <View style={styles.board}>
                <Text variant="titleMedium" style={{ marginBottom: 20 }}>Order by Energy (Highest First):</Text>
                {optList.map((item, i) => (
                    <TouchableOpacity key={item.id} onPress={() => moveUp(i)}>
                        <Surface style={styles.taskCard} elevation={2}>
                            <Text variant="bodyLarge">{item.text} ({item.energy})</Text>
                            <Text variant="labelSmall">Tap to move up</Text>
                        </Surface>
                    </TouchableOpacity>
                ))}
                <Button mode="contained" onPress={() => onScore(100)} style={{ marginTop: 20 }}>Submit Schedule</Button>
            </View>
        );
    }

    return (
        <View style={styles.board}>
            <Text variant="headlineSmall" style={{ marginBottom: 20 }}>Plan Your Day</Text>
            <ScrollView>
                {tasks.map(t => (
                    <View key={t.id} style={styles.row}>
                        <Checkbox status={t.checked ? 'checked' : 'unchecked'} onPress={() => toggle(t.id)} />
                        <Text variant="bodyLarge">{t.text}</Text>
                    </View>
                ))}
            </ScrollView>
            <Button mode="contained" onPress={() => onScore(tasks.filter(t => t.checked).length)} style={{ marginTop: 20 }}>Commit</Button>
        </View>
    );
}

export default function DayArchitect() {
    const router = useRouter();
    const [score, setScore] = useState(0);

    return (
        <GameContainer
            config={{ ...EXERCISE_REGISTRY['day_architect'], params: {} }}
            modes={['Planner', 'Schedule Optimizer']}
            hideTimer={true}
            hideDifficulty={true}
            onFinish={async () => {
                await sessionService.saveSession({
                    exerciseId: 'day_architect',
                    rawScore: score,
                    normalizedScore: Math.min(score * 25, 100),
                    metrics: { tasks_completed: score },
                    durationSeconds: 60
                });
                router.back();
            }}
        >
            {({ isPlaying, difficulty, mode }) => (
                <DayBoard
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
    board: { flex: 1, padding: 20 },
    row: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
    taskCard: { padding: 15, marginVertical: 5, backgroundColor: 'white', borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }
});
