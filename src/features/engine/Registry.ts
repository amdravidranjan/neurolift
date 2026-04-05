import { ExerciseConfig } from "./CortexEngine";

export const EXERCISE_REGISTRY: Record<string, ExerciseConfig> = {
    'vigilance_sentry': { id: 'vigilance_sentry', pillarId: 'attention', name: 'Vigilance Sentry', description: 'Maintain focus and react quickly to specific signals over time.', baseDifficulty: { speedMs: 2000, complexity: 1 } },
    'n_back_memory': {
        id: 'n_back_memory', pillarId: 'memory', name: 'N-Back Memory', description: 'Challenge your working memory by recalling items from N steps back.',
        baseDifficulty: { speedMs: 3000, complexity: 1 },
        tutorial: "Remember the position/sound from N steps ago. If N=2, does this match the one from 2 turns ago?",
        settingsSchema: [
            { key: 'n', label: 'N-Level', type: 'slider', min: 1, max: 4, step: 1, default: 2 },
            { key: 'mode', label: 'Modality', type: 'select', options: ['Visual', 'Audio', 'Dual'], default: 'Visual' },
            { key: 'interval', label: 'Speed (ISI)', type: 'slider', min: 2000, max: 4000, step: 500, default: 2500 }
        ]
    },
    'rapid_fire': { id: 'rapid_fire', pillarId: 'processing_speed', name: 'Rapid Fire', description: 'Make split-second decisions to train processing speed.', baseDifficulty: { speedMs: 1500, complexity: 1 } },

    // Batch A
    'math_sprint': { id: 'math_sprint', pillarId: 'processing_speed', name: 'Math Sprint', description: 'Solve simple math problems against the clock.', baseDifficulty: { speedMs: 5000, complexity: 1 } },
    'eagle_eye': { id: 'eagle_eye', pillarId: 'sensory', name: 'Eagle Eye', description: 'Spot the target object in a cluttered field.', baseDifficulty: { speedMs: 10000, complexity: 1 } },

    'pattern_matrix': {
        id: 'pattern_matrix', pillarId: 'reasoning', name: 'Pattern Matrix', description: 'Identify the missing piece that completes the logical pattern.',
        baseDifficulty: { speedMs: 0, complexity: 1 },
        settingsSchema: [
            { key: 'gridSize', label: 'Grid Size', type: 'select', options: ['3x3', '4x4', '5x5'], default: '3x3' },
            { key: 'difficulty', label: 'Pattern Complexity', type: 'slider', min: 1, max: 5, step: 1, default: 2 }
        ]
    },
    'spatial_rotator': {
        id: 'spatial_rotator', pillarId: 'sensory', name: 'Spatial Rotator', description: 'Mentally rotate 3D objects to match the reference.',
        baseDifficulty: { speedMs: 5000, complexity: 1 },
        settingsSchema: [
            { key: 'step', label: 'Angle Step', type: 'select', options: ['90°', '45°'], default: '90°' },
            { key: 'axis', label: 'Rotation Axis', type: 'select', options: ['Z-Axis (2D)', 'X-Axis (3D)', 'Y-Axis (3D)'], default: 'Z-Axis (2D)' },
            { key: 'complexity', label: 'Shape Style', type: 'select', options: ['Basic (Letter)', 'Polygons', 'Molecules'], default: 'Basic (Letter)' },
            { key: 'mirror', label: 'Allow Mirrored', type: 'toggle', default: false }
        ]
    },
    'digit_span': {
        id: 'digit_span', pillarId: 'memory', name: 'Digit Span', description: 'Recall a sequence of digits (Forward or Reverse).',
        baseDifficulty: { speedMs: 1000, complexity: 1 },
        settingsSchema: [
            { key: 'mode', label: 'Recall Mode', type: 'select', options: ['Forward', 'Reverse'], default: 'Forward' },
            { key: 'speed', label: 'Speed (ms)', type: 'slider', min: 500, max: 2000, step: 250, default: 1000 }
        ]
    },


    // Batch B
    'rsvp_reader': {
        id: 'rsvp_reader', pillarId: 'language', name: 'RSVP Reader', description: 'Read text presented one word at a time at high speeds.',
        baseDifficulty: { speedMs: 300, complexity: 1 },
        tutorial: "Read the words as they flash on screen. Use Manual mode to paste your own articles.",
        settingsSchema: [
            { key: 'source', label: 'Content Source', type: 'select', options: ['Database', 'Manual Input'], default: 'Database' },
            { key: 'wpm', label: 'Speed (WPM)', type: 'slider', min: 200, max: 1000, step: 50, default: 300 },
            { key: 'chunk', label: 'Words per Flash', type: 'slider', min: 1, max: 4, step: 1, default: 1 }
        ]
    },
    'context_hunter': {
        id: 'context_hunter', pillarId: 'language', name: 'Context Hunter',
        description: 'Identify the word that matches all given clues.',
        baseDifficulty: { speedMs: 0, complexity: 1 },
        tutorial: "Read the clues and pick the word that matches all of them.",
    },
    'synthesizer': {
        id: 'synthesizer', pillarId: 'language', name: 'Synthesizer',
        description: 'Judge whether statements are true or false.',
        baseDifficulty: { speedMs: 0, complexity: 1 },
        tutorial: "Read each statement and tap TRUE or FALSE as fast as you can.",
    },
    'mental_workbench': {
        id: 'mental_workbench', pillarId: 'memory', name: 'Mental Workbench', description: 'Hold multiple numbers in mind and perform operations on them.',
        baseDifficulty: { speedMs: 0, complexity: 3 },
        settingsSchema: [
            { key: 'steps', label: 'Step Count', type: 'slider', min: 1, max: 20, step: 1, default: 2 },
            { key: 'speed', label: 'Speed (ms)', type: 'slider', min: 500, max: 5000, step: 250, default: 2000 },
            { key: 'ops', label: 'Operations', type: 'select', options: ['Add/Sub', 'Mixed (X /)', 'All (+ - x /)'], default: 'Add/Sub' }
        ]
    },
    'the_librarian': { id: 'the_librarian', pillarId: 'memory', name: 'The Librarian', description: 'Organize and categorize items efficiently in memory.', baseDifficulty: { speedMs: 0, complexity: 1 } },

    // Batch C
    'crowded_room': { id: 'crowded_room', pillarId: 'attention', name: 'Crowded Room', description: 'Filter out distractions to find specific targets.', baseDifficulty: { speedMs: 5000, complexity: 1 } },
    'task_juggler': {
        id: 'task_juggler', pillarId: 'executive', name: 'Task Juggler', description: 'Switch between different rulesets rapidly.',
        baseDifficulty: { speedMs: 2000, complexity: 1 },
        settingsSchema: [
            { key: 'cueTime', label: 'Cue Duration (ms)', type: 'slider', min: 500, max: 3000, step: 500, default: 2000 },
            { key: 'ambiguity', label: "Liar's Cue %", type: 'slider', min: 0, max: 50, step: 10, default: 0 },
            { key: 'rules', label: 'Active Rules', type: 'select', options: ['Color/Shape', 'Color/Shape/Math'], default: 'Color/Shape' }
        ]
    },
    'impulse_control': {
        id: 'impulse_control', pillarId: 'executive', name: 'Impulse Control', description: 'Inhibit your response to "No-Go" signals.',
        baseDifficulty: { speedMs: 1500, complexity: 1 },
        settingsSchema: [
            { key: 'mode', label: 'Mode', type: 'select', options: ['Go/No-Go', 'Stop-Signal (SST)'], default: 'Go/No-Go' },
            { key: 'ssd', label: 'Stop-Signal Delay (ms)', type: 'slider', min: 0, max: 500, step: 50, default: 200 },
            { key: 'prob', label: 'Stop Probability %', type: 'slider', min: 20, max: 50, step: 10, default: 30 }
        ]
    },
    'rule_shifter': {
        id: 'rule_shifter', pillarId: 'adaptability', name: 'Rule Shifter', description: 'Adapt to changing rules and feedback in real-time.',
        baseDifficulty: { speedMs: 3000, complexity: 1 },
        settingsSchema: [
            { key: 'shift_freq', label: 'Shift Frequency (Trials)', type: 'slider', min: 3, max: 15, step: 1, default: 5 },
            { key: 'feedback_mode', label: 'Feedback Mode', type: 'select', options: ['Explicit (Show Rule)', 'Implicit (Deduce)'], default: 'Implicit (Deduce)' },
            { key: 'complexity', label: 'Rule Complexity', type: 'select', options: ['Basic (2 Rules)', 'Advanced (3 Rules)'], default: 'Basic (2 Rules)' }
        ]
    },
    'concept_sprint': {
        id: 'concept_sprint', pillarId: 'learning', name: 'Concept Sprint',
        description: 'Learn symbol-concept associations, then recall them.',
        baseDifficulty: { speedMs: 0, complexity: 1 },
        tutorial: "Study 3 symbol-concept pairs, then answer quiz questions from memory.",
    },

    // Batch D
    'alternative_uses': {
        id: 'alternative_uses', pillarId: 'creativity', name: 'Alternative Uses',
        description: 'Generate creative uses for everyday objects.',
        baseDifficulty: { speedMs: 0, complexity: 1 },
        tutorial: "You have 60 seconds to list as many uses for the object as possible. Creativity wins!",
    },
    'shape_crafter': { id: 'shape_crafter', pillarId: 'creativity', name: 'Shape Crafter', description: 'Create recognized objects using simple shapes.', baseDifficulty: { speedMs: 0, complexity: 1 }, hidden: true },
    'story_spinner': {
        id: 'story_spinner', pillarId: 'creativity', name: 'Story Spinner',
        description: 'Connect 3 random words into a creative sentence.',
        baseDifficulty: { speedMs: 0, complexity: 1 },
        tutorial: "Three words will appear. Write a sentence that uses all three meaningfully.",
    },
    'micro_expression': {
        id: 'micro_expression', pillarId: 'social', name: 'Micro-Expression',
        description: 'Identify fleeting emotional expressions.',
        baseDifficulty: { speedMs: 500, complexity: 1 },
        tutorial: "An emoji will flash briefly on screen. Identify the emotion it represents.",
        settingsSchema: [
            { key: 'flashMs', label: 'Flash Duration (ms)', type: 'slider', min: 200, max: 1000, step: 100, default: 500 },
        ],
    },
    'tone_triangulator': {
        id: 'tone_triangulator', pillarId: 'social', name: 'Tone Triangulator',
        description: 'Identify the emotional tone of statements.',
        baseDifficulty: { speedMs: 0, complexity: 1 },
        tutorial: "Read each statement and identify whether the tone is sarcastic, happy, sad, angry, or neutral.",
    },

    'tower_of_hanoi': {
        id: 'tower_of_hanoi', pillarId: 'executive', name: 'Tower of Hanoi', description: 'Classic planning and problem-solving puzzle.',
        baseDifficulty: { speedMs: 0, complexity: 3 },
        tutorial: "Move the entire stack to another peg. You can only move one disk at a time and cannot place a larger disk on a smaller one.",
        settingsSchema: [
            { key: 'disks', label: 'Disk Count', type: 'slider', min: 3, max: 8, step: 1, default: 3 },
            { key: 'pegs', label: 'Peg Count', type: 'select', options: ['3', '4'], default: '3' },
            { key: 'blind', label: 'Blind Mode', type: 'toggle', default: false }
        ]
    },

    'debater': {
        id: 'debater', pillarId: 'reasoning', name: 'Debater',
        description: 'Identify logical fallacies in arguments.',
        baseDifficulty: { speedMs: 0, complexity: 1 },
        tutorial: "Read each argument and identify the logical fallacy it contains from the 4 options.",
    },
    'analogy_builder': { id: 'analogy_builder', pillarId: 'reasoning', name: 'Analogy Builder', description: 'Complete complex analogies between concepts.', baseDifficulty: { speedMs: 0, complexity: 1 } },

    // Batch E
    'echo_location': {
        id: 'echo_location', pillarId: 'sensory', name: 'Echo Location',
        description: 'Memorize lit grid cells and tap them from memory.',
        baseDifficulty: { speedMs: 0, complexity: 1 },
        tutorial: "Watch which cells light up, then tap them from memory after they go dark.",
    },
    'life_logger': {
        id: 'life_logger', pillarId: 'calm', name: 'Life Logger',
        description: "Log today's events and recall yesterday's from memory.",
        baseDifficulty: { speedMs: 0, complexity: 1 },
        tutorial: "Write one memorable event from today. Come back tomorrow to test your episodic memory.",
    },
    'day_architect': { id: 'day_architect', pillarId: 'calm', name: 'Day Architect', description: 'Plan your day to activate executive function.', baseDifficulty: { speedMs: 0, complexity: 1 } },
    'mood_journal': {
        id: 'mood_journal', pillarId: 'calm', name: 'Mood Journal',
        description: 'Track your emotional state to build self-awareness.',
        baseDifficulty: { speedMs: 0, complexity: 1 },
        tutorial: "Select your current mood and optionally write a note. Consistent tracking builds emotional intelligence.",
    },
};

export const PILLARS = {
    'attention': "Attention & Focus",
    'memory': "Memory",
    'language': "Language",
    'executive': "Executive Functions",
    'reasoning': "Reasoning",
    'learning': "Learning Speed",
    'creativity': "Creativity",
    'social': "Emotional Intelligence",
    'metacognition': "Metacognition",
    'sensory': "Sensory Skills",
    'processing_speed': "Processing Speed",
    'calm': "Calm & Regulation",
    'adaptability': "Adaptability"
};
