import { database } from '../../database';
import ContentItem from '../../database/models/ContentItem';
import { STATIC_MATH_PROBLEMS, STATIC_ANALOGIES, STATIC_CONTEXT_PUZZLES, STATIC_RSVP_PASSAGES, STATIC_LIBRARIAN_ITEMS, STATIC_SYNTHESIZER_ITEMS, STATIC_CREATIVITY_PROMPTS, STATIC_REASONING_ITEMS } from './data/StaticContent';
import { BATCH_2_RSVP, BATCH_2_MATH, BATCH_2_LOGIC } from './data/Batch2'; // Import Batch 2
import { Q } from '@nozbe/watermelondb';

export class ContentSeedService {

    static async seedContentIfEmpty() {
        const count = await database.collections.get('content_items').query().fetchCount();

        // --- PHASE 1: Base Seed ---
        if (count === 0) {
            console.log('[ContentSeed] Database empty. Seeding Batch 1...');
            await this.seedBatch1();
        } else {
            console.log('[ContentSeed] Database has content. Checking for updates...');
        }

        // --- PHASE 2: Incremental Updates ---
        // Check if Batch 2 exists by querying for a unique tag or counting
        // We'll check if any item has tag 'batch_2'
        const batch2Count = await database.collections.get('content_items').query(
            Q.where('tags', Q.like('%batch_2%'))
        ).fetchCount();

        if (batch2Count === 0) {
            console.log('[ContentSeed] Batch 2 missing. Seeding Batch 2...');
            await this.seedBatch2();
        } else {
            console.log('[ContentSeed] Batch 2 already exists.');
        }

        console.log('[ContentSeed] Seeding complete.');
    }

    private static async seedBatch1() {
        await database.write(async () => {
            const batchOperations = [];
            const contentCollection = database.collections.get<ContentItem>('content_items');

            // Reuse existing Batch 1 logic (refactored for clarity)
            // 1. Rapid Fire: Math & Logic
            for (const item of STATIC_MATH_PROBLEMS) {
                batchOperations.push(
                    contentCollection.prepareCreate(rec => {
                        rec.exerciseId = 'rapid_fire';
                        rec.difficulty = item.diff;
                        rec.contentJson = JSON.stringify({
                            type: 'MATH',
                            question: item.q,
                            answer: item.a,
                            options: item.o
                        });
                        rec.tags = ['math', `diff_${item.diff}`, 'batch_1'];
                    })
                );
            }

            // 2. Analogy Builder
            for (const item of STATIC_ANALOGIES) {
                batchOperations.push(
                    contentCollection.prepareCreate(rec => {
                        rec.exerciseId = 'analogy_builder';
                        rec.difficulty = item.diff;
                        rec.contentJson = JSON.stringify({
                            a: item.a, b: item.b, c: item.c, d: item.d,
                            options: item.o
                        });
                        rec.tags = ['verbal', `diff_${item.diff}`, 'batch_1'];
                    })
                );
            }

            // 3. Context Hunter
            for (const item of STATIC_CONTEXT_PUZZLES) {
                batchOperations.push(
                    contentCollection.prepareCreate(rec => {
                        rec.exerciseId = 'context_hunter';
                        rec.difficulty = item.diff;
                        rec.contentJson = JSON.stringify({
                            target: item.target,
                            clues: item.clues,
                            options: item.o
                        });
                        rec.tags = ['association', `diff_${item.diff}`, 'batch_1'];
                    })
                );
            }

            // 4. RSVP Reader
            for (const item of STATIC_RSVP_PASSAGES) {
                batchOperations.push(
                    contentCollection.prepareCreate(rec => {
                        rec.exerciseId = 'rsvp_reader';
                        rec.difficulty = item.diff;
                        rec.contentJson = JSON.stringify({
                            text: item.text,
                            question: {
                                q: item.q,
                                answer: item.a,
                                options: item.o
                            }
                        });
                        rec.tags = ['text', `diff_${item.diff}`, 'batch_1'];
                    })
                );
            }

            // 5. The Librarian (Categorization)
            for (const item of STATIC_LIBRARIAN_ITEMS) {
                batchOperations.push(
                    contentCollection.prepareCreate(rec => {
                        rec.exerciseId = 'the_librarian';
                        rec.difficulty = item.diff;
                        rec.contentJson = JSON.stringify({
                            word: item.word,
                            category: item.category,
                            options: item.options
                        });
                        rec.tags = ['categorization', `diff_${item.diff}`, 'batch_1'];
                    })
                );
            }

            // 6. Synthesizer (Verification)
            for (const item of STATIC_SYNTHESIZER_ITEMS) {
                batchOperations.push(
                    contentCollection.prepareCreate(rec => {
                        rec.exerciseId = 'synthesizer';
                        rec.difficulty = item.diff;
                        rec.contentJson = JSON.stringify({
                            text: item.text,
                            isTrue: item.isTrue
                        });
                        rec.tags = ['logic', 'verification', `diff_${item.diff}`, 'batch_1'];
                    })
                );
            }

            // 7. Alternative Uses & Story Spinner
            for (const item of STATIC_CREATIVITY_PROMPTS) {
                let exerciseId = 'alternative_uses';
                if (item.type === 'STORY') exerciseId = 'story_spinner';
                if (item.type === 'SHAPE') exerciseId = 'shape_crafter';

                batchOperations.push(
                    contentCollection.prepareCreate(rec => {
                        rec.exerciseId = exerciseId;
                        rec.difficulty = item.diff;
                        rec.contentJson = JSON.stringify(item);
                        rec.tags = ['creativity', item.type.toLowerCase(), `diff_${item.diff}`, 'batch_1'];
                    })
                );
            }

            // 8. Debater (Reasoning)
            for (const item of STATIC_REASONING_ITEMS) {
                batchOperations.push(
                    contentCollection.prepareCreate(rec => {
                        rec.exerciseId = 'debater';
                        rec.difficulty = item.diff;
                        rec.contentJson = JSON.stringify(item);
                        rec.tags = ['reasoning', 'fallacy', `diff_${item.diff}`, 'batch_1'];
                    })
                );
            }

            await database.batch(...batchOperations);
        });
    }

