import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, json, relation } from '@nozbe/watermelondb/decorators'

export default class Score extends Model {
    static table = 'scores'

    @relation('sessions', 'session_id') session: any
    @field('exercise_id') exerciseId: string
    @field('raw_score') rawScore: number
    @field('normalized_score') normalizedScore: number
    @json('metrics_json', (json: any) => json) metrics: any
    @readonly @date('created_at') createdAt: number
}
