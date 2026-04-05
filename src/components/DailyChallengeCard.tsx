import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { PhosphorIcon } from './icons/PhosphorIcon';

interface DailyChallengeCardProps {
    exerciseName: string;
    pillarLabel: string;
    completed: boolean;
    onPress: () => void;
}

export function DailyChallengeCard({ exerciseName, pillarLabel, completed, onPress }: DailyChallengeCardProps) {
    const theme = useTheme();

    return (
        <View style={[styles.card, { backgroundColor: completed ? theme.colors.surfaceVariant : '#1A1A2E' }]}>
            <View style={styles.header}>
                <PhosphorIcon name="lightning" size={18} color="#FFD700" filled />
                <Text variant="labelSmall" style={styles.dailyLabel}>DAILY CHALLENGE</Text>
                <View style={styles.xpBadge}>
                    <Text style={styles.xpText}>2× XP</Text>
                </View>
            </View>

            <Text variant="titleMedium" style={[styles.name, { color: completed ? theme.colors.onSurfaceVariant : '#FFFFFF' }]}>
                {exerciseName}
            </Text>
            <Text variant="bodySmall" style={[styles.pillar, { color: completed ? theme.colors.outline : '#A0A0C0' }]}>
                {pillarLabel}
            </Text>

            {completed ? (
                <View style={styles.completedRow}>
                    <PhosphorIcon name="check-circle" size={16} color={theme.colors.primary} />
                    <Text variant="labelSmall" style={{ color: theme.colors.primary, marginLeft: 4 }}>Completed today</Text>
                </View>
            ) : (
                <Button
                    mode="contained"
                    onPress={onPress}
                    style={styles.btn}
                    buttonColor="#7C5CBF"
                    textColor="#FFFFFF"
                    compact
                >
                    Train Now
                </Button>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 16,
        marginVertical: 8,
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 6,
    },
    dailyLabel: {
        color: '#FFD700',
        fontWeight: 'bold',
        letterSpacing: 1,
        flex: 1,
    },
    xpBadge: {
        backgroundColor: '#FFD700',
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    xpText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 11,
    },
    name: {
        fontWeight: 'bold',
        marginBottom: 2,
    },
    pillar: {
        marginBottom: 12,
    },
    completedRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    btn: {
        alignSelf: 'flex-start',
        borderRadius: 8,
    },
});
