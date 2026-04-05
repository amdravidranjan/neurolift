import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { Text, Button, Surface, Modal, Portal } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GameContainer } from '../../components/GameContainer';
import { EXERCISE_REGISTRY } from '../../features/engine/Registry';
import { sessionService } from '../../features/engine/SessionService';
import { ContentGenerator } from '../../features/engine/ContentGenerator';
import { database } from '../../database';
import ContentItem from '../../database/models/ContentItem';
import { Q } from '@nozbe/watermelondb';

interface RSVPBoardProps {
    isPlaying: boolean;
    settings: any;
    onScore: (s: number) => void;
}

function RSVPBoard({ isPlaying, settings, onScore }: RSVPBoardProps) {
    const [phase, setPhase] = useState<'IDLE' | 'READING' | 'QUESTION'>('IDLE');
    const [words, setWords] = useState<string[]>([]);
    const [index, setIndex] = useState(0);
    const [currentChunk, setCurrentChunk] = useState('');

    // Question State
    const [question, setQuestion] = useState<any>(null);
    const [currentItem, setCurrentItem] = useState<any>(null); // Track for repeat
    const [showMenu, setShowMenu] = useState(false); // Menu State

    // Speed Calculation
    const wpm = settings.wpm || 300;
    const chunkSize = settings.chunk || 1;
    const isManual = settings.source === 'Manual Input';

    // Delay = (60000 / WPM) * ChunkSize
    const delay = (60000 / wpm) * chunkSize;

    // DB State
    const [dbItems, setDbItems] = useState<any[]>([]);

    // Manual State
    const [customText, setCustomText] = useState('');
    const [manualReady, setManualReady] = useState(false);

    useEffect(() => {
        if (isPlaying && phase === 'IDLE') {
            if (isManual && !manualReady) {
                // Wait for user input
            } else {
                // Only load if NOT showing menu
                if (!showMenu) loadAndStart();
            }
        }
    }, [isPlaying, phase, wpm, chunkSize, isManual, manualReady, showMenu]);

    const loadAndStart = async () => {
        if (dbItems.length === 0) {
            try {
                const collection = database.collections.get<ContentItem>('content_items');
                const items = await collection.query(
                    Q.where('exercise_id', 'rsvp_reader'),
                    Q.take(10)
                ).fetch();

                if (items.length > 0) {
                    const shuffled = items.sort(() => Math.random() - 0.5).map(i => JSON.parse(i.contentJson));
                    setDbItems(shuffled);
                    startFromDb(shuffled[0]);
                } else {
                    startReading();
                }
            } catch (e) {
                startReading();
            }
        } else {
            // Already have items, pick random or next
            const next = dbItems[Math.floor(Math.random() * dbItems.length)];
            startFromDb(next);
        }
    };

    const startFromDb = (item: any) => {
        setCurrentItem(item); // Save for repeat
        setQuestion(item.question);
        setWords(item.text.split(' '));
        setIndex(0);
        setPhase('READING');
    };

    useEffect(() => {
        let timer: any;
        if (phase === 'READING' && index < words.length) {
            timer = setTimeout(() => {
                const chunk = words.slice(index, index + chunkSize).join(' ');
                setCurrentChunk(chunk);
                setIndex(prev => prev + chunkSize);
            }, delay);
        } else if (phase === 'READING' && index >= words.length) {
            // End of text
            if (question) {
                setPhase('QUESTION');
            } else {
                // No question (e.g. manual mode without auto-gen), just show menu
                setShowMenu(true);
                setPhase('IDLE');
            }
        }
        return () => clearTimeout(timer);
    }, [phase, index, words, delay, chunkSize, question]);

    const startReading = () => {
        // Fallback generator
        const text = ContentGenerator.generateTextChunk(1) + " " + ContentGenerator.generateTextChunk(1);
        const item = { text, question: null }; // No question for random gen yet?
        // Actually generator usually makes questions? 
        // Let's assume manual for now if fallback.
        setWords(text.split(' '));
        setIndex(0);
        setPhase('READING');
        setQuestion(null);
        setCurrentItem(item);
    };

    const handleAnswer = (ans: string) => {
        if (ans === question.answer) onScore(100);
        else onScore(-50); // Penalty

        // Transition state to allow Menu to appear
        setPhase('IDLE');
        setShowMenu(true);
    };

    const handleAction = (action: 'REPEAT' | 'NEXT') => {
        setShowMenu(false); // Close menu
        if (action === 'REPEAT') {
            if (isManual) {
                // Repeat manual text
                const clean = customText.trim();
                setWords(clean.split(/\s+/));
                setIndex(0);
                setPhase('READING');
            } else {
                if (currentItem) startFromDb(currentItem);
                else startReading();
            }
        } else {
            // NEXT
            if (isManual) {
                setManualReady(false); // Go back to input screen
                setPhase('IDLE');
            } else {
                setPhase('IDLE'); // Trigger useEffect to load new
            }
        }
    };

    if (!isPlaying) return <View />;

    // Manual Input UI
    if (isManual && !manualReady) {
        return (
            <View style={styles.board}>
                <Text variant="headlineSmall" style={{ marginBottom: 10 }}>Paste Your Text</Text>
                <TextInput
                    style={{ width: '100%', height: 200, borderColor: '#ccc', borderWidth: 1, padding: 10, marginBottom: 20, borderRadius: 8, backgroundColor: 'white', textAlignVertical: 'top' }}
                    multiline
                    value={customText}
                    onChangeText={setCustomText}
                    placeholder="Paste article, book text, or study notes here..."
                />
                <Button mode="contained" onPress={() => {
                    const clean = customText.trim();
                    if (clean) {
                        setManualReady(true);
                        setWords(clean.split(/\s+/));
                        setIndex(0);
                        setPhase('READING');
                        setQuestion(null); // No auto-questions for manual yet
                    }
                }}>
                    Read Now
                </Button>
            </View>
        );
    }

    if (phase === 'READING') {
        return (
            <View style={styles.board}>
                <Text variant="displayLarge" style={{ fontWeight: 'bold', textAlign: 'center' }}>{currentChunk}</Text>
                <Text style={{ position: 'absolute', bottom: 50, color: '#aaa' }}>Speed: {wpm} WPM ({chunkSize} word/flash)</Text>
            </View>
        );
    }

    if (phase === 'QUESTION' && question) {
        return (
            <View style={styles.board}>
                <Text variant="headlineMedium" style={{ marginBottom: 20 }}>{question.q}</Text>
                <View style={styles.options}>
                    {question.options.map((opt: string, i: number) => (
                        <Button key={i} mode="contained" onPress={() => handleAnswer(opt)} style={{ margin: 5 }}>
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
                <Modal visible={showMenu} onDismiss={() => setShowMenu(false)} contentContainerStyle={styles.modal}>
                    <Text variant="headlineMedium" style={{ textAlign: 'center', marginBottom: 20 }}>Passage Complete</Text>
                    <View style={{ gap: 10 }}>
                        <Button mode="contained" onPress={() => handleAction('REPEAT')}>
                            Repeat Passage
                        </Button>
                        <Button mode="outlined" onPress={() => handleAction('NEXT')}>
                            {isManual ? "Paste New Text" : "Next Passage"}
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
            hideTimer={true} // Zen Mode
            onFinish={async () => {
                await sessionService.saveSession({
                    exerciseId: 'rsvp_reader',
                    rawScore: score,
                    normalizedScore: Math.min(score, 100),
                    metrics: { correct_rounds: score / 100 },
                    durationSeconds: 60
                });
                router.back();
            }}
        >
            {({ isPlaying, customSettings }) => (
                <RSVPBoard
                    isPlaying={isPlaying}
                    settings={customSettings}
                    onScore={(s: number) => setScore(prev => prev + s)}
                />
            )}
        </GameContainer>
    );
}

const styles = StyleSheet.create({
    board: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
    options: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
    modal: { backgroundColor: 'white', padding: 20, margin: 40, borderRadius: 10 }
});
