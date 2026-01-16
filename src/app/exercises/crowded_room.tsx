import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GameContainer } from '../../components/GameContainer';
import { EXERCISE_REGISTRY } from '../../features/engine/Registry';
import { sessionService } from '../../features/engine/SessionService';

interface CrowdedBoardProps {
    isPlaying: boolean;
    settings: any;
    onFound: () => void;
}

function CrowdedBoard({ isPlaying, settings, onFound }: CrowdedBoardProps) {
    const [items, setItems] = useState<any[]>([]);
    const [target, setTarget] = useState<any>(null);

    const count = settings.distractors || 20;
    const isConjunction = (settings.search_type || 'Conjunction').startsWith('Conjunction');
    const isMoving = settings.movement || false;

    // Features
    const COLORS = ['#e91e63', '#2196f3', '#4caf50', '#ffeb3b'];
    const SHAPES = ['circle', 'square']; // Keeping it simple for reliable rendering

    useEffect(() => {
        if (isPlaying) {
            setupRoom();
        }
    }, [isPlaying, count, isConjunction]); // Reset on settings change

    const setupRoom = () => {
        // 1. Define Target
        const targetColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        const targetShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];

        const newTarget = { id: -1, color: targetColor, shape: targetShape, x: 0, y: 0 }; // Pos set later
        setTarget(newTarget);

        // 2. Generate Distractors
        const newItems = [];
        for (let i = 0; i < count; i++) {
            let color, shape;

            if (isConjunction) {
                // Conjunction: Distractors must share EITHER color OR shape, but NOT both (usually).
                // Or just random mix. Standard conjunction is:
                // Target: Red Circle.
                // Distractors: Red Squares (Share Color) AND Blue Circles (Share Shape).
                // This makes it hard.

                const shareColor = Math.random() > 0.5;
                if (shareColor) {
                    color = targetColor;
                    // Must NOT share shape
                    shape = SHAPES.find(s => s !== targetShape) || 'square';
                } else {
                    // Share shape
                    shape = targetShape;
                    // Must NOT share color
                    color = COLORS.find(c => c !== targetColor) || '#000';
                }
            } else {
                // Feature Search: Target is unique in one dimension (e.g. Color).
                // Target is Red. All distractors are Blue/Green. Shape irrelevant.
                // To guarantee uniqueness, let's say Target has unique Color.
                color = COLORS.find(c => c !== targetColor) || '#000'; // Any non-target color
                shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
            }

            // Random Position
            const x = Math.random() * 280;
            const y = Math.random() * 280;

            newItems.push({
                id: i,
                color,
                shape,
                x,
                y,
                anim: new Animated.ValueXY({ x, y })
            });
        }

        // Insert Target at random index (or just render it specially? No, hidden in list is better)
        // Actually, let's keep target separate in state but merge for rendering?
        // Or push target into items array? Pushing into items array is best for layering.
        const targetX = Math.random() * 280;
        const targetY = Math.random() * 280;
        const realTarget = { ...newTarget, id: 999, x: targetX, y: targetY, anim: new Animated.ValueXY({ x: targetX, y: targetY }) };

        // Shuffle
        const allItems = [...newItems, realTarget].sort(() => Math.random() - 0.5);
        setItems(allItems);

        if (isMoving) moveItems(allItems);
    };

    const moveItems = (currentItems: any[]) => {
        // Simple Brownian motion loop
        currentItems.forEach(item => {
            const destX = Math.max(0, Math.min(280, item.x + (Math.random() * 100 - 50)));
            const destY = Math.max(0, Math.min(280, item.y + (Math.random() * 100 - 50)));

            Animated.timing(item.anim, {
                toValue: { x: destX, y: destY },
                duration: 2000 + Math.random() * 1000,
                useNativeDriver: false
            }).start(() => {
                if (isPlaying) {
                    // Recursive move? Need ref to check if still playing/same round.
                    // For now, let's just do one move or loop. 
                    // Ideally we need a clean loop.
                }
            });
        });
    };

    const handlePress = (id: number) => {
        if (id === 999) { // Target ID
            onFound();
            setupRoom();
        }
    };

    if (!target) return <View />;

    return (
        <View style={styles.board}>
            <View style={styles.hud}>
                <Text variant="titleMedium">Target:</Text>
                <View style={[
                    styles.item,
                    {
                        backgroundColor: target.color,
                        borderRadius: target.shape === 'circle' ? 15 : 0,
                        position: 'relative' // Override absolute positioning for HUD
                    }
                ]} />
            </View>

            <View style={styles.room}>
                {items.map((item) => (
                    <Animated.View
                        key={item.id}
                        style={[
                            styles.item,
                            {
                                backgroundColor: item.color,
                                borderRadius: item.shape === 'circle' ? 15 : 0,
                                left: item.anim.x, // Use Animated Value
                                top: item.anim.y,
                                position: 'absolute'
                            }
                        ]}
                    >
                        <TouchableOpacity
                            style={{ width: '100%', height: '100%' }}
                            onPress={() => handlePress(item.id)}
                        />
                    </Animated.View>
                ))}
            </View>
        </View>
    );
}

export default function CrowdedRoom() {
    const router = useRouter();
    const [score, setScore] = useState(0);

    return (
        <GameContainer
            config={{ ...EXERCISE_REGISTRY['crowded_room'], params: {} }}
            modes={['Standard', 'Moving']}
            onFinish={async () => {
                await sessionService.saveSession({
                    exerciseId: 'crowded_room',
                    rawScore: score,
                    normalizedScore: Math.min(score * 10, 100),
                    metrics: { found: score },
                    durationSeconds: 60
                });
                router.back();
            }}
        >
            {({ isPlaying, customSettings }) => (
                <CrowdedBoard
                    isPlaying={isPlaying}
                    settings={customSettings}
                    onFound={() => setScore(s => s + 1)}
                />
            )}
        </GameContainer>
    );
}

const styles = StyleSheet.create({
    board: { flex: 1, alignItems: 'center', width: '100%' },
    room: { width: 320, height: 320, backgroundColor: '#eee', position: 'relative', overflow: 'hidden', borderRadius: 8, borderColor: '#aaa', borderWidth: 1 },
    item: { width: 30, height: 30, position: 'absolute' }, // borderRadius dynamic
    hud: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 20, padding: 10, backgroundColor: 'white', borderRadius: 20, elevation: 2 }
});
