import { database } from '../../database';
import Session from '../../database/models/Session';
import { Q } from '@nozbe/watermelondb';

function toDateKey(timestamp: number): string {
    const d = new Date(timestamp);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function dateKeyToMs(key: string): number {
    return new Date(key + 'T00:00:00').getTime();
}

function prevDateKey(key: string): string {
    const ms = dateKeyToMs(key);
    return toDateKey(ms - 86400000);
}

export class StreakService {
    async calculateStreak(): Promise<number> {
        const sessions = await database.collections.get<Session>('sessions')
            .query(Q.sortBy('created_at', Q.desc))
            .fetch();

        if (sessions.length === 0) return 0;

        const uniqueDayKeys = new Set<string>();
        sessions.forEach(s => uniqueDayKeys.add(toDateKey(s.createdAt)));

        const sortedKeys = Array.from(uniqueDayKeys).sort((a, b) => b.localeCompare(a));

        const todayKey = toDateKey(Date.now());
        const yesterdayKey = prevDateKey(todayKey);

        // Streak must start today or yesterday
        if (sortedKeys[0] !== todayKey && sortedKeys[0] !== yesterdayKey) {
            return 0;
        }

        let streak = 0;
        let expectedKey = sortedKeys[0];
        for (const key of sortedKeys) {
            if (key === expectedKey) {
                streak++;
                expectedKey = prevDateKey(expectedKey);
            } else {
                break;
            }
        }

        return streak;
    }
}

export const streakService = new StreakService();
