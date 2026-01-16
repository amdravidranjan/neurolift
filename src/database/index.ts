import { Database } from '@nozbe/watermelondb'
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs'
import { Platform } from 'react-native'
import { mySchema } from './schema'
import User from './models/User'
import Session from './models/Session'
import Score from './models/Score'
import DailyPlan from './models/DailyPlan'
import ContentItem from './models/ContentItem'

// Expo Go does not support the native SQLite bridge.
// We default to LokiJS for development in Expo Go.
// In a custom dev client or production build, we can switch back to SQLite.
const adapter = new LokiJSAdapter({
    schema: mySchema,
    useWebWorker: false,
    useIncrementalIndexedDB: true,
    onSetUpError: (error) => {
        console.error('LokiJS Database failed to load', error)
    }
})

export const database = new Database({
    adapter,
    modelClasses: [
        User,
        Session,
        Score,
        DailyPlan,
        ContentItem,
    ],
})