    private static async seedBatch2() {
        await database.write(async () => {
            const batchOperations = [];
            const contentCollection = database.collections.get<ContentItem>('content_items');

            // RSVP
            for (const item of BATCH_2_RSVP) {
                batchOperations.push(
                    contentCollection.prepareCreate(rec => {
                        rec.exerciseId = 'rsvp_reader';
                        rec.difficulty = item.diff;
                        rec.contentJson = JSON.stringify({
                            text: item.text,
                            question: {
                                q: item.q,
                                answer: item.a,
                                options: item.o
                            }
                        });
                        rec.tags = ['text', `diff_${item.diff}`, 'batch_2']; // Tag as batch_2
                    })
                );
            }

            // Math
            for (const item of BATCH_2_MATH) {
                batchOperations.push(
                    contentCollection.prepareCreate(rec => {
                        rec.exerciseId = 'rapid_fire'; // Reusing rapid_fire or a specific math one? Math Sprint uses rapid-fire/math usually
                        // Math Sprint exercise ID is 'math_sprint'. But `ContentSeed` (Batch 1) put math in `rapid_fire`.
                        // Let's check where MathSprint pulls from.
                        // MathSprint.tsx usually generates procedurally using `ContentGenerator`.
                        // But `RapidFire` uses DB.
                        // Does `Math Sprint` use DB?
                        // `math_sprint.tsx` currently uses `ContentGenerator` locally.
                        // So seeding math into DB won't affect `math_sprint` unless we update `math_sprint` to use DB.
                        // However, `RapidFire` (Processing) DOES use DB. So this benefits RapidFire.
                        // To benefit MathSprint, we'd need to refactor it.
                        // For now, let's just seed it as 'rapid_fire' and 'math_sprint' if needed.
                        // But 'math_sprint' doesn't query DB yet.
                        // Let's tag it `rapid_fire` (Math Mode).
                        rec.exerciseId = 'rapid_fire';
                        rec.difficulty = item.diff;
                        rec.contentJson = JSON.stringify({
                            type: 'MATH',
                            question: item.q,
                            answer: item.a,
                            options: item.o
                        });
                        rec.tags = ['math', `diff_${item.diff}`, 'batch_2'];
                    })
                );
            }

            // Logic (Analogy)
            for (const item of BATCH_2_LOGIC) {
                batchOperations.push(
                    contentCollection.prepareCreate(rec => {
                        rec.exerciseId = 'analogy_builder';
                        rec.difficulty = item.diff;
                        rec.contentJson = JSON.stringify({
                            a: item.a, b: item.b, c: item.c, d: item.d,
                            options: item.o
                        });
                        rec.tags = ['verbal', `diff_${item.diff}`, 'batch_2'];
                    })
                );
            }

            await database.batch(...batchOperations);
        });
    }
}
