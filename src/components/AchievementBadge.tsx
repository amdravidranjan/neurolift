import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Achievement } from '../features/engine/AchievementService';
import { PhosphorIcon } from './icons/PhosphorIcon';

interface AchievementBadgeProps {
    achievement: Achievement;
}

export function AchievementBadge({ achievement }: AchievementBadgeProps) {
    const theme = useTheme();
    const locked = !achievement.unlocked;

    return (
        <View style={[styles.container, { backgroundColor: locked ? theme.colors.surfaceVariant : theme.colors.primaryContainer }]}>
            <View style={[
                styles.iconCircle,
                { backgroundColor: locked ? theme.colors.outline : theme.colors.primary }
            ]}>
                <PhosphorIcon
                    name={locked ? 'star' : achievement.icon}
                    size={22}
                    color={locked ? theme.colors.onSurfaceVariant : theme.colors.onPrimary}
                />
            </View>
            <Text
                variant="labelSmall"
                style={{ color: locked ? theme.colors.onSurfaceVariant : theme.colors.onPrimaryContainer, textAlign: 'center', marginTop: 4 }}
                numberOfLines={2}
            >
                {locked ? '???' : achievement.label}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 80,
        alignItems: 'center',
        padding: 8,
        borderRadius: 12,
        margin: 4,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
