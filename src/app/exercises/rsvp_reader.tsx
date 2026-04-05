import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { Text, Button, Modal, Portal, ProgressBar, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GameContainer } from '../../components/GameContainer';
import { EXERCISE_REGISTRY } from '../../features/engine/Registry';
import { sessionService } from '../../features/engine/SessionService';
import { contentService, ContentSource, Passage } from '../../features/engine/ContentService';

interface RSVPBoardProps {
    isPlaying: boolean;
    settings: any;
    onScore: (s: number) => void;
}

function RSVPBoard({ isPlaying, settings, onScore }: RSVPBoardProps) {
    const theme = useTheme();
    const [phase, setPhase] = useState<'IDLE' | 'READING' | 'QUESTION'>('IDLE');
    const [words, setWords] = useState<string[]>([]);
    const [index, setIndex] = useState(0);
    const [currentChunk, setCurrentChunk] = useState('');
    const [passage, setPassage] = useState<Passage | null>(null);
    const [showMenu, setShowMenu] = useState(false);
    const [customText, setCustomText] = useState('');
    const [manualReady, setManualReady] = useState(false);
    const [loading, setLoading] = useState(false);

    const wpm: number = settings.wpm || 300;
    const chunkSize: number = settings.chunk || 1;
    const source: ContentSource = settings.source === 'Manual Input' ? 'manual'
        : settings.source === 'Wikipedia' ? 'wikipedia'
        : settings.source === 'News' ? 'news'
        : 'database';
    const delay = (60000 / wpm) * chunkSize;
    const isManual = source === 'manual';

    useEffect(() => {
        if (isPlaying && phase === 'IDLE' && !showMenu) {
            if (isManual && !manualReady) return;
            if (!isManual) loadAndStart();
        }
    }, [isPlaying, phase, showMenu, isManual, manualReady]);

    const loadAndStart = async () => {
        setLoading(true);
        const p = await contentService.getPassage('rsvp_reader', source);
        setLoading(false);
        setPassage(p);
        setWords(p.text.split(/\s+/));
        setIndex(0);
        setPhase('READING');
    };

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (phase === 'READING' && index < words.length) {
            timer = setTimeout(() => {
                setCurrentChunk(words.slice(index, index + chunkSize).join(' '));
                setIndex(prev => prev + chunkSize);
            }, delay);
        } else if (phase === 'READING' && index >= words.length && words.length > 0) {
            if (passage?.q) {
                setPhase('QUESTION');
            } else {
                setShowMenu(true);
                setPhase('IDLE');
            }
        }
        return () => clearTimeout(timer);
    }, [phase, index, words, delay, chunkSize]);

    const handleAnswer = (ans: string) => {
        if (passage?.a && ans === passage.a) onScore(100);
        else onScore(-50);
        setPhase('IDLE');
        setShowMenu(true);
    };

    const handleAction = (action: 'REPEAT' | 'NEXT') => {
        setShowMenu(false);
        if (action === 'REPEAT') {
            if (isManual) {
                setWords(customText.trim().split(/\s+/));
                setIndex(0);
                setPhase('READING');
            } else if (passage) {
                setWords(passage.text.split(/\s+/));
                setIndex(0);
                setPhase('READING');
            }
        } else {
            if (isManual) { setManualReady(false); setPhase('IDLE'); }
            else setPhase('IDLE');
        }
    };

    if (!isPlaying) return <View />;

    if (loading) {
        return <View style={styles.board}><Text variant="headlineSmall">Loading passage...</Text></View>;
    }

    if (isManual && !manualReady) {
        return (
            <View style={styles.board}>
                <Text variant="headlineSmall" style={{ marginBottom: 10 }}>Paste Your Text</Text>
                <TextInput
                    style={[styles.textInput, { borderColor: theme.colors.outline, color: theme.colors.onSurface }]}
                    multiline
                    value={customText}
                    onChangeText={setCustomText}
                    placeholder="Paste article, notes, or study text..."
                    placeholderTextColor="#aaa"
                />
                <Button mode="contained" onPress={() => {
                    const clean = customText.trim();
                    if (clean) {
                        setManualReady(true);
                        setWords(clean.split(/\s+/));
                        setIndex(0);
                        setPhase('READING');
                    }
                }}>
                    Read Now
                </Button>
            </View>
        );
    }

    if (phase === 'READING') {
        const progressVal = words.length > 0 ? index / words.length : 0;
        return (
            <View style={styles.board}>
                <ProgressBar progress={progressVal} color={theme.colors.primary} style={styles.readingProgress} />
                <Text variant="displayLarge" style={[styles.word, { color: theme.colors.onBackground }]}>
                    {currentChunk}
                </Text>
                {passage?.source && (
                    <Text style={[styles.sourceLabel, { color: theme.colors.onSurfaceVariant }]}>
                        Source: {passage.source}
                    </Text>
                )}
                <Text style={[styles.wpmLabel, { color: theme.colors.onSurfaceVariant }]}>
                    {wpm} WPM · {chunkSize}w/flash
                </Text>
            </View>
        );
    }

    if (phase === 'QUESTION' && passage?.q) {
        return (
            <View style={styles.board}>
                <Text variant="headlineMedium" style={{ marginBottom: 24, textAlign: 'center', color: theme.colors.onBackground }}>
                    {passage.q}
                </Text>
                <View style={styles.options}>
                    {(passage.o ?? []).map((opt, i) => (
                        <Button key={i} mode="contained" onPress={() => handleAnswer(opt)} style={styles.optBtn}>
                            {opt}
                        </Button>
                    ))}
                </View>
            </View>
        );
    }

    return (
        <View style={styles.board}>
            <Portal>
                <Modal
                    visible={showMenu}
                    onDismiss={() => setShowMenu(false)}
                    contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
                >
                    <Text variant="headlineMedium" style={{ textAlign: 'center', marginBottom: 20, color: theme.colors.onSurface }}>
                        Passage Complete
                    </Text>
                    <View style={{ gap: 10 }}>
                        <Button mode="contained" onPress={() => handleAction('REPEAT')}>Repeat Passage</Button>
                        <Button mode="outlined" onPress={() => handleAction('NEXT')}>
                            {isManual ? 'Paste New Text' : 'Next Passage'}
                        </Button>
                    </View>
                </Modal>
            </Portal>
        </View>
    );
}

