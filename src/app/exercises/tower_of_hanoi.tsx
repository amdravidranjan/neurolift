import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Alert } from 'react-native';
import { Text, Button, Surface, Modal, Portal } from 'react-native-paper';
import { GameContainer } from '../../components/GameContainer';
import { EXERCISE_REGISTRY } from '../../features/engine/Registry';
import { useRouter } from 'expo-router';

// --- BOARD COMPONENT ---
// (Keeping component logic separate)

interface HanoiBoardProps {
    disks: number;
    pegs: number;
    blind: boolean;
    onWin: () => void;
    onMove: () => void;
}

function HanoiBoard({ disks, pegs, blind, onWin, onMove }: HanoiBoardProps) {
    const [towers, setTowers] = useState<number[][]>([]);
    const [selectedPeg, setSelectedPeg] = useState<number | null>(null);
    const width = Dimensions.get('window').width;
    const towerWidth = (width - 40) / pegs;

    useEffect(() => {
        reset();
    }, [disks, pegs]);

    const reset = () => {
        const t1 = Array.from({ length: disks }, (_, i) => disks - i); // [3, 2, 1]
        const empty = Array.from({ length: pegs - 1 }, () => []);
        setTowers([t1, ...empty]);
        setSelectedPeg(null);
    };

    const handlePegPress = (pegIndex: number) => {
        if (selectedPeg === null) {
            // Select logic
            if (towers[pegIndex].length > 0) {
                setSelectedPeg(pegIndex);
            }
        } else {
            // Move logic
            if (selectedPeg === pegIndex) {
                setSelectedPeg(null); // Cancel
                return;
            }

            const source = towers[selectedPeg];
            const target = towers[pegIndex];
            const disk = source[source.length - 1];
            const topTarget = target.length > 0 ? target[target.length - 1] : Infinity;

            if (disk < topTarget) {
                // Valid move
                const newTowers = [...towers];
                newTowers[selectedPeg] = source.slice(0, -1);
                newTowers[pegIndex] = [...target, disk];
                setTowers(newTowers);
                setSelectedPeg(null);
                onMove();

                // Check Win
                // Win if rightmost tower has all disks
                if (newTowers[pegs - 1].length === disks) {
                    setTimeout(onWin, 100);
                }
            } else {
                // Invalid
                Alert.alert("Invalid Move", "You cannot place a larger disk on a smaller one.");
                setSelectedPeg(null);
            }
        }
    };

    return (
        <View style={{ flexDirection: 'row', height: 300, alignItems: 'flex-end', justifyContent: 'space-around', width: '100%' }}>
            {towers.map((tower, i) => (
                <View key={i} style={{ alignItems: 'center' }}>
                    <Button
                        mode={selectedPeg === i ? "contained" : "outlined"}
                        onPress={() => handlePegPress(i)}
                        style={{ marginBottom: 10 }}
                    >
                        Peg {i + 1}
                    </Button>
                    <View style={{ width: 10, height: 200, backgroundColor: '#ccc', position: 'absolute', bottom: 50, zIndex: -1 }} />
                    <View style={{ flexDirection: 'column-reverse', height: 200, justifyContent: 'flex-start' }}>
                        {tower.map((d, index) => (
                            <Surface key={d} style={{
                                width: 40 + (d * 20),
                                height: 20,
                                backgroundColor: blind ? '#333' : `hsl(${d * 40}, 70%, 50%)`,
                                marginBottom: 2,
                                borderRadius: 5,
                                elevation: 2
                            }}>
                                {!blind && <Text style={{ textAlign: 'center', color: 'white' }}>{d}</Text>}
                            </Surface>
                        ))}
                    </View>
                </View>
            ))}
        </View>
    );
}

function TowerGame({ customSettings, setSettings }: { customSettings: any, setSettings?: (s: any) => void }) {
    const disks = customSettings.disks || 3;
    const pegs = Number(customSettings.pegs || 3);
    const blind = customSettings.blind || false;

    const [moves, setMoves] = useState(0);
    const minMoves = Math.pow(2, disks) - 1;

    // Victory State
    const [victoryModalVisible, setVictoryModalVisible] = useState(false);
    const [finalMoves, setFinalMoves] = useState(0);
    const router = useRouter(); // For finish

    // useEffect to reset moves on setting change
    useEffect(() => {
        setMoves(0);
    }, [disks, pegs]);

    const handleWin = () => {
        setFinalMoves(moves);
        setVictoryModalVisible(true);
    };

    const handleNextLevel = () => {
        setVictoryModalVisible(false);
        // Increase disks by 1
        if (setSettings) {
            setSettings({ disks: Math.min(disks + 1, 8) }); // Cap at 8
        }
    };

    const handleFinish = () => {
        setVictoryModalVisible(false);
        const { sessionService } = require('../../features/engine/SessionService');
        sessionService.saveSession({
            exerciseId: 'tower_of_hanoi',
            rawScore: disks, // Score = disks solved (or maybe calculate a score based on disks - moves)
            normalizedScore: Math.max(0, 100 - (moves - minMoves)), // Dummy normalization
            metrics: { moves, minMoves, disks },
            durationSeconds: 0
        });
        router.back();
    };

    return (
        <View style={styles.container}>
            <Portal>
                <Modal visible={victoryModalVisible} onDismiss={() => { }} contentContainerStyle={styles.modal}>
                    <Text variant="headlineMedium" style={{ textAlign: 'center', marginBottom: 10 }}>🎉 Solved!</Text>
                    <Text variant="bodyLarge" style={{ textAlign: 'center' }}>
                        You solved {disks} disks in {finalMoves} moves.
                    </Text>
                    <Text variant="bodyMedium" style={{ textAlign: 'center', color: '#666', marginBottom: 20 }}>
                        Minimum possible: {minMoves}
                    </Text>
                    <View style={{ gap: 10 }}>
                        <Button mode="contained" onPress={handleNextLevel}>
                            Next Level (+1 Disk)
                        </Button>
                        <Button mode="outlined" onPress={handleFinish}>
                            Finish & Save
                        </Button>
                    </View>
                </Modal>
            </Portal>

            <View style={styles.hud}>
                <Text variant="titleMedium">Moves: {moves}</Text>
                <Text variant="titleMedium">Min: {minMoves}</Text>
            </View>
            <HanoiBoard disks={disks} pegs={pegs} blind={blind} onWin={handleWin} onMove={() => setMoves(m => m + 1)} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    hud: { flexDirection: 'row', gap: 20, marginBottom: 20 },
    modal: { backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 10 }
});

export default function TowerOfHanoi() {
    return (
        <GameContainer
            config={EXERCISE_REGISTRY['tower_of_hanoi']}
            hideTimer={true} // Zen Mode
            onFinish={async () => {
                // Fallback
            }}
        >
            {({ customSettings, setSettings }) => (
                <TowerGame
                    customSettings={customSettings}
                    setSettings={setSettings}
                />
            )}
        </GameContainer>
    );
}
