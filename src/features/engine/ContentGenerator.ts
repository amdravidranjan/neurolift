export class ContentGenerator {

    // --- MATH ---
    static generateMathProblem(difficulty: number): { type: 'MATH', question: string, answer: number, options: number[] } {
        // Difficulty 0: Simple (+,-)
        // Difficulty 1: Medium (*, /)
        // Difficulty 2: Hard (Combined, Fractions, Algebra-lite)

        const operations = difficulty === 0 ? ['+', '-'] : difficulty === 1 ? ['+', '-', '*', '/'] : ['+', '-', '*', '/', 'sq'];
        const op = operations[Math.floor(Math.random() * operations.length)];
        let a = Math.floor(Math.random() * (difficulty * 10 + 10)) + 1;
        let b = Math.floor(Math.random() * (difficulty * 10 + 10)) + 1;

        let question = '';
        let answer = 0;

        switch (op) {
            case '+': answer = a + b; question = `${a} + ${b}`; break;
            case '-': answer = a - b; question = `${a} - ${b}`; break;
            case '*': answer = a * b; question = `${a} × ${b}`; break;
            case '/':
                answer = a;
                a = a * b; // Ensure clean division
                question = `${a} ÷ ${b}`;
                break;
            case 'sq':
                b = 2; // Square
                answer = a * a;
                question = `${a}²`;
                break;
        }

        // Generate distractors
        const options = new Set<number>();
        options.add(answer);
        while (options.size < 4) {
            const offset = Math.floor(Math.random() * 10) - 5;
            if (offset !== 0) options.add(answer + offset);
        }

        return { type: 'MATH', question, answer, options: Array.from(options).sort(() => Math.random() - 0.5) };
    }

    // --- LOGIC / PATTERNS ---
    static generatePattern(size: number = 3): { grid: number[][], missing: { r: number, c: number }, answer: number, options: number[] } {
        // Simple progression pattern
        const grid: number[][] = [];
        const base = Math.floor(Math.random() * 5);
        const step = Math.floor(Math.random() * 3) + 1;

        for (let r = 0; r < size; r++) {
            const row: number[] = [];
            for (let c = 0; c < size; c++) {
                row.push(base + (r * size + c) * step);
            }
            grid.push(row);
        }

        const missingR = size - 1;
        const missingC = size - 1;
        const answer = grid[missingR][missingC];
        grid[missingR][missingC] = -1; // masked

        // Generate distractors
        const options = new Set<number>();
        options.add(answer);
        while (options.size < 4) {
            const offset = Math.floor(Math.random() * 5) * step;
            if (offset !== 0) options.add(answer + offset);
        }

        return { grid, missing: { r: missingR, c: missingC }, answer, options: Array.from(options).sort(() => Math.random() - 0.5) };
    }

    // --- TEXT / WORDS ---
    static getRandomWord(difficulty: number, category: string = 'General'): string {
        const categories: Record<string, string[]> = {
            'General': ['Apple', 'Brief', 'Cloud', 'Delta', 'Eagle', 'Flame', 'Grain', 'Heart', 'Index', 'Joker'],
            'Science': ['Atom', 'Bond', 'Cell', 'Data', 'Energy', 'Force', 'Gene', 'Heat', 'Ion', 'Joule'],
            'Business': ['Asset', 'Bond', 'Cost', 'Debt', 'Equity', 'Fund', 'Gain', 'Hedge', 'IPO', 'Job'],
            'Abstract': ['Axiom', 'Bias', 'Code', 'Dual', 'Ego', 'Fate', 'Gist', 'Hope', 'Idea', 'Joy']
        };
        const list = categories[category] || categories['General'];
        return list[Math.floor(Math.random() * list.length)];
    }

    static generateTextChunk(difficulty: number): string {
        // Returns a sentence or paragraph
        const subjects = ['The scientist', 'A programmer', 'The artist', 'An eagle', 'The market'];
        const verbs = ['analyzed', 'created', 'painted', 'spotted', 'crashed'];
        const objects = ['the data', 'a bug', 'the canvas', 'prey', 'unexpectedly'];

        return `${subjects[Math.floor(Math.random() * 5)]} ${verbs[Math.floor(Math.random() * 5)]} ${objects[Math.floor(Math.random() * 5)]}.`;
    }

    // --- LOGIC / CONCEPT ---
    static generateAnalogy(difficulty: number): { a: string, b: string, c: string, answer: string, options: string[] } {
        // Simple A:B :: C:? generator
        const analogies = [
            { a: 'Hot', b: 'Cold', c: 'Up', ans: 'Down', opts: ['Left', 'Right', 'High'] },
            { a: 'Bird', b: 'Fly', c: 'Fish', ans: 'Swim', opts: ['Walk', 'Run', 'Crawl'] },
            { a: 'Doctor', b: 'Hospital', c: 'Teacher', ans: 'School', opts: ['Court', 'Lab', 'Office'] },
            { a: 'Engine', b: 'Car', c: 'Heart', ans: 'Body', opts: ['Brain', 'Lungs', 'Blood'] }
        ];
        const item = analogies[Math.floor(Math.random() * analogies.length)];
        return {
            a: item.a, b: item.b, c: item.c, answer: item.ans,
            options: [item.ans, ...item.opts].sort(() => Math.random() - 0.5)
        };
    }
}
