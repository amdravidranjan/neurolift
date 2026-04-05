export const XP_THRESHOLDS = [0, 500, 1500, 3500, 7000, 12000];
export const LEVEL_LABELS = ['Rookie', 'Trainee', 'Practitioner', 'Expert', 'Master', 'Legend'];

export class XPService {
    static getLevel(totalXP: number): number {
        let level = 0;
        for (let i = 0; i < XP_THRESHOLDS.length; i++) {
            if (totalXP >= XP_THRESHOLDS[i]) level = i;
            else break;
        }
        return level;
    }

    static getProgressToNext(totalXP: number): number {
        const level = XPService.getLevel(totalXP);
        if (level >= XP_THRESHOLDS.length - 1) return 1;
        const current = XP_THRESHOLDS[level];
        const next = XP_THRESHOLDS[level + 1];
        return (totalXP - current) / (next - current);
    }

    static getLevelLabel(level: number): string {
        return LEVEL_LABELS[Math.min(level, LEVEL_LABELS.length - 1)];
    }

    static calculateXP(normalizedScore: number, difficulty: number = 1): number {
        const multiplier = difficulty === 3 ? 2 : difficulty === 2 ? 1.5 : 1;
        return Math.round(normalizedScore * multiplier);
    }
}
