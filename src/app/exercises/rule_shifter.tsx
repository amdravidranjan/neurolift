import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GameContainer } from '../../components/GameContainer';
import { EXERCISE_REGISTRY } from '../../features/engine/Registry';
import { sessionService } from '../../features/engine/SessionService';

interface RuleShifterBoardProps {
    isPlaying: boolean;
    settings: any;
    onFinishRound: (success: boolean) => void;
}

function RuleShifterBoard({ isPlaying, settings, onFinishRound }: RuleShifterBoardProps) {
    const [ruleIndex, setRuleIndex] = useState(0);
    const [number, setNumber] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
    const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);

    const shiftFreq = settings.shift_freq || 5;
    const isImplicit = (settings.feedback_mode || 'Implicit (Deduce)').startsWith('Implicit');
    const isAdvanced = (settings.complexity || 'Basic').startsWith('Advanced');

    // Rules:
    // 0: Even (Left) vs Odd (Right)
    // 1: > 5 (Left) vs <= 5 (Right)
    // 2: Multiple of 3 (Left) vs Not (Right)

    useEffect(() => {
        if (isPlaying && number === 0) {
            nextNumber();
        }
    }, [isPlaying]);

    const nextNumber = () => {
        setNumber(Math.floor(Math.random() * 20) + 1);
    };

    const handlePress = (side: 'LEFT' | 'RIGHT') => {
        let correct = false;

        // Logic
        if (ruleIndex === 0) { // Even/Odd
            const isEven = number % 2 === 0;
            if ((isEven && side === 'LEFT') || (!isEven && side === 'RIGHT')) correct = true;
        } else if (ruleIndex === 1) { // High/Low
            const isHigh = number > 10; // Changed to 10 since range is 20
            if ((isHigh && side === 'LEFT') || (!isHigh && side === 'RIGHT')) correct = true;
        } else if (ruleIndex === 2) { // Mult 3
            const isMult3 = number % 3 === 0;
            if ((isMult3 && side === 'LEFT') || (!isMult3 && side === 'RIGHT')) correct = true;
        }

        setLastAnswerCorrect(correct);

        if (correct) {
            onFinishRound(true);
            const newStreak = consecutiveCorrect + 1;
            setConsecutiveCorrect(newStreak);

            // Check Shift
            if (newStreak >= shiftFreq) {
                // SHIFT!
                setConsecutiveCorrect(0);
                let nextRule = ruleIndex;
                const maxRules = isAdvanced ? 3 : 2;
                while (nextRule === ruleIndex) {
                    nextRule = Math.floor(Math.random() * maxRules);
                }
                setRuleIndex(nextRule);
                setFeedback("RULE SHIFTED!");
                setTimeout(() => setFeedback(''), 1500);
            } else {
                setFeedback("Keep going...");
                setTimeout(() => setFeedback(''), 500);
            }
        } else {
            onFinishRound(false);
            setFeedback("WRONG MATCH"); // In implicit mode, this is the only clue
            setTimeout(() => setFeedback(''), 1000);
            // Reset streak on error? WCST usually counts consecutive correct to shift. 
            // If you fail, you stay on the rule until you learn it. 
            // So we DO NOT reset the rule, but we might reset the 'consecutive count towards shift' 
            // depending on strictness. Let's NOT reset streak to allow progress, 
            // OR reset it to force mastery. Standard WCST requires continuous runs.
            // Let's reset streak to enforce stability.
            setConsecutiveCorrect(0);
        }

        nextNumber();
    };

    if (!isPlaying) return <View />;

    const getRuleName = (r: number) => {
        if (r === 0) return "Even (L) / Odd (R)";
        if (r === 1) return "> 10 (L) / <= 10 (R)";
        if (r === 2) return "Mult 3 (L) / Other (R)";
        return "???";
    };

    return (
        <View style={styles.board}>
            <Text variant="headlineSmall" style={{ marginBottom: 10, color: '#6200ee' }}>
                {isImplicit ? "Figure out the rule" : `Rule: ${getRuleName(ruleIndex)}`}
            </Text>

            <Text style={{
                color: feedback.includes('WRONG') ? 'red' : 'green',
                fontWeight: 'bold',
                marginBottom: 20,
                height: 30
            }}>{feedback}</Text>

            <Surface style={styles.card} elevation={4}>
                <Text variant="displayLarge">{number}</Text>
            </Surface>

            <View style={styles.controls}>
                <Button mode="contained" onPress={() => handlePress('LEFT')} style={styles.btn} contentStyle={{ height: 60 }}>
                    LEFT
                </Button>
                <Button mode="contained" onPress={() => handlePress('RIGHT')} style={styles.btn} contentStyle={{ height: 60 }}>
                    RIGHT
                </Button>
            </View>

            <Text style={{ marginTop: 20, opacity: 0.5 }}>
                Sort the number into the correct category.
            </Text>
        </View>
    );
}

export default function RuleShifter() {
    const router = useRouter();
    const [score, setScore] = useState(0);

    return (
        <GameContainer
            config={{ ...EXERCISE_REGISTRY['rule_shifter'], params: {} }}
            onFinish={async () => {
                await sessionService.saveSession({
                    exerciseId: 'rule_shifter',
                    rawScore: score,
                    normalizedScore: Math.min(score * 5, 100),
                    metrics: { solved: score },
                    durationSeconds: 60
                });
                router.back();
            }}
        >
            {({ isPlaying, customSettings }) => (
                <RuleShifterBoard
                    isPlaying={isPlaying}
                    settings={customSettings}
                    onFinishRound={(success) => {
                        if (success) setScore(s => s + 1);
                    }}
                />
            )}
        </GameContainer>
    );
}

const styles = StyleSheet.create({
    board: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    controls: { flexDirection: 'row', gap: 40, marginTop: 40 },
    btn: { minWidth: 140 },
    card: { padding: 40, borderRadius: 20, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' }
});
