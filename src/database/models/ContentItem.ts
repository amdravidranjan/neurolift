import { Model } from '@nozbe/watermelondb'
import { field, json } from '@nozbe/watermelondb/decorators'

export default class ContentItem extends Model {
    static table = 'content_items'

    @field('exercise_id') exerciseId: string
    @field('difficulty') difficulty: number
    @field('content_json') contentJson: string // JSON string of the problem/question

    @json('tags_json', (raw) => raw) tags: string[]
}