export default function RSVPReader() {
    const router = useRouter();
    const [score, setScore] = useState(0);

    return (
        <GameContainer
            config={{ ...EXERCISE_REGISTRY['rsvp_reader'], params: {} }}
            hideTimer={true}
            onFinish={async () => {
                await sessionService.saveSession({
                    exerciseId: 'rsvp_reader',
                    rawScore: score,
                    normalizedScore: Math.min(score, 100),
                    metrics: { correct_rounds: score / 100 },
                    durationSeconds: 60,
                });
                router.back();
            }}
        >
            {({ isPlaying, customSettings }) => (
                <RSVPBoard isPlaying={isPlaying} settings={customSettings} onScore={(s) => setScore(prev => prev + s)} />
            )}
        </GameContainer>
    );
}

const styles = StyleSheet.create({
    board: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
    word: { fontWeight: 'bold', textAlign: 'center', marginVertical: 20 },
    readingProgress: { width: '90%', height: 4, borderRadius: 2, marginBottom: 20 },
    wpmLabel: { position: 'absolute', bottom: 40, fontSize: 12 },
    sourceLabel: { position: 'absolute', bottom: 60, fontSize: 12 },
    options: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
    optBtn: { margin: 5, minWidth: 120 },
    modal: { padding: 20, margin: 40, borderRadius: 10 },
    textInput: { width: '100%', height: 200, borderWidth: 1, padding: 10, marginBottom: 20, borderRadius: 8, textAlignVertical: 'top' },
});
