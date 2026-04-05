import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Text, ProgressBar, Surface, SegmentedButtons, Chip, IconButton, useTheme, Portal, Dialog } from 'react-native-paper';
import { ExerciseConfig } from '../features/engine/CortexEngine';
import { useRouter } from 'expo-router';
import { ExerciseSettings } from './ExerciseSettings';
import { useGameContext } from '../features/engine/GameContext';
import { sessionService } from '../features/engine/SessionService';

interface GameContainerProps {
    config: ExerciseConfig;
    onFinish: (score?: { raw: number, normalized: number, metrics: any }) => void;
    children: (gameState: {
        isPlaying: boolean;
        timeLeft: number;
        difficulty: number;
        mode: string;
        customSettings: any;
        score: number;
        setScore: (n: number | ((prev: number) => number)) => void;
        setSettings: (newSettings: any) => void;
    }) => React.ReactNode;
    modes?: string[]; // Optional custom modes
    hideTimer?: boolean;
    hideDifficulty?: boolean;
}

export function GameContainer({ config, onFinish, children, modes = ['Standard'], hideTimer = false, hideDifficulty = false }: GameContainerProps) {
    const router = useRouter();
    const [isPlaying, setIsPlaying] = useState(false);
    const context = useGameContext();
    const isAssessment = context?.mode === 'assessment';

    // Duration Logic
    const [duration, setDuration] = useState(60);
    const [difficulty, setDifficulty] = useState(1);
    const [mode, setMode] = useState(modes[0]);
    const [highScore, setHighScore] = useState<number | null>(null);

    // Custom Settings Logic
    const [customSettings, setCustomSettings] = useState(() => {
        // If Assessment, use overrides STRICTLY
        if (isAssessment && context.overrideSettings) {
            return context.overrideSettings;
        }
        // Else default
        const defaults: any = {};
        if (config.settingsSchema) {
            config.settingsSchema.forEach(s => defaults[s.key] = s.default);
        }
        return defaults;
    });

    const [timeLeft, setTimeLeft] = useState(duration);
    const [progress, setProgress] = useState(1);

    // Sync Duration with Context if Assessment
    useEffect(() => {
        if (isAssessment && context.overrideDuration) {
            setDuration(context.overrideDuration);
            setTimeLeft(context.overrideDuration);
        }
    }, [isAssessment, context.overrideDuration]);

    // Fetch High Score
    useEffect(() => {
        if (!isAssessment) {
            sessionService.getHighScore(config.id).then(setHighScore).catch(() => {});
        }
    }, [config.id, isAssessment]);

    // Timer Logic
    useEffect(() => {
        if (hideTimer) return; // Disable timer logic if timer is hidden/disabled (Zen Mode)

        if (isPlaying && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prev: number) => {
                    const newState = prev - 1;
                    setProgress(newState / duration);
                    return newState;
                });
            }, 1000);
            return () => clearInterval(timer);
        } else if (isPlaying && timeLeft <= 0) {
            triggerFinish();
        }
    }, [isPlaying, timeLeft, duration, hideTimer]);

    const handleStart = () => {
        setTimeLeft(duration);
        setIsPlaying(true);
    };

    // Score State lifted to GameContainer
    const [score, setScore] = useState(0);

    // Intercept finish
    const triggerFinish = () => {
        setIsPlaying(false);
        if (isAssessment && context.onSessionComplete) {
            context.onSessionComplete({ raw: score });
        } else {
            onFinish({ raw: score, normalized: 0, metrics: {} });
        }
    };

    const theme = useTheme();
    const [showHelp, setShowHelp] = useState(false);

    if (!isPlaying) {
        return (
            <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
                <Text variant="displayMedium" style={{ ...styles.title, color: theme.colors.onBackground }}>{config.name}</Text>

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 10 }}>
                    <Button
                        mode="text"
                        icon="help-circle-outline"
                        onPress={() => setShowHelp(true)}
                        textColor={theme.colors.primary}
                    >
                        How to Play
                    </Button>
                </View>

                {/* Tutorial Dialog */}
                <Portal>
                    <Dialog visible={showHelp} onDismiss={() => setShowHelp(false)} style={{ backgroundColor: theme.colors.surface }}>
                        <Dialog.Title style={{ color: theme.colors.onSurface }}>How to Play: {config.name}</Dialog.Title>
                        <Dialog.Content>
                            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                                {config.tutorial || config.description || "No specific instructions available."}
                            </Text>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={() => setShowHelp(false)}>Got it</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>

                {highScore !== null && highScore > 0 && (
                    <Chip icon="trophy" style={{ alignSelf: 'center', marginBottom: 20, backgroundColor: theme.colors.secondaryContainer }}>
                        High Score: {highScore}
                    </Chip>
                )}

                {/* Hide settings if Assessment */}
                {!isAssessment && (
                    <>
                        <View style={[styles.settingsCard, { backgroundColor: theme.colors.surfaceVariant }]}>
                            <Text variant="titleMedium" style={{ marginBottom: 10, color: theme.colors.onSurfaceVariant }}>Training Settings</Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                                <Text style={{ color: theme.colors.onSurface }}>Session Duration</Text>
                                <SegmentedButtons
                                    value={String(duration)}
                                    onValueChange={v => { setDuration(Number(v)); setTimeLeft(Number(v)); }}
                                    buttons={[
                                        { value: '30', label: '30s' },
                                        { value: '60', label: '1m' },
                                        { value: '120', label: '2m' },
                                    ]}
                                    style={{ flex: 1, marginLeft: 10 }}
                                    density="small"
                                />
                            </View>

                            {modes.length > 1 && (
                                <View style={{ marginBottom: 20 }}>
                                    <Text style={{ marginBottom: 5, color: theme.colors.onSurface }}>Game Mode</Text>
                                    <SegmentedButtons
                                        value={mode}
                                        onValueChange={setMode}
                                        buttons={modes.map(m => ({ value: m, label: m }))}
                                        density="small"
                                    />
                                </View>
                            )}

                            {config.settingsSchema && (
                                <ExerciseSettings
                                    schema={config.settingsSchema}
                                    values={customSettings}
                                    onChange={(k, v) => setCustomSettings((prev: any) => ({ ...prev, [k]: v }))}
                                />
                            )}
                        </View>
                    </>
                )}

                {isAssessment && <Text variant="titleMedium" style={{ color: theme.colors.error }}>ASSESSMENT MODE</Text>}

                <Button mode="contained" onPress={handleStart} style={styles.startBtn} contentStyle={{ height: 50 }}>
                    {isAssessment ? "Start Test" : "Start Session"}
                </Button>
            </ScrollView>
        );
    }

    return (
        <View style={[styles.gameWrapper, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.header, { borderBottomColor: theme.colors.outlineVariant }]}>
                <IconButton icon="arrow-left" onPress={() => setIsPlaying(false)} />
                {!hideTimer && (
                    <View style={{ flex: 1, marginHorizontal: 10 }}>
                        <ProgressBar progress={progress} color={theme.colors.primary} style={styles.progress} />
                    </View>
                )}
                {!hideDifficulty && <Text style={{ color: theme.colors.onSurface }}>Lvl {difficulty}</Text>}
            </View>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={[styles.content, { paddingBottom: 40 }]}>
                    {children({
                        isPlaying,
                        timeLeft,
                        difficulty,
                        mode,
                        customSettings,
                        score,
                        setScore: (n: number | ((prev: number) => number)) => setScore(n),
                        setSettings: (newSettings: any) => setCustomSettings((prev: any) => ({ ...prev, ...newSettings }))
                    })}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    title: {
        fontWeight: 'bold',
        textAlign: 'center'
    },
    description: {
        textAlign: 'center',
        marginVertical: 20,
    },
    settingsCard: {
        width: '100%',
        padding: 20,
        borderRadius: 10,
        marginVertical: 20
    },
    startBtn: {
        width: '100%',
        borderRadius: 8
    },
    gameWrapper: {
        flex: 1,
    },
    progress: {
        height: 6,
        borderRadius: 3
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        alignItems: 'center',
        borderBottomWidth: 1,
    },
    content: {
        flex: 1,
    }
});
