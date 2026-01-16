
export const SHAPES: Record<string, any[]> = {
    'Basic (Letter)': [
        // Just placeholders to trigger Text render, or we use Paths.
        // Let's use logic in the component to render Text if 'Basic'.
    ],
    'Polygons': [
        // Triangle
        {
            path: "M50 15 L15 85 L85 85 Z",
            viewBox: "0 0 100 100",
            fill: "#3f51b5"
        },
        // Star
        {
            path: "M50 2 L61 35 L96 35 L68 57 L79 91 L50 70 L21 91 L32 57 L4 35 L39 35 Z",
            viewBox: "0 0 100 100",
            fill: "#ffeb3b"
        },
        // L-Shape (Tetris)
        {
            path: "M20 20 L40 20 L40 60 L80 60 L80 80 L20 80 Z",
            viewBox: "0 0 100 100",
            fill: "#4caf50"
        }
    ],
    'Molecules': [
        // Benzene-like
        {
            path: "M50 10 L85 30 L85 70 L50 90 L15 70 L15 30 Z M50 20 L75 35 L75 65 L50 80 L25 65 L25 35 Z",
            viewBox: "0 0 100 100",
            fill: "#9c27b0"
        },
        // Cross
        {
            path: "M35 15 L65 15 L65 35 L85 35 L85 65 L65 65 L65 85 L35 85 L35 65 L15 65 L15 35 L35 35 Z",
            viewBox: "0 0 100 100",
            fill: "#00bcd4"
        }
    ]
};
