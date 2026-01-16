import { EXERCISE_REGISTRY } from './Registry';
import { cortex, ExerciseConfig } from './CortexEngine';

export interface AssessmentStep {
    stepId: number;
    exerciseId: string;
    instruction: string;
    config: ExerciseConfig;
}

const ASSESSMENT_FLOW = ['vigilance_sentry', 'n_back_memory', 'rapid_fire'];

class AssessmentService {
    getSteps(): AssessmentStep[] {
        return ASSESSMENT_FLOW.map((exId, index) => {
            // For assessment, we use fixed difficult params
            const defaultParams = { speedMs: 2500, trials: 5 };
            const config = { ...EXERCISE_REGISTRY[exId], params: defaultParams };

            return {
                stepId: index + 1,
                exerciseId: exId,
                instruction: `Assessment ${index + 1}/${ASSESSMENT_FLOW.length}: Validating ${config.pillarId}`,
                config: config as any
            };
        });
    }

    async completeAssessment(results: { exerciseId: string, score: number }[]) {
        console.log('[Assessment] Completing baseline...', results);
        // In a real app, this would save a "Baseline" object to the DB
        // and initialize the "User" profile with specific weights.
        return true;
    }
}

export const assessmentService = new AssessmentService();
