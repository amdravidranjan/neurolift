import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Image } from 'react-native';
import { Button, Text, Surface, IconButton, Appbar, Avatar, Card, Snackbar, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { EXERCISE_REGISTRY, PILLARS } from '../features/engine/Registry';
import { RadarChart } from '../components/RadarChart';
import { XPBar } from '../components/XPBar';
import { DailyChallengeCard } from '../components/DailyChallengeCard';
import { performanceService, RADAR_AXES } from '../features/engine/PerformanceService';
import { analyticsService } from '../features/analytics/AnalyticsService';
import { streakService } from '../features/analytics/StreakService';
import { achievementService } from '../features/engine/AchievementService';
import { sessionService } from '../features/engine/SessionService';

const PILLAR_COLORS: Record<string, string> = {
    attention: '#4FC3F7', memory: '#81C784', language: '#A5D6A7', executive: '#FFB74D',
    reasoning: '#CE93D8', learning: '#80DEEA', creativity: '#F48FB1', social: '#FFD54F',
    metacognition: '#BCAAA4', sensory: '#90CAF9', processing_speed: '#EF9A9A',
    calm: '#B0BEC5', adaptability: '#A5D6A7',
};

export default function Page() {
    const router = useRouter();
    const theme = useTheme();

    const [stats, setStats] = useState(RADAR_AXES.map(label => ({ label, value: 0, fullMark: 100 })));
    const [totalXP, setTotalXP] = useState(0);
    const [streak, setStreak] = useState(0);
    const [dailyExerciseId, setDailyExerciseId] = useState<string | null>(null);
    const [dailyDone, setDailyDone] = useState(false);
    const [recentActivity, setRecentActivity] = useState<{ name: string; score: number; time: string }[]>([]);
    const [snackMessage, setSnackMessage] = useState('');

    const activeExercises = Object.values(EXERCISE_REGISTRY).filter(e => !e.hidden);
    const pillars = Object.keys(PILLARS);

    const loadData = useCallback(async () => {
        const [radarScores, xp, currentStreak, dailyId, isDone, recentSessions] = await Promise.all([
            performanceService.getPillarScores(),
            analyticsService.getTotalXP(),
            streakService.calculateStreak(),
            performanceService.getDailyChallengeExerciseId(),
            achievementService.isDailyChallengeCompleted(),
            sessionService.getRecentSessions(3),
        ]);

        setStats(radarScores.map(p => ({ label: p.label, value: p.value, fullMark: 100 })));
        setTotalXP(xp);
        setStreak(currentStreak);
        setDailyExerciseId(dailyId);
        setDailyDone(isDone);

        // Build recent activity from DB — sessions don't store exerciseId directly, so we pull scores
        const allScores = await analyticsService.getAllScores();
        const latest = allScores
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 3)
            .map(s => ({
                name: EXERCISE_REGISTRY[s.exerciseId]?.name ?? s.exerciseId,
                score: s.normalizedScore,
                time: new Date(s.createdAt).toLocaleDateString(),
            }));
        setRecentActivity(latest);
    }, []);

    useFocusEffect(loadData);

    const handleDailyChallenge = async () => {
        if (!dailyExerciseId) return;
        await achievementService.markDailyChallengeCompleted();
        setDailyDone(true);
        router.push(`/exercises/${dailyExerciseId}` as any);
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <Appbar.Header style={{ backgroundColor: 'transparent' }}>
                <Appbar.Content title="NeuroLift" titleStyle={{ fontWeight: 'bold' }} />
                <Appbar.Action icon="chart-line" onPress={() => router.push('/analytics' as any)} />
                <Appbar.Action icon="cog" onPress={() => router.push('/settings')} />
            </Appbar.Header>

            <XPBar totalXP={totalXP} streak={streak} />

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Hero Banner */}
                <Image
                    source={require('../../assets/images/logo_brain.jpg')}
                    style={styles.heroBanner}
                    resizeMode="cover"
                />

                {/* Daily Challenge */}
                {dailyExerciseId && (
                    <DailyChallengeCard
                        exerciseName={EXERCISE_REGISTRY[dailyExerciseId]?.name ?? 'Challenge'}
                        pillarLabel={PILLARS[EXERCISE_REGISTRY[dailyExerciseId]?.pillarId as keyof typeof PILLARS] ?? ''}
                        completed={dailyDone}
                        onPress={handleDailyChallenge}
                    />
                )}

                {/* Radar Chart */}
                <Surface style={[styles.statsCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>Cognitive Profile</Text>
                        <Button mode="text" compact onPress={() => router.push('/assessment' as any)}>Assess</Button>
                    </View>
                    <RadarChart data={stats} size={250} />
                </Surface>

                {/* Recent Activity */}
                {recentActivity.length > 0 && (
                    <View style={styles.section}>
                        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
                            Recent Activity
                        </Text>
                        {recentActivity.map((item, i) => (
                            <View key={i} style={[styles.activityRow, { borderBottomColor: theme.colors.outlineVariant }]}>
                                <Text style={{ flex: 1, color: theme.colors.onSurface }}>{item.name}</Text>
                                <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>{item.score}</Text>
                                <Text style={{ color: theme.colors.onSurfaceVariant, marginLeft: 10, fontSize: 12 }}>{item.time}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Assessment */}
                <Button
                    mode="outlined"
                    icon="clipboard-check"
                    style={{ marginVertical: 12 }}
                    onPress={() => router.push('/assessment')}
                >
                    Full Assessment
                </Button>

                {/* Exercise Library */}
                <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>Library</Text>

                {pillars.map(pillarKey => {
                    const exercises = activeExercises.filter(e => e.pillarId === pillarKey);
                    if (exercises.length === 0) return null;
                    const accentColor = PILLAR_COLORS[pillarKey] ?? theme.colors.primary;

                    return (
                        <View key={pillarKey} style={{ marginBottom: 20 }}>
                            <View style={styles.pillarHeader}>
                                <View style={[styles.pillarDot, { backgroundColor: accentColor }]} />
                                <Text variant="titleSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                    {PILLARS[pillarKey as keyof typeof PILLARS]}
                                </Text>
                            </View>
                            {exercises.map(ex => (
                                <Card
                                    key={ex.id}
                                    style={[styles.card, { backgroundColor: theme.colors.surface }]}
                                    onPress={() => router.push(`/exercises/${ex.id}` as any)}
                                >
                                    <Card.Title
                                        title={ex.name}
                                        subtitle={ex.description}
                                        titleStyle={{ color: theme.colors.onSurface }}
                                        subtitleStyle={{ color: theme.colors.onSurfaceVariant }}
                                        left={() => (
                                            <View style={[styles.cardAccent, { backgroundColor: accentColor + '33' }]}>
                                                <Avatar.Icon
                                                    icon="brain"
                                                    size={36}
                                                    style={{ backgroundColor: 'transparent' }}
                                                    color={accentColor}
                                                />
                                            </View>
                                        )}
                                        right={(props) => <IconButton {...props} icon="chevron-right" iconColor={theme.colors.onSurfaceVariant} />}
                                    />
                                </Card>
                            ))}
                        </View>
                    );
                })}

                <View style={{ height: 60 }} />
            </ScrollView>

            <Snackbar
                visible={!!snackMessage}
                onDismiss={() => setSnackMessage('')}
                duration={3000}
            >
                {snackMessage}
            </Snackbar>
        </View>
    );
}

const styles = StyleSheet.create({
    scrollContent: { padding: 16 },
    heroBanner: {
        width: '100%',
        height: 160,
        borderRadius: 16,
        marginBottom: 16,
    },
    statsCard: {
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 16,
    },
    section: { marginBottom: 16 },
    sectionTitle: { fontWeight: 'bold', marginBottom: 10 },
    activityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    pillarHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    pillarDot: { width: 10, height: 10, borderRadius: 5 },
    card: { marginBottom: 8, borderRadius: 12 },
    cardAccent: { borderRadius: 10, padding: 2, marginLeft: 4 },
});
