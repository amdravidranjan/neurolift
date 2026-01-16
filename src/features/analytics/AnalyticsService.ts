import { database } from '../../database';
import Session from '../../database/models/Session';
import { Q } from '@nozbe/watermelondb';

export interface DailyStats {
    date: string;
    count: number;
}

class AnalyticsService {
    async getDailySessionCounts(): Promise<DailyStats[]> {
        // Determine the last 7 days
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 6);

        const sessions = await database.collections.get<Session>('sessions')
            .query(
                Q.where('created_at', Q.gte(startDate.getTime()))
            ).fetch();

        // Group by date
        const counts: Record<string, number> = {};

        // Initialize last 7 days with 0
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(endDate.getDate() - i);
            const dayKey = d.toISOString().split('T')[0];
            counts[dayKey] = 0;
        }

        // Bucketize
        sessions.forEach(s => {
            const dayKey = new Date(s.createdAt).toISOString().split('T')[0];
            if (counts[dayKey] !== undefined) {
                counts[dayKey]++;
            }
        });

        return Object.keys(counts).sort().map(date => ({
            date,
            count: counts[date]
        }));
    }

    async getTotalXP(): Promise<number> {
        const sessions = await database.collections.get<Session>('sessions').query().fetch();
        return sessions.reduce((sum, s) => sum + s.totalXp, 0);
    }
}

export const analyticsService = new AnalyticsService();
