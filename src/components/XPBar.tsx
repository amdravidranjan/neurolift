import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { XPService } from '../features/engine/XPService';
import { PhosphorIcon } from './icons/PhosphorIcon';

interface XPBarProps {
    totalXP: number;
    streak: number;
}

export function XPBar({ totalXP, streak }: XPBarProps) {
    const theme = useTheme();
    const level = XPService.getLevel(totalXP);
    const progress = XPService.getProgressToNext(totalXP);
    const label = XPService.getLevelLabel(level);

    return (
        <View style={styles.container}>
            <View style={[styles.levelBadge, { backgroundColor: theme.colors.primary }]}>
                <Text style={[styles.levelText, { color: theme.colors.onPrimary }]}>Lv {level + 1}</Text>
            </View>

            <View style={styles.middle}>
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 2 }}>
                    {label} · {totalXP} XP
                </Text>
                <View style={[styles.track, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <View
                        style={[
                            styles.fill,
                            { backgroundColor: theme.colors.primary, width: `${Math.round(progress * 100)}%` }
                        ]}
                    />
                </View>
            </View>

            <View style={styles.streakContainer}>
                <PhosphorIcon name="fire-fill" size={16} color="#FF6B35" />
                <Text style={[styles.streakText, { color: theme.colors.onSurface }]}>{streak}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 10,
    },
    levelBadge: {
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        minWidth: 44,
        alignItems: 'center',
    },
    levelText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    middle: {
        flex: 1,
    },
    track: {
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    fill: {
        height: 6,
        borderRadius: 3,
    },
    streakContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    streakText: {
        fontWeight: 'bold',
        fontSize: 14,
    },
});
