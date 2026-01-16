import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Button, Text, Surface, IconButton, Appbar, Avatar, Card, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { EXERCISE_REGISTRY, PILLARS } from '../features/engine/Registry';
import { RadarChart } from '../components/RadarChart';

export default function Page() {
    const router = useRouter();
    const theme = useTheme();
    // In a real app, we'd fetch this from AssessmentEngine/DB
    const [stats, setStats] = useState([
        { label: 'Memory', value: 30, fullMark: 100 },
        { label: 'Inhibition', value: 45, fullMark: 100 },
        { label: 'Speed', value: 60, fullMark: 100 },
        { label: 'Flexibility', value: 20, fullMark: 100 },
        { label: 'Solving', value: 50, fullMark: 100 },
    ]);

    const activeExercises = Object.values(EXERCISE_REGISTRY).filter(e => !e.hidden);
    const pillars = Object.keys(PILLARS);

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <Appbar.Header style={{ backgroundColor: 'transparent' }}>
                <Appbar.Content title="" />
                <Appbar.Action icon="cog" onPress={() => router.push('/settings')} />
            </Appbar.Header>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text variant="displaySmall" style={styles.headerTitle}>NeuroLift</Text>
                    <Text variant="bodyMedium">Cognitive Enhancement Suite</Text>
                </View>

                {/* Status / Radar */}
                <Surface style={styles.statsCard} elevation={2}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <Text variant="titleMedium">Baseline Profile</Text>
                        <Button mode="text" compact onPress={() => router.push('/assessment' as any)}>Retake</Button>
                    </View>
                    <RadarChart data={stats} size={250} />
                </Surface>

                <View style={{ flexDirection: 'row', gap: 10, marginVertical: 20 }}>
                    <Button mode="contained" icon="play" style={{ flex: 1 }} onPress={() => router.push('/exercises/n_back_memory')}>
                        Daily Drill
                    </Button>
                    <Button mode="outlined" style={{ flex: 1 }} onPress={() => router.push('/assessment')}>
                        Assessment
                    </Button>
                </View>

                <Text variant="titleLarge" style={styles.sectionTitle}>Library</Text>

                {pillars.map(pillarKey => {
                    const exercises = activeExercises.filter(e => e.pillarId === pillarKey);
                    if (exercises.length === 0) return null;

                    return (
                        <View key={pillarKey} style={{ marginBottom: 20 }}>
                            <Text variant="titleMedium" style={{ marginBottom: 10, color: '#666' }}>
                                {PILLARS[pillarKey as keyof typeof PILLARS]}
                            </Text>
                            {exercises.map(ex => (
                                <Card key={ex.id} style={styles.card} onPress={() => router.push(`/exercises/${ex.id}` as any)}>
                                    <Card.Title
                                        title={ex.name}
                                        subtitle={ex.description}
                                        left={(props) => <Avatar.Icon {...props} icon="brain" size={40} style={{ backgroundColor: '#e0e0e0' }} />}
                                        right={(props) => <IconButton {...props} icon="chevron-right" />}
                                    />
                                </Card>
                            ))}
                        </View>
                    );
                })}

                <View style={{ height: 50 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        padding: 16,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 40
    },
    headerTitle: {
        fontWeight: 'bold',
        color: '#1a237e'
    },
    statsCard: {
        padding: 20,
        borderRadius: 16,
        backgroundColor: 'white',
        alignItems: 'center',
        marginBottom: 20
    },
    sectionTitle: {
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333'
    },
    card: {
        marginBottom: 8,
        backgroundColor: 'white'
    }
});
