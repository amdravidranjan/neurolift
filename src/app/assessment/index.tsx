import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, ProgressBar, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { AssessmentEngine } from '../../features/assessment/AssessmentEngine';
import { GameRunner } from '../../components/GameRunner';
import { GameProvider } from '../../features/engine/GameContext';
import { AssessmentReport } from './AssessmentReport';

export default function AssessmentScreen() {
    const router = useRouter();
    const [step, setStep] = useState(-1); // -1: Intro, 0..N: Tests, N+1: Summary
    const [results, setResults] = useState<any[]>([]);
    const [report, setReport] = useState<any>(null);

    const battery = AssessmentEngine.getBattery();

    const startAssessment = () => setStep(0);

    const handleTestComplete = (score: number, metrics: any) => {
        const currentTest = battery[step];
        const newResults = [...results, { id: currentTest.id, score, metrics }];
        setResults(newResults);

        if (step < battery.length - 1) {
            setStep(s => s + 1);
        } else {
            // Generate Report
            const calc = AssessmentEngine.calculateReport(newResults);
            setReport(calc);
            setStep(battery.length); // Summary
        }
    };

    if (step === -1) {
        return (
            <View style={styles.container}>
                <Text variant="displayMedium" style={{ marginBottom: 20 }}>Baseline Protocol</Text>
                <Text variant="bodyLarge" style={{ textAlign: 'center', marginBottom: 40 }}>
                    5 Core Tests. No pausing. Maximum effort.
                    {"\n\n"}
                    1. Memory Update (N-Back)
                    {"\n"}
                    2. Inhibition (Stop-Signal)
                    {"\n"}
                    3. Reasoning (Pattern Matrix)
                    {"\n"}
                    4. Capacity (Digit Span)
                    {"\n"}
                    5. Manipulation (Workbench)
                </Text>
                <Button mode="contained" onPress={startAssessment} contentStyle={{ height: 60 }}>
                    BEGIN ASSESSMENT
                </Button>
            </View>
        );
    }

    if (step >= battery.length && report) {
        return (
            <AssessmentReport
                scores={report.domainScores}
                finalScore={report.finalScore}
                onClose={() => router.back()}
            />
        );
    }

    const currentConfig = battery[step];

    return (
        <View style={{ flex: 1 }}>
            <View style={{ padding: 10, backgroundColor: '#eee' }}>
                <Text style={{ textAlign: 'center' }}>Test {step + 1} / {battery.length}</Text>
                <ProgressBar progress={(step) / battery.length} />
            </View>

            <View style={{ flex: 1 }}>
                <GameProvider value={{
                    mode: 'assessment',
                    onSessionComplete: (metrics) => {
                        // Extract score from metrics (handling both normalized and raw)
                        const score = metrics.normalizedScore !== undefined ? metrics.normalizedScore : (metrics.rawScore || 0);
                        handleTestComplete(score, metrics);
                    },
                    overrideSettings: currentConfig.settings,
                    overrideDuration: currentConfig.duration
                }}>
                    <GameRunner exerciseId={currentConfig.exerciseId} />
                </GameProvider>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    resultCard: { width: '100%', padding: 20, marginVertical: 20 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }
});
