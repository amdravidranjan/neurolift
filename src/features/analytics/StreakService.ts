import { database } from '../../database';
import Session from '../../database/models/Session';
import { Q } from '@nozbe/watermelondb';

export class StreakService {
    async calculateStreak(): Promise<number> {
        const sessions = await database.collections.get<Session>('sessions')
            .query(Q.sortBy('created_at', Q.desc))
            .fetch();

        if (sessions.length === 0) return 0;

        let streak = 0;
        const today = new Date().setHours(0, 0, 0, 0);
        const uniqueDays = new Set<number>();

        sessions.forEach(s => {
            const d = new Date(s.createdAt).setHours(0, 0, 0, 0);
            uniqueDays.add(d);
        });

        const sortedDays = Array.from(uniqueDays).sort((a, b) => b - a);

        // Check if training started today or yesterday
        if (sortedDays[0] !== today && sortedDays[0] !== today - 86400000) {
            return 0; // Streak broken
        }

        let currentCheck = sortedDays[0];
        for (let day of sortedDays) {
            if (day === currentCheck) {
                streak++;
                currentCheck -= 86400000;
            } else {
                break;
            }
        }

        return streak;
    }
}

export const streakService = new StreakService();
