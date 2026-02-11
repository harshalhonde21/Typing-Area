export const calculateWPM = (correctChars: number, timeElapsedSeconds: number): number => {
  if (timeElapsedSeconds === 0) return 0;
  const timeElapsedMin = timeElapsedSeconds / 60;
  return Math.round((correctChars / 5) / timeElapsedMin);
};

export const calculateAccuracy = (correct: number, total: number): number => {
  if (total === 0) return 100;
  return Math.round((correct / total) * 100);
};

const commonWords = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "I", "it", "for", "not", "on", "with", "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", "just", "know", "take", "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think", "also", "back", "after", "use", "two", "how", "our", "work", "first", "well", "way", "even", "new", "want", "because", "any", "these", "give", "day", "most", "us"
];

const cyberWords = [
  "cyber", "neon", "matrix", "glitch", "network", "system", "data", "code", "node", "link", "hack", "proxy", "server", "cloud", "grid", "pixel", "void", "core", "logic", "pulse", "signal", "wire", "mesh", "sector", "zone", "flow", "protocol", "cipher", "daemon", "kernel", "byte", "bit", "null", "root", "admin", "shell", "bash", "linux", "unix", "stack", "heap", "queue", "list", "array", "object", "class", "void", "static", "const", "let", "var", "async", "await", "promise", "fetch", "react", "next", "node", "deno", "bun", "rust", "go", "python", "java", "ruby", "php", "sql", "mongo", "redis", "docker", "k8s", "aws", "azure", "gcp", "git", "ci", "cd", "test", "debug", "build", "deploy"
];

export const generateText = (mode: 'words' | 'quote' | 'code' = 'words', count: number = 50): string => {
  if (mode === 'words') {
    const wordPool = [...commonWords, ...cyberWords];
    const words = [];
    for (let i = 0; i < count; i++) {
      words.push(wordPool[Math.floor(Math.random() * wordPool.length)]);
    }
    return words.join(" ");
  }
  // Placeholder for other modes
  return "The quick brown fox jumps over the lazy dog. This is a placeholder for quote mode.";
};
