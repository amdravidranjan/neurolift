import { EXERCISE_REGISTRY } from '../engine/Registry';

export interface AssessmentConfig {
    id: string;
    exerciseId: string;
    settings: any; // Fixed settings for standardization
    duration: number; // Seconds
}

export const ASSESSMENT_BATTERY: AssessmentConfig[] = [
    {
        id: 'test_memory_update',
        exerciseId: 'n_back_memory',
        settings: { n: 2, mode: 'Visual', interval: 2500 },
        duration: 90
    },
    {
        id: 'test_inhibition',
        exerciseId: 'impulse_control',
        settings: { mode: 'Stop-Signal (SST)', ssd: 250, prob: 30 },
        duration: 60
    },
    {
        id: 'test_reasoning',
        exerciseId: 'pattern_matrix',
        settings: { gridSize: '3x3', difficulty: 3 },
        duration: 120
    },
    {
        id: 'test_capacity',
        exerciseId: 'digit_span',
        settings: { mode: 'Reverse', speed: 1000 },
        duration: 120
    },
    {
        id: 'test_manipulation',
        exerciseId: 'mental_workbench',
        settings: { steps: 3, ops: 'Mixed (X /)' },
        duration: 90
    }
];

export class AssessmentEngine {
    static getBattery() {
        return ASSESSMENT_BATTERY;
    }

    static calculateReport(results: any[]) {
        const scores: Record<string, number> = {
            'Memory': 0,
            'Control': 0,
            'Reasoning': 0,
            'Processing Speed': 0
        };

        const counts: Record<string, number> = { 'Memory': 0, 'Control': 0, 'Reasoning': 0, 'Processing Speed': 0 };

        results.forEach(r => {
            let domain = 'Processing Speed'; // Default
            if (r.id === 'test_memory_update' || r.id === 'test_capacity') domain = 'Memory';
            if (r.id === 'test_inhibition') domain = 'Control';
            if (r.id === 'test_reasoning' || r.id === 'test_manipulation') domain = 'Reasoning';

            scores[domain] += r.score;
            counts[domain]++;
        });

        // Average out
        let total = 0;
        let categories = 0;
        Object.keys(scores).forEach(key => {
            if (counts[key] > 0) {
                scores[key] = Math.round(scores[key] / counts[key]);
                total += scores[key];
                categories++;
            }
        });

        return {
            domainScores: scores,
            finalScore: categories > 0 ? (total / categories) : 0
        };
    }
}
