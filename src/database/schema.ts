import { appSchema, tableSchema } from '@nozbe/watermelondb'

export const mySchema = appSchema({
    version: 1,
    tables: [
        tableSchema({
            name: 'users',
            columns: [
                { name: 'created_at', type: 'number' },
                { name: 'current_streak', type: 'number' },
                { name: 'total_minutes_trained', type: 'number' },
                { name: 'last_active_at', type: 'number', isOptional: true },
            ]
        }),
        tableSchema({
            name: 'sessions',
            columns: [
                { name: 'created_at', type: 'number' },
                { name: 'ended_at', type: 'number', isOptional: true },
                { name: 'duration_seconds', type: 'number' },
                { name: 'total_xp', type: 'number' },
            ]
        }),
        tableSchema({
            name: 'scores',
            columns: [
                { name: 'session_id', type: 'string', isIndexed: true },
                { name: 'exercise_id', type: 'string', isIndexed: true },
                { name: 'raw_score', type: 'number' },
                { name: 'normalized_score', type: 'number' },
                { name: 'metrics_json', type: 'string' },
                { name: 'created_at', type: 'number' },
            ]
        }),
        tableSchema({
            name: 'daily_plans',
            columns: [
                { name: 'date_str', type: 'string', isIndexed: true },
                { name: 'exercises_json', type: 'string' },
                { name: 'is_completed', type: 'boolean' },
            ]
        }),
        tableSchema({
            name: 'content_items',
            columns: [
                { name: 'exercise_id', type: 'string', isIndexed: true },
                { name: 'difficulty', type: 'number', isIndexed: true },
                { name: 'content_json', type: 'string' },
                { name: 'tags_json', type: 'string' }, // For categories
            ]
        }),
    ]
})
