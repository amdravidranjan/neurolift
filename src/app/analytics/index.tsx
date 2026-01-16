import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Title } from 'react-native-paper';
import { analyticsService, DailyStats } from '../../features/analytics/AnalyticsService';
import { streakService } from '../../features/analytics/StreakService';

export default function AnalyticsDashboard() {
    const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
    const [totalXP, setTotalXP] = useState(0);
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const stats = await analyticsService.getDailySessionCounts();
        const xp = await analyticsService.getTotalXP();
        const s = await streakService.calculateStreak();
        setDailyStats(stats);
        setTotalXP(xp);
        setStreak(s);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text variant="displaySmall" style={{ marginBottom: 20 }}>Your Progress</Text>

            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                <Card style={[styles.card, { flex: 1 }]}>
                    <Card.Content>
                        <Title>XP</Title>
                        <Text variant="displayMedium" style={{ color: '#6200ee' }}>{totalXP}</Text>
                    </Card.Content>
                </Card>
                <Card style={[styles.card, { flex: 1 }]}>
                    <Card.Content>
                        <Title>Streak</Title>
                        <Text variant="displayMedium" style={{ color: '#ff9800' }}>{streak}🔥</Text>
                    </Card.Content>
                </Card>
            </View>

            <Text variant="titleLarge" style={{ marginTop: 20, marginBottom: 10 }}>Activity (Last 7 Days)</Text>
            <View style={styles.chart}>
                {dailyStats.map((stat, index) => (
                    <View key={stat.date} style={styles.barContainer}>
                        <View style={[styles.bar, { height: Math.max(stat.count * 20, 2), backgroundColor: stat.count > 0 ? '#6200ee' : '#ccc' }]} />
                        <Text style={{ fontSize: 10 }}>{stat.date.slice(5)}</Text>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20 },
    card: { marginBottom: 10 },
    chart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 150 },
    barContainer: { alignItems: 'center', flex: 1 },
    bar: { width: 20, borderRadius: 4, marginBottom: 5 }
});
