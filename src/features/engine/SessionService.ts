import { database } from '../../database';
import Score from '../../database/models/Score';
import Session from '../../database/models/Session';
import { Model, Q } from '@nozbe/watermelondb';

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
            // 1. Create a new Session
            const session = await database.collections.get<Session>('sessions').create(session => {
                session.durationSeconds = result.durationSeconds;
                session.totalXp = result.normalizedScore; // Generic XP mapping for now
                // session.createdAt is auto-managed? Usually yes, but we can set it if needed.
            });

            // 2. Create the Score record linked to the session
            await database.collections.get<Score>('scores').create(score => {
                score.session.set(session);
                score.exerciseId = result.exerciseId;
                score.rawScore = result.rawScore;
                score.normalizedScore = result.normalizedScore;
                score.metrics = result.metrics;
            });

            console.log(`[SessionService] Saved session for ${result.exerciseId}`);
        });
    }

    async getRecentSessions(limit = 10) {
        return await database.collections.get<Session>('sessions')
            .query()
            .fetch();
    }

    async getHighScore(exerciseId: string): Promise<number> {
        const scores = await database.collections.get<Score>('scores')
            .query(
                Q.where('exercise_id', exerciseId),
                Q.sortBy('raw_score', Q.desc), // Assuming higher is better. For time-based (lower is better), we might need logic.
                Q.take(1)
            )
            .fetch();
        return scores.length > 0 ? scores[0].rawScore : 0;
    }

    async clearAllData() {
        await database.write(async () => {
            // Delete all sessions and scores
            // Note: WatermelonDB doesn't have a truncate command, so we query all and mark as deleted.
            const sessions = await database.collections.get<Session>('sessions').query().fetch();
            const scores = await database.collections.get<Score>('scores').query().fetch();

            await Promise.all(scores.map(s => s.markAsDeleted()));
            await Promise.all(sessions.map(s => s.markAsDeleted()));

            // Actually destroy permanently if needed, but markAsDeleted is safer/standard
            await Promise.all(scores.map(s => s.destroyPermanently()));
            await Promise.all(sessions.map(s => s.destroyPermanently()));
        });
    }
}

export const sessionService = new SessionService();
