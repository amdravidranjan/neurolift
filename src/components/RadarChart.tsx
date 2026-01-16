import React from 'react';
import { View, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import Svg, { Polygon, Line, Circle, Text as SvgText } from 'react-native-svg';

interface RadarChartProps {
    data: { label: string, value: number, fullMark: number }[];
    size?: number;
    color?: string;
}

export function RadarChart({ data, size = 300, color = '#6200ee' }: RadarChartProps) {
    const center = size / 2;
    const radius = (size - 60) / 2;
    const angleStep = (Math.PI * 2) / data.length;

    const coordinates = data.map((item, index) => {
        const angle = index * angleStep - Math.PI / 2;
        const valueRatio = item.value / item.fullMark;
        const x = center + Math.cos(angle) * (radius * valueRatio);
        const y = center + Math.sin(angle) * (radius * valueRatio);
        return { x, y };
    });

    const points = coordinates.map(p => `${p.x},${p.y}`).join(' ');

    const axes = data.map((item, index) => {
        const angle = index * angleStep - Math.PI / 2;
        const x = center + Math.cos(angle) * radius;
        const y = center + Math.sin(angle) * radius;

        // Label pos
        const labelX = center + Math.cos(angle) * (radius + 20);
        const labelY = center + Math.sin(angle) * (radius + 20);

        return { x, y, labelX, labelY, label: item.label };
    });

    return (
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Svg height={size} width={size}>
                {/* Background Grid */}
                {[0.2, 0.4, 0.6, 0.8, 1].map(r => (
                    <Circle
                        key={r}
                        cx={center}
                        cy={center}
                        r={radius * r}
                        stroke="#e0e0e0"
                        strokeWidth="1"
                        fill="none"
                    />
                ))}

                {/* Axes */}
                {axes.map((axis, i) => (
                    <Line
                        key={i}
                        x1={center}
                        y1={center}
                        x2={axis.x}
                        y2={axis.y}
                        stroke="#e0e0e0"
                        strokeWidth="1"
                    />
                ))}

                {/* Data Polygon */}
                <Polygon
                    points={points}
                    fill={color}
                    fillOpacity="0.3"
                    stroke={color}
                    strokeWidth="2"
                />

                {/* Labels */}
                {axes.map((axis, i) => (
                    <SvgText
                        key={i}
                        x={axis.labelX}
                        y={axis.labelY}
                        fill="#666"
                        fontSize="12"
                        textAnchor="middle"
                        alignmentBaseline="middle"
                    >
                        {axis.label}
                    </SvgText>
                ))}
            </Svg>
        </View>
    );
}
