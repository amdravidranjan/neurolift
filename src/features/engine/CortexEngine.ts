import { Q } from '@nozbe/watermelondb';
import { database } from '../../database';
import Score from '../../database/models/Score';
import User from '../../database/models/User';
import { EXERCISE_REGISTRY } from './Registry';

// Difficulty is 1-10
export type DifficultyLevel = number;

export interface ExerciseConfig {
    id: string;
    pillarId: string;
    name: string;
    description: string;
    tutorial?: string; // New field for how-to instructions
    baseDifficulty: {
        speedMs: number;
        complexity: number;
    };
    hidden?: boolean; // If true, excluded from main selection
    settingsSchema?: Array<{
        key: string;
        label: string;
        type: 'slider' | 'select' | 'toggle';
        min?: number;
        max?: number;
        step?: number;
        options?: string[]; // For select
        default: any;
    }>;
    params?: Record<string, any>; // Flexible params (e.g. { speed: 500, n: 2 })
}

class CortexEngine {
    // Singleton pattern if needed, or just export instance

    /**
     * Calculates the appropriate difficulty for the next session
     * based on the user's recent performance.
     * Target success rate: 85% (Flow State)
     */
    async getNextDifficulty(exerciseId: string): Promise<ExerciseConfig> {
        const recentScores = await database.collections.get<Score>('scores')
            .query(
                Q.where('exercise_id', exerciseId),
                Q.sortBy('created_at', Q.desc),
                Q.take(5)
            ).fetch();

        if (recentScores.length === 0) {
            return this.getBaselineConfig(exerciseId);
        }

        // Simple Adaptive Logic (Placeholder for deeper Algo)
        const avgScore = recentScores.reduce((sum, s) => sum + s.normalizedScore, 0) / recentScores.length;

        // If > 90%, increase difficulty. If < 70%, decrease.
        // This is where we would fetch the current difficulty from the last session params
        // For now, returning a mock adaptive response

        console.log(`[Cortex] Analyzed ${recentScores.length} sessions. Avg Score: ${avgScore}`);

        return this.getBaselineConfig(exerciseId); // TODO: Implement modifier
    }

    private getBaselineConfig(exerciseId: string): ExerciseConfig {
        const registryItem = EXERCISE_REGISTRY[exerciseId];
        if (!registryItem) {
            console.warn(`[Cortex] Unknown exercise: ${exerciseId}`);
            return {
                id: exerciseId,
                pillarId: '0',
                name: 'Unknown',
                description: 'Unknown Exercise',
                baseDifficulty: { speedMs: 2000, complexity: 1 },
                params: {}
            };
        }

        return {
            ...registryItem,
            params: {
                // Default params based on difficulty 1
                speedMs: 2000,
                trials: 10,
                nBack: 1,
            }
        };
    }

    /**
     * Generates a daily training plan.
     * Logic: 1 Warmup (Attention) + 1 Weakness + 1 Strength
     */
    async generateDailyPlan(userId: string): Promise<string[]> {
        console.log(`[Cortex] Generating plan for user ${userId}`);
        // Ideally we fetch the user's weakest pillar from the database
        // For now, we return a standard balanced set

        return [
            'vigilance_sentry', // Warmup (Attention)
            'n_back_memory',    // Hard (Memory)
            'rapid_fire'        // Finisher (Speed)
        ];
    }
}

export const cortex = new CortexEngine();
