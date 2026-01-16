import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { GameContainer } from '../../components/GameContainer';
import { EXERCISE_REGISTRY } from '../../features/engine/Registry';
import { sessionService } from '../../features/engine/SessionService';
import { SHAPES } from '../../features/engine/data/ShapeLibrary';

interface RotatorBoardProps {
    isPlaying: boolean;
    settings: any;
    score: number;
    onScore: (s: number) => void;
}

function RotatorBoard({ isPlaying, settings, score, onScore }: RotatorBoardProps) {
    const [targetAngle, setTargetAngle] = useState(0);
    const [isMirrored, setIsMirrored] = useState(false);
    const [currentShape, setCurrentShape] = useState<any>(null);
    const rotAnim = useRef(new Animated.Value(0)).current;

    const stepSize = settings.step === '45°' ? 45 : 90;
    const axisSetting = settings.axis || 'Z-Axis (2D)';
    const allowMirror = settings.mirror || false;
    const complexity = settings.complexity || 'Basic (Letter)';

    useEffect(() => {
        if (isPlaying) {
            pickNewShape();
            reset();
        }
    }, [isPlaying, stepSize, axisSetting, complexity]);

    const pickNewShape = () => {
        const pool = SHAPES[complexity] || SHAPES['Basic (Letter)'];
        if (pool && pool.length > 0) {
            const randomShape = pool[Math.floor(Math.random() * pool.length)];
            setCurrentShape(randomShape);
        } else {
            setCurrentShape(null); // Fallback to 'R'
        }
    };

    const reset = () => {
        const steps = 360 / stepSize;
        const newTarget = Math.floor(Math.random() * steps) * stepSize;
        setTargetAngle(newTarget);

        if (allowMirror) {
            setIsMirrored(Math.random() > 0.5);
        } else {
            setIsMirrored(false);
        }

        // Also pick new shape on every round? Yes, variety.
        pickNewShape();

        // Animation for effect
        rotAnim.setValue(0);
        Animated.timing(rotAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: false
        }).start();
    };

    const handleGuess = (guess: number) => {
        if (guess === targetAngle) {
            onScore(1);
        } else {
            // Wrong Guess
            onScore(-1);
        }
        reset();
    };

    const spin = rotAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', `${targetAngle}deg`]
    });

    // Axis Logic
    let transform: any[] = [{ perspective: 1000 }];

    if (axisSetting.includes('X')) {
        transform.push({ rotateX: spin });
    } else if (axisSetting.includes('Y')) {
        transform.push({ rotateY: spin });
    } else {
        transform.push({ rotateZ: spin });
    }

    if (isMirrored) {
        transform.push({ scaleX: -1 });
    }

    const animatedStyle = { transform };
    const options = Array.from({ length: 360 / stepSize }, (_, i) => i * stepSize);

    return (
        <View style={styles.board}>
            <Text variant="titleMedium" style={{ position: 'absolute', top: 20, right: 20, color: '#666' }}>Score: {score}</Text>

            <View style={styles.stage}>
                <Animated.View style={[styles.shape, animatedStyle]}>
                    {complexity === 'Basic (Letter)' || !currentShape ? (
                        <Text style={{ fontSize: 80, fontWeight: 'bold' }}>R</Text>
                    ) : (
                        <Svg width="100" height="100" viewBox={currentShape.viewBox || "0 0 100 100"}>
                            <Path d={currentShape.path} fill={currentShape.fill} />
                        </Svg>
                    )}

                    {/* Directional Marker */}
                    <View style={styles.marker} />
                </Animated.View>
            </View>

            <Text style={{ marginVertical: 30 }}>
                Identify the Angle {isMirrored && "(Mirrored!)"}
            </Text>

            <View style={[styles.controls, { flexWrap: 'wrap', width: 300, justifyContent: 'center' }]}>
                {options.map((deg) => (
                    <TouchableOpacity
                        key={deg}
                        style={[styles.btn, { minWidth: stepSize === 45 ? 60 : 80, margin: 5 }]}
                        onPress={() => handleGuess(deg)}
                    >
                        <Text style={{ color: 'white', textAlign: 'center' }}>{deg}°</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

export default function SpatialRotator() {
    const router = useRouter();
    const [score, setScore] = useState(0);

    return (
        <GameContainer
            config={{ ...EXERCISE_REGISTRY['spatial_rotator'], params: {} }}
            modes={['Standard', '3D (X-Axis)', '3D (Y-Axis)']}
            onFinish={async () => {
                await sessionService.saveSession({
                    exerciseId: 'spatial_rotator',
                    rawScore: score,
                    normalizedScore: Math.min(score * 10, 100),
                    metrics: { correct: score },
                    durationSeconds: 60
                });
                router.back();
            }}
        >
            {({ isPlaying, customSettings }) => (
                <RotatorBoard
                    isPlaying={isPlaying}
                    settings={customSettings}
                    score={score}
                    onScore={(s: number) => setScore(prev => prev + s)}
                />
            )}
        </GameContainer>
    );
}

const styles = StyleSheet.create({
    board: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    stage: { width: 200, height: 200, justifyContent: 'center', alignItems: 'center', backgroundColor: '#eee', borderRadius: 20 },
    shape: { width: 100, height: 100, backgroundColor: '#bbdefb', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#1976d2' },
    marker: { position: 'absolute', top: 5, width: 10, height: 10, backgroundColor: 'red', borderRadius: 5 },
    controls: { flexDirection: 'row', gap: 10 },
    btn: { padding: 15, backgroundColor: '#6200ee', borderRadius: 8 }
});
