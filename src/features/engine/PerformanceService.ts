import { database } from '../../database';
import Score from '../../database/models/Score';
import { EXERCISE_REGISTRY } from './Registry';

// Maps each pillar to one of the 5 radar axes
const PILLAR_TO_RADAR: Record<string, string> = {
    memory: 'Memory',
    language: 'Memory',
    learning: 'Memory',
    attention: 'Inhibition',
    calm: 'Inhibition',
    social: 'Inhibition',
    processing_speed: 'Speed',
    sensory: 'Speed',
    adaptability: 'Flexibility',
    creativity: 'Flexibility',
    metacognition: 'Flexibility',
    reasoning: 'Solving',
    executive: 'Solving',
};

export const RADAR_AXES = ['Memory', 'Inhibition', 'Speed', 'Flexibility', 'Solving'];

export interface RadarDataPoint {
    label: string;
    value: number;
}

export class PerformanceService {
    async getPillarScores(): Promise<RadarDataPoint[]> {
        const scores = await database.collections.get<Score>('scores').query().fetch();

        const axisSum: Record<string, number> = {};
        const axisCount: Record<string, number> = {};
        RADAR_AXES.forEach(axis => { axisSum[axis] = 0; axisCount[axis] = 0; });

        scores.forEach(score => {
            const exercise = EXERCISE_REGISTRY[score.exerciseId];
            if (!exercise) return;
            const axis = PILLAR_TO_RADAR[exercise.pillarId];
            if (!axis) return;
            axisSum[axis] += score.normalizedScore;
            axisCount[axis]++;
        });

        return RADAR_AXES.map(axis => ({
            label: axis,
            value: axisCount[axis] > 0 ? Math.round(axisSum[axis] / axisCount[axis]) : 0,
        }));
    }

    async getWeakestRadarLabel(): Promise<string> {
        const scores = await this.getPillarScores();
        let weakest = scores[0];
        scores.forEach(s => { if (s.value < weakest.value) weakest = s; });
        return weakest.label;
    }

    async getDailyChallengeExerciseId(): Promise<string | null> {
        const weakestAxis = await this.getWeakestRadarLabel();

        // Find pillars that map to the weakest axis
        const matchingPillars = Object.entries(PILLAR_TO_RADAR)
            .filter(([, axis]) => axis === weakestAxis)
            .map(([pillar]) => pillar);

        // Find all non-hidden exercises in those pillars
        const candidates = Object.values(EXERCISE_REGISTRY).filter(
            ex => !ex.hidden && matchingPillars.includes(ex.pillarId)
        );

        if (candidates.length === 0) return null;

        // Date-seeded pick — same exercise all day
        const today = new Date();
        const dayIndex = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
        return candidates[dayIndex % candidates.length].id;
    }
}

export const performanceService = new PerformanceService();
