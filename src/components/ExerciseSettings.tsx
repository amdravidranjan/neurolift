import React from 'react';
import { View, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { Text, Surface, Button, SegmentedButtons } from 'react-native-paper';

interface Props {
    schema: any[];
    values: any;
    onChange: (key: string, val: any) => void;
}

export function ExerciseSettings({ schema, values, onChange }: Props) {
    if (!schema) return null;

    return (
        <Surface style={styles.card} elevation={2}>
            <Text variant="titleMedium" style={{ marginBottom: 20, fontWeight: 'bold' }}>Customization</Text>
            {schema.map((item) => (
                <View key={item.key} style={styles.row}>
                    <Text variant="labelMedium" style={{ marginBottom: 8, color: '#666' }}>{item.label}</Text>

                    {/* Range Sliders */}
                    {item.type === 'slider' && (
                        <View style={{ alignItems: 'center' }}>
                            <Text variant="bodyLarge" style={{ fontWeight: 'bold', color: '#6200ee' }}>
                                {values[item.key]}
                            </Text>
                            <Slider
                                style={{ width: '100%', height: 40 }}
                                minimumValue={item.min}
                                maximumValue={item.max}
                                step={item.step}
                                value={values[item.key] || item.default} // Ensure value exists
                                onValueChange={(val) => onChange(item.key, val)}
                                minimumTrackTintColor="#6200ee"
                                maximumTrackTintColor="#d3d3d3"
                                thumbTintColor="#6200ee"
                            />
                        </View>
                    )}

                    {/* Select / Toggle rendered as Chips/Buttons */}
                    {(item.type === 'select' || item.type === 'toggle') && (
                        <View style={styles.chipContainer}>
                            {item.type === 'toggle' ? (
                                <Button
                                    mode={values[item.key] ? 'contained' : 'outlined'}
                                    onPress={() => onChange(item.key, !values[item.key])}
                                >
                                    {values[item.key] ? 'On' : 'Off'}
                                </Button>
                            ) : (
                                item.options.map((opt: string) => (
                                    <Button
                                        key={opt}
                                        mode={values[item.key] === opt ? 'contained' : 'outlined'}
                                        onPress={() => onChange(item.key, opt)}
                                        compact
                                        style={styles.chip}
                                        labelStyle={{ fontSize: 11 }}
                                    >
                                        {opt}
                                    </Button>
                                ))
                            )}
                        </View>
                    )}
                </View>
            ))}
        </Surface>
    );
}

const styles = StyleSheet.create({
    card: { padding: 20, backgroundColor: 'white', borderRadius: 10, marginVertical: 10 },
    row: { marginBottom: 20 },
    chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { marginBottom: 4 }
});
