import { Model } from '@nozbe/watermelondb'
import { field, json } from '@nozbe/watermelondb/decorators'

export default class DailyPlan extends Model {
    static table = 'daily_plans'

    @field('date_str') dateStr: string
    @json('exercises_json', (json: any) => json) exercises: string[]
    @field('is_completed') isCompleted: boolean
}
