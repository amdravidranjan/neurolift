import { database } from '../../database';
import Session from '../../database/models/Session';
import Score from '../../database/models/Score';
import { Q } from '@nozbe/watermelondb';

export interface DailyStats {
    date: string;
    count: number;
}

class AnalyticsService {
    async getDailySessionCounts(): Promise<DailyStats[]> {
        const endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);

        const sessions = await database.collections.get<Session>('sessions')
            .query(Q.where('created_at', Q.gte(startDate.getTime())))
            .fetch();

        const counts: Record<string, number> = {};
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(endDate.getDate() - i);
            counts[d.toISOString().split('T')[0]] = 0;
        }

        sessions.forEach(s => {
            const dayKey = new Date(s.createdAt).toISOString().split('T')[0];
            if (counts[dayKey] !== undefined) counts[dayKey]++;
        });

        return Object.keys(counts).sort().map(date => ({ date, count: counts[date] }));
    }

    async getTotalXP(): Promise<number> {
        // Sum totalXp from all sessions — acceptable for current scale
        // TODO: replace with SQL aggregation if session count grows large
        const sessions = await database.collections.get<Session>('sessions').query().fetch();
        return sessions.reduce((sum, s) => sum + s.totalXp, 0);
    }

    async getAllScores(): Promise<Score[]> {
        return database.collections.get<Score>('scores').query().fetch();
    }
}

export const analyticsService = new AnalyticsService();
