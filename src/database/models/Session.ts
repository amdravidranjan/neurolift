import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, children } from '@nozbe/watermelondb/decorators'

export default class Session extends Model {
    static table = 'sessions'

    @readonly @date('created_at') createdAt: number
    @date('ended_at') endedAt?: number
    @field('duration_seconds') durationSeconds: number
    @field('total_xp') totalXp: number

    @children('scores') scores: any
}
