import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, useTheme, Appbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { analyticsService, DailyStats } from '../../features/analytics/AnalyticsService';
import { streakService } from '../../features/analytics/StreakService';
import { achievementService, Achievement } from '../../features/engine/AchievementService';
import { XPService } from '../../features/engine/XPService';
import { performanceService, RadarDataPoint } from '../../features/engine/PerformanceService';
import { AchievementBadge } from '../../components/AchievementBadge';
import { PhosphorIcon } from '../../components/icons/PhosphorIcon';
import { sessionService } from '../../features/engine/SessionService';

export default function AnalyticsDashboard() {
    const theme = useTheme();
    const router = useRouter();
    const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
    const [totalXP, setTotalXP] = useState(0);
    const [streak, setStreak] = useState(0);
    const [pillarScores, setPillarScores] = useState<RadarDataPoint[]>([]);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [recentSessions, setRecentSessions] = useState<any[]>([]);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        const [stats, xp, s, pillars, allAchievements, recent] = await Promise.all([
            analyticsService.getDailySessionCounts(),
            analyticsService.getTotalXP(),
            streakService.calculateStreak(),
            performanceService.getPillarScores(),
            achievementService.getAll(),
            sessionService.getRecentSessions(20),
        ]);
        setDailyStats(stats);
        setTotalXP(xp);
        setStreak(s);
        setPillarScores(pillars);
        setAchievements(allAchievements);
        setRecentSessions(recent);
    };

    const level = XPService.getLevel(totalXP);
    const label = XPService.getLevelLabel(level);
    const maxBar = Math.max(...dailyStats.map(d => d.count), 1);

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <Appbar.Header style={{ backgroundColor: 'transparent' }}>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title="Your Progress" />
            </Appbar.Header>

            <ScrollView contentContainerStyle={styles.container}>
                {/* XP + Streak row */}
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                    <Card style={[styles.card, { flex: 1 }]}>
                        <Card.Content style={{ alignItems: 'center' }}>
                            <PhosphorIcon name="lightning" size={28} color="#6200ee" filled />
                            <Text variant="displaySmall" style={{ color: '#6200ee', fontWeight: 'bold' }}>{totalXP}</Text>
                            <Text variant="labelSmall">XP · Lv{level} {label}</Text>
                        </Card.Content>
                    </Card>
                    <Card style={[styles.card, { flex: 1 }]}>
                        <Card.Content style={{ alignItems: 'center' }}>
                            <PhosphorIcon name="fire" size={28} color="#FF5722" filled />
                            <Text variant="displaySmall" style={{ color: '#FF5722', fontWeight: 'bold' }}>{streak}</Text>
                            <Text variant="labelSmall">Day Streak</Text>
                        </Card.Content>
                    </Card>
                </View>

                {/* 7-day activity */}
                <Text variant="titleMedium" style={styles.section}>Activity — Last 7 Days</Text>
                <View style={styles.chart}>
                    {dailyStats.map((stat) => (
                        <View key={stat.date} style={styles.barContainer}>
                            <View style={[styles.bar, {
                                height: Math.max((stat.count / maxBar) * 100, 4),
                                backgroundColor: stat.count > 0 ? '#6200ee' : '#e0e0e0',
                            }]} />
                            <Text style={{ fontSize: 9, color: theme.colors.onSurfaceVariant }}>{stat.date.slice(5)}</Text>
                        </View>
                    ))}
                </View>

                {/* Pillar scores */}
                <Text variant="titleMedium" style={styles.section}>Cognitive Profile</Text>
                {pillarScores.map(p => (
                    <View key={p.label} style={styles.pillarRow}>
                        <Text style={[styles.pillarLabel, { color: theme.colors.onSurface }]}>{p.label}</Text>
                        <View style={styles.pillarTrack}>
                            <View style={[styles.pillarFill, {
                                width: `${p.value}%`,
                                backgroundColor: p.value > 60 ? '#4CAF50' : p.value > 30 ? '#FF9800' : '#F44336',
                            }]} />
                        </View>
                        <Text style={[styles.pillarValue, { color: theme.colors.onSurfaceVariant }]}>{p.value}</Text>
                    </View>
                ))}

                {/* Achievements */}
                <Text variant="titleMedium" style={styles.section}>Achievements</Text>
                <View style={styles.badgeGrid}>
                    {achievements.map(a => (
                        <AchievementBadge key={a.id} achievement={a} />
                    ))}
                </View>

                {/* Session history */}
                {recentSessions.length > 0 && (
                    <>
                        <Text variant="titleMedium" style={styles.section}>Session History</Text>
                        {recentSessions.map((s: any, i: number) => (
                            <Card key={i} style={{ marginBottom: 6 }}>
                                <Card.Content style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text variant="bodySmall">{new Date(s.createdAt).toLocaleDateString()}</Text>
                                    <Text variant="bodySmall">{s.durationSeconds}s · {s.totalXp} XP</Text>
                                </Card.Content>
                            </Card>
                        ))}
                    </>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16 },
    card: { marginBottom: 10 },
    chart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120, marginBottom: 20 },
    barContainer: { alignItems: 'center', flex: 1 },
    bar: { width: 22, borderRadius: 4, marginBottom: 4 },
    section: { fontWeight: 'bold', marginTop: 16, marginBottom: 10 },
    pillarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    pillarLabel: { width: 90, fontSize: 13 },
    pillarTrack: { flex: 1, height: 10, backgroundColor: '#e0e0e0', borderRadius: 5, marginHorizontal: 8 },
    pillarFill: { height: 10, borderRadius: 5 },
    pillarValue: { width: 30, textAlign: 'right', fontSize: 12 },
    badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
});
