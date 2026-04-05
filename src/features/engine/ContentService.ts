import AsyncStorage from '@react-native-async-storage/async-storage';
import { database } from '../../database';
import ContentItem from '../../database/models/ContentItem';
import { Q } from '@nozbe/watermelondb';
import { READING_BATCH_1 } from './data/reading/Batch1';
import { READING_BATCH_2 } from './data/reading/Batch2';
import { READING_BATCH_3 } from './data/reading/Batch3';
import { READING_BATCH_4 } from './data/reading/Batch4';
import { READING_BATCH_5 } from './data/reading/Batch5';

const SEEN_RING_PREFIX = 'neurolift_seen_passages_';
const RING_SIZE = 20;

export type ContentSource = 'database' | 'wikipedia' | 'news' | 'manual';

export interface Passage {
    text: string;
    q?: string;
    a?: string;
    o?: string[];
    source?: string;
}

// Fallback static pool combining all batches
const STATIC_POOL = [...READING_BATCH_1, ...READING_BATCH_2, ...READING_BATCH_3, ...READING_BATCH_4, ...READING_BATCH_5].map(p => ({
    text: p.text,
    q: p.q,
    a: p.a,
    o: p.o,
    source: 'static',
}));

async function getSeenIds(exerciseId: string): Promise<string[]> {
    const raw = await AsyncStorage.getItem(`${SEEN_RING_PREFIX}${exerciseId}`);
    return raw ? JSON.parse(raw) : [];
}

async function markSeen(exerciseId: string, id: string): Promise<void> {
    const seen = await getSeenIds(exerciseId);
    const next = [...seen.filter(s => s !== id), id].slice(-RING_SIZE);
    await AsyncStorage.setItem(`${SEEN_RING_PREFIX}${exerciseId}`, JSON.stringify(next));
}

async function fetchFromDatabase(exerciseId: string): Promise<Passage | null> {
    try {
        const seen = await getSeenIds(exerciseId);
        const items = await database.collections
            .get<ContentItem>('content_items')
            .query(Q.where('exercise_id', exerciseId))
            .fetch();

        if (items.length === 0) return null;

        // Prefer unseen items
        const unseen = items.filter(i => !seen.includes(i.id));
        const pool = unseen.length > 0 ? unseen : items;
        const item = pool[Math.floor(Math.random() * pool.length)];

        await markSeen(exerciseId, item.id);
        const parsed = JSON.parse(item.contentJson);
        return { text: parsed.text, q: parsed.q, a: parsed.a, o: parsed.o, source: 'database' };
    } catch {
        return null;
    }
}

async function fetchFromWikipedia(): Promise<Passage | null> {
    try {
        const res = await fetch('https://en.wikipedia.org/api/rest_v1/page/random/summary', {
            headers: { 'Accept': 'application/json' }
        });
        if (!res.ok) return null;
        const data = await res.json();
        const text = data.extract as string;
        if (!text || text.length < 50) return null;

        // Auto-generate a simple question from the title
        const title = data.title as string;
        return {
            text,
            q: `What is this passage mainly about?`,
            a: title,
            o: [title, 'Unknown topic', 'A scientific theory', 'A historical event'],
            source: 'Wikipedia',
        };
    } catch {
        return null;
    }
}

async function fetchFromNews(): Promise<Passage | null> {
    try {
        const url = 'https://api.rss2json.com/v1/api.json?rss_url=https://feeds.bbcnews.com/news/rss.xml';
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = await res.json();
        const items: any[] = data.items || [];
        if (items.length === 0) return null;

        const item = items[Math.floor(Math.random() * Math.min(10, items.length))];
        // Strip HTML tags from description
        const rawDesc = (item.description || item.title || '') as string;
        const text = rawDesc.replace(/<[^>]+>/g, '').trim();
        if (text.length < 30) return null;

        return {
            text,
            q: 'What is this news item about?',
            a: item.title,
            o: [item.title, 'Politics', 'Sports', 'Entertainment'],
            source: 'BBC News',
        };
    } catch {
        return null;
    }
}

function getStaticPassage(exerciseId: string): Passage {
    const idx = Math.floor(Math.random() * STATIC_POOL.length);
    return STATIC_POOL[idx];
}

export class ContentService {
    async getPassage(exerciseId: string, source: ContentSource): Promise<Passage> {
        if (source === 'wikipedia') {
            const p = await fetchFromWikipedia();
            if (p) {
                // Save to DB for offline reuse
                this.saveToDatabase(exerciseId, p).catch(() => {});
                return p;
            }
            // Fallback to DB then static
            const db = await fetchFromDatabase(exerciseId);
            return db ?? getStaticPassage(exerciseId);
        }

        if (source === 'news') {
            const p = await fetchFromNews();
            if (p) {
                this.saveToDatabase(exerciseId, p).catch(() => {});
                return p;
            }
            const db = await fetchFromDatabase(exerciseId);
            return db ?? getStaticPassage(exerciseId);
        }

        if (source === 'database') {
            const db = await fetchFromDatabase(exerciseId);
            return db ?? getStaticPassage(exerciseId);
        }

        // manual — caller provides text; return placeholder
        return { text: '', source: 'manual' };
    }

    private async saveToDatabase(exerciseId: string, passage: Passage): Promise<void> {
        await database.write(async () => {
            await database.collections.get<ContentItem>('content_items').create(item => {
                item.exerciseId = exerciseId;
                item.difficulty = 1;
                item.contentJson = JSON.stringify({ text: passage.text, q: passage.q, a: passage.a, o: passage.o });
                (item as any).tags = [passage.source ?? 'online'];
            });
        });
    }
}

export const contentService = new ContentService();
