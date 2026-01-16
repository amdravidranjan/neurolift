import { Model } from '@nozbe/watermelondb'
import { field, date, readonly } from '@nozbe/watermelondb/decorators'

export default class User extends Model {
    static table = 'users'

    @readonly @date('created_at') createdAt: number
    @field('current_streak') currentStreak: number
    @field('total_minutes_trained') totalMinutesTrained: number
    @date('last_active_at') lastActiveAt?: number
}
