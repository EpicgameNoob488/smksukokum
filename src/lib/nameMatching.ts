/**
 * Fuzzy name matching utility for teacher registration
 * Uses Levenshtein distance algorithm with optimizations for Malay names
 */

export interface SimilarName {
  name: string;
  similarity: number;
  source: string;
}

/**
 * Calculate Levenshtein distance between two strings
 * Returns the minimum number of single-character edits needed
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  
  if (m === 0) return n;
  if (n === 0) return m;
  
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  
  return dp[m][n];
}

/**
 * Calculate similarity percentage (0-100) between two strings
 * Higher = more similar
 */
export function calculateSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 100;
  
  const distance = levenshteinDistance(s1, s2);
  const maxLen = Math.max(s1.length, s2.length);
  
  return Math.round((1 - distance / maxLen) * 100);
}

/**
 * Normalize Malay names for better matching
 * Handles common variations like bin/binti, prefixes, etc.
 */
export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/bin\s+/gi, ' ')
    .replace(/binti\s+/gi, ' ')
    .replace(/a\/l\s+/gi, ' ')
    .replace(/a\/b\s+/gi, ' ')
    .replace(/md\.\s*/gi, ' ')
    .replace(/pn\.\s*/gi, ' ')
    .replace(/tn\.\s*/gi, ' ')
    .replace(/[,.\-']/g, ' ')
    .trim();
}

/**
 * Extract key parts of a name for matching
 * Focuses on meaningful words (ignores common words)
 */
function getNameTokens(name: string): string[] {
  const normalized = normalizeName(name);
  const stopWords = ['dan', 'of', 'the', 'bin', 'binti', 'al', 'ibn'];
  
  return normalized
    .split(' ')
    .filter(token => 
      token.length > 1 && 
      !stopWords.includes(token)
    );
}

/**
 * Calculate similarity based on name tokens
 * Better for Malay names with multiple words
 */
function calculateTokenSimilarity(inputName: string, targetName: string): number {
  const inputTokens = getNameTokens(inputName);
  const targetTokens = getNameTokens(targetName);
  
  if (inputTokens.length === 0 || targetTokens.length === 0) {
    return calculateSimilarity(inputName, targetName);
  }
  
  let matchedTokens = 0;
  
  for (const inputToken of inputTokens) {
    for (const targetToken of targetTokens) {
      const tokenSim = calculateSimilarity(inputToken, targetToken);
      if (tokenSim >= 80) {
        matchedTokens++;
        break;
      }
    }
  }
  
  const matchRatio = (matchedTokens * 2) / (inputTokens.length + targetTokens.length);
  return Math.round(matchRatio * 100);
}

/**
 * Check if one name is contained within another (substring match)
 */
function isSubstringMatch(inputName: string, targetName: string): boolean {
  const normalizedInput = normalizeName(inputName);
  const normalizedTarget = normalizeName(targetName);
  
  return normalizedTarget.includes(normalizedInput) || 
         normalizedInput.includes(normalizedTarget);
}

/**
 * Find similar names from a list with scoring
 * @param inputName - Name entered by user
 * @param existingNames - Array of existing names to match against
 * @param threshold - Minimum similarity percentage (default: 80)
 * @param limit - Maximum number of results (default: 5)
 */
export function findSimilarNames(
  inputName: string,
  existingNames: Array<{ name: string; source: string }>,
  threshold: number = 80,
  limit: number = 5
): SimilarName[] {
  if (!inputName || inputName.length < 2) {
    return [];
  }
  
  const results: SimilarName[] = [];
  
  for (const { name, source } of existingNames) {
    if (!name || name.trim() === '') continue;
    
    // Exact match - return immediately
    if (normalizeName(name) === normalizeName(inputName)) {
      results.push({ name, similarity: 100, source });
      continue;
    }
    
    // Substring match bonus
    let similarity = 0;
    if (isSubstringMatch(inputName, name)) {
      similarity = Math.max(
        calculateSimilarity(inputName, name),
        calculateTokenSimilarity(inputName, name),
        90 // Substring match bonus
      );
    } else {
      // Combine full string and token-based similarity
      const fullSim = calculateSimilarity(inputName, name);
      const tokenSim = calculateTokenSimilarity(inputName, name);
      similarity = Math.max(fullSim, tokenSim);
    }
    
    if (similarity >= threshold) {
      results.push({ name, similarity, source });
    }
  }
  
  // Sort by similarity descending, then alphabetically
  results.sort((a, b) => {
    if (b.similarity !== a.similarity) {
      return b.similarity - a.similarity;
    }
    return a.name.localeCompare(b.name);
  });
  
  return results.slice(0, limit);
}

/**
 * Check if a name is likely a valid teacher name
 * Basic validation for common patterns
 */
export function isValidTeacherName(name: string): boolean {
  if (!name || name.length < 3) return false;
  
  const normalized = normalizeName(name);
  
  // Must have at least 2 words (e.g., "Ahmad Ali")
  const words = normalized.split(' ').filter(w => w.length > 1);
  if (words.length < 2) return false;
  
  return true;
}
