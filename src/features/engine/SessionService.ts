import { database } from '../../database';
import Score from '../../database/models/Score';
import Session from '../../database/models/Session';
import { Q } from '@nozbe/watermelondb';

export interface GameResult {
    exerciseId: string;
    rawScore: number;
    normalizedScore: number;
    metrics: Record<string, any>;
    durationSeconds: number;
}

class SessionService {
    async saveSession(result: GameResult) {
        await database.write(async () => {
            const session = await database.collections.get<Session>('sessions').create(s => {
                s.durationSeconds = result.durationSeconds;
                s.totalXp = result.normalizedScore;
            });
            await database.collections.get<Score>('scores').create(score => {
                score.session.set(session);
                score.exerciseId = result.exerciseId;
                score.rawScore = result.rawScore;
                score.normalizedScore = result.normalizedScore;
                score.metrics = result.metrics;
            });
        });
    }

    async getRecentSessions(limit = 10) {
        return await database.collections.get<Session>('sessions')
            .query(Q.sortBy('created_at', Q.desc), Q.take(limit))
            .fetch();
    }

    async getHighScore(exerciseId: string): Promise<number> {
        const scores = await database.collections.get<Score>('scores')
            .query(
                Q.where('exercise_id', exerciseId),
                Q.sortBy('raw_score', Q.desc),
                Q.take(1)
            )
            .fetch();
        return scores.length > 0 ? scores[0].rawScore : 0;
    }

    async getAllPlayedExerciseIds(): Promise<string[]> {
        const scores = await database.collections.get<Score>('scores').query().fetch();
        return [...new Set(scores.map(s => s.exerciseId))];
    }

    async getTotalSessionCount(): Promise<number> {
        return await database.collections.get<Session>('sessions').query().fetchCount();
    }

    async clearAllData() {
        await database.write(async () => {
            const sessions = await database.collections.get<Session>('sessions').query().fetch();
            const scores = await database.collections.get<Score>('scores').query().fetch();
            await Promise.all(scores.map(s => s.destroyPermanently()));
            await Promise.all(sessions.map(s => s.destroyPermanently()));
        });
    }
}

export const sessionService = new SessionService();
