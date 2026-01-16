import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Surface, Button, ProgressBar, Divider } from 'react-native-paper';

interface AssessmentReportProps {
    scores: Record<string, number>; // Domain -> Score (0-100)
    finalScore: number;
    onClose: () => void;
}

export function AssessmentReport({ scores, finalScore, onClose }: AssessmentReportProps) {

    const getColor = (score: number) => {
        if (score >= 80) return '#4caf50'; // Green
        if (score >= 60) return '#ff9800'; // Orange
        return '#f44336'; // Red
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text variant="displaySmall" style={{ textAlign: 'center', marginBottom: 10 }}>Cortex Report</Text>
            <Text variant="titleMedium" style={{ textAlign: 'center', color: '#666', marginBottom: 30 }}>
                Integrated Global Score
            </Text>

            <View style={styles.scoreCircle}>
                <Text variant="displayLarge" style={{ color: getColor(finalScore), fontWeight: 'bold' }}>
                    {Math.round(finalScore)}
                </Text>
            </View>

            <Text variant="headlineSmall" style={{ marginTop: 20, marginBottom: 10 }}>Cognitive Profile</Text>

            <View style={styles.domains}>
                {Object.entries(scores).map(([domain, score]) => (
                    <Surface key={domain} style={styles.card} elevation={1}>
                        <View style={styles.row}>
                            <Text variant="titleMedium">{domain}</Text>
                            <Text variant="titleMedium" style={{ color: getColor(score), fontWeight: 'bold' }}>{Math.round(score)}</Text>
                        </View>
                        <ProgressBar progress={score / 100} color={getColor(score)} style={{ height: 8, borderRadius: 4, marginTop: 10 }} />
                        <Text variant="bodySmall" style={{ marginTop: 5, color: '#888' }}>
                            {getFeedback(domain, score)}
                        </Text>
                    </Surface>
                ))}
            </View>

            <Button mode="contained" onPress={onClose} style={{ marginTop: 20, width: '100%' }}>
                Return to Headquarters
            </Button>
        </ScrollView>
    );
}

function getFeedback(domain: string, score: number) {
    if (score >= 80) return "Elite performance. Maintained optimal function under load.";
    if (score >= 60) return "Solid baseline. Room for optimization in speed/accuracy trade-off.";
    return "Area for growth. Focus on foundational drills.";
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 20, alignItems: 'center', backgroundColor: '#f5f5f5' },
    scoreCircle: {
        width: 150, height: 150, borderRadius: 75,
        backgroundColor: 'white',
        justifyContent: 'center', alignItems: 'center',
        elevation: 4, marginBottom: 20,
        borderWidth: 5, borderColor: '#eee'
    },
    domains: { width: '100%' },
    card: { padding: 15, marginBottom: 15, borderRadius: 8, backgroundColor: 'white' },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }
});
