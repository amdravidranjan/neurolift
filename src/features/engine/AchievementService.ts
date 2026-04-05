import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'neurolift_achievements_v1';
const DAILY_CHALLENGE_KEY = 'neurolift_daily_challenge_done';

export interface Achievement {
    id: string;
    label: string;
    description: string;
    icon: string;
    unlocked: boolean;
    unlockedAt?: string;
}

const ACHIEVEMENT_DEFS: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
    { id: 'first_rep', label: 'First Rep', description: 'Complete your first session', icon: 'check-circle' },
    { id: 'on_a_roll', label: 'On A Roll', description: '3-day training streak', icon: 'fire' },
    { id: 'weekly_warrior', label: 'Weekly Warrior', description: '7-day training streak', icon: 'fire-fill' },
    { id: 'speed_demon', label: 'Speed Demon', description: 'RSVP at ≥600 WPM', icon: 'lightning' },
    { id: 'memory_master', label: 'Memory Master', description: 'N-Back at N=4', icon: 'brain' },
    { id: 'centurion', label: 'Centurion', description: '100 total sessions', icon: 'trophy' },
    { id: 'perfect_score', label: 'Perfect Score', description: 'Score 100/100 in any session', icon: 'star' },
    { id: 'completionist', label: 'Completionist', description: 'Play every exercise at least once', icon: 'medal' },
];

export interface CheckParams {
    exerciseId: string;
    normalizedScore: number;
    metrics?: Record<string, any>;
    streak?: number;
    totalSessions?: number;
    allPlayedExerciseIds?: string[];
    totalNonHiddenExercises?: number;
}

class AchievementService {
    async getAll(): Promise<Achievement[]> {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const unlocked: Record<string, string> = stored ? JSON.parse(stored) : {};
        return ACHIEVEMENT_DEFS.map(def => ({
            ...def,
            unlocked: !!unlocked[def.id],
            unlockedAt: unlocked[def.id],
        }));
    }

    async getUnlocked(): Promise<Achievement[]> {
        const all = await this.getAll();
        return all.filter(a => a.unlocked);
    }

    async checkAndUnlock(params: CheckParams): Promise<Achievement[]> {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const unlocked: Record<string, string> = stored ? JSON.parse(stored) : {};
        const now = new Date().toISOString();
        const newlyUnlocked: Achievement[] = [];

        const unlock = (id: string) => {
            if (!unlocked[id]) {
                unlocked[id] = now;
                const def = ACHIEVEMENT_DEFS.find(d => d.id === id)!;
                newlyUnlocked.push({ ...def, unlocked: true, unlockedAt: now });
            }
        };

        // first_rep — any session
        unlock('first_rep');

        // perfect_score
        if (params.normalizedScore >= 100) unlock('perfect_score');

        // speed_demon — RSVP at ≥600 WPM
        if (params.exerciseId === 'rsvp_reader' && params.metrics?.wpm >= 600) unlock('speed_demon');

        // memory_master — N-Back N=4
        if (params.exerciseId === 'n_back_memory' && params.metrics?.n >= 4) unlock('memory_master');

        // streak achievements
        if (params.streak !== undefined) {
            if (params.streak >= 3) unlock('on_a_roll');
            if (params.streak >= 7) unlock('weekly_warrior');
        }

        // centurion
        if (params.totalSessions !== undefined && params.totalSessions >= 100) unlock('centurion');

        // completionist
        if (
            params.allPlayedExerciseIds !== undefined &&
            params.totalNonHiddenExercises !== undefined &&
            params.allPlayedExerciseIds.length >= params.totalNonHiddenExercises
        ) {
            unlock('completionist');
        }

        if (newlyUnlocked.length > 0) {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked));
        }

        return newlyUnlocked;
    }

    async isDailyChallengeCompleted(): Promise<boolean> {
        const key = `${DAILY_CHALLENGE_KEY}_${new Date().toISOString().split('T')[0]}`;
        const val = await AsyncStorage.getItem(key);
        return val === 'true';
    }

    async markDailyChallengeCompleted(): Promise<void> {
        const key = `${DAILY_CHALLENGE_KEY}_${new Date().toISOString().split('T')[0]}`;
        await AsyncStorage.setItem(key, 'true');
    }
}

export const achievementService = new AchievementService();
