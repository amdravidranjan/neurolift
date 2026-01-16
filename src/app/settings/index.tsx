import React from 'react';
import { View, StyleSheet, ScrollView, Linking, Alert } from 'react-native';
import { Text, List, Button, Switch, Divider, Avatar, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { sessionService } from '../../features/engine/SessionService';
import { useThemeContext } from '../../features/context/ThemeContext';

import { useTheme } from 'react-native-paper';

export default function SettingsScreen() {
    const router = useRouter();
    const { isDark, toggleTheme } = useThemeContext();
    const theme = useTheme();

    const handleReset = () => {
        Alert.alert(
            "Reset All Data",
            "Are you sure you want to delete all high scores and history? This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete", style: 'destructive', onPress: async () => {
                        await sessionService.clearAllData();
                        Alert.alert("Success", "All data has been reset.");
                    }
                }
            ]
        );
    };

    const LinkItem = ({ label, url, icon }: { label: string, url: string, icon: string }) => (
        <List.Item
            title={label}
            left={props => <List.Icon {...props} icon={icon} />}
            onPress={() => Linking.openURL(url)}
            right={props => <List.Icon {...props} icon="open-in-new" />}
        />
    );

    return (
        <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <IconButton icon="arrow-left" onPress={() => router.back()} />
                <Text variant="headlineMedium">Settings & About</Text>
            </View>

            <List.Section>
                <List.Subheader>App Settings</List.Subheader>
                <List.Item
                    title="Dark Theme"
                    left={props => <List.Icon {...props} icon="theme-light-dark" />}
                    right={() => <Switch value={isDark} onValueChange={toggleTheme} />}
                />
                <List.Item
                    title="Reset High Scores"
                    description="Clear all local progress history"
                    left={props => <List.Icon {...props} icon="delete-forever" color="red" />}
                    onPress={handleReset}
                />
            </List.Section>

            <Divider />

            <List.Section>
                <List.Subheader>Help & Guide</List.Subheader>
                <List.Accordion
                    title="How to Use NeuroLift"
                    left={props => <List.Icon {...props} icon="help-circle" />}>
                    <List.Item title="Take the daily Assessment to track progress." />
                    <List.Item title="Train individual pillars in the Gym." />
                    <List.Item title="Scores are saved locally on your device." />
                </List.Accordion>
                <List.Accordion
                    title="Cognitive Pillars"
                    left={props => <List.Icon {...props} icon="brain" />}>
                    <List.Item title="Memory: N-Back, Digit Span" />
                    <List.Item title="Focus: Impulse Control, Sentry" />
                    <List.Item title="Reasoning: Pattern Matrix, Workbench" />
                </List.Accordion>
            </List.Section>

            <Divider />

            <List.Section>
                <List.Subheader>About the Creator</List.Subheader>

                <View style={[styles.aboutCard, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <Avatar.Text size={64} label="DR" style={{ backgroundColor: theme.colors.primary }} />
                    <Text variant="titleLarge" style={{ marginTop: 10 }}>Dravid Ranjan .A.M</Text>
                    <Text variant="bodyMedium" style={{ fontStyle: 'italic', marginBottom: 10 }}>Lead Developer & Architect</Text>
                    <Text variant="bodySmall" style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant, paddingHorizontal: 20, marginBottom: 10 }}>
                        "Building tools to unlock the potential of the human mind."
                    </Text>
                </View>

                <LinkItem
                    label="LinkedIn Profile"
                    url="https://www.linkedin.com/in/amdravidranjan"
                    icon="linkedin"
                />
                <LinkItem
                    label="GitHub Repos"
                    url="https://github.com/amdravidranjan/"
                    icon="github"
                />
                <LinkItem
                    label="Instagram"
                    url="https://instagram.com/dravid_ranjan"
                    icon="instagram"
                />
            </List.Section>

            <List.Section>
                <List.Subheader>Credits</List.Subheader>
                <List.Item
                    title="Powered by Gemini"
                    description="AI Assistance provided by Google DeepMind"
                    left={props => <List.Icon {...props} icon="robot" />}
                />
                <List.Item
                    title="Version"
                    description="1.0.0 (Beta)"
                />
            </List.Section>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { paddingBottom: 20 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 10, marginTop: 10 },
    aboutCard: { alignItems: 'center', padding: 20, borderRadius: 10, marginBottom: 10, marginHorizontal: 20 }
});
