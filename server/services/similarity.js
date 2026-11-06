const natural = require('natural');

const wordnet = new natural.WordNet();

// Initialize Transformers pipeline for semantic vector embeddings
let extractor = null;
let pipelineLoading = false;

async function getExtractor() {
  if (extractor) return extractor;
  if (pipelineLoading) {
    let attempts = 0;
    while (!extractor && attempts < 20) {
      await new Promise((r) => setTimeout(r, 150));
      attempts++;
    }
    if (extractor) return extractor;
  }

  try {
    pipelineLoading = true;
    const { pipeline } = await import('@xenova/transformers');
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
      quantized: true,
    });
    console.log('Semantic embeddings pipeline initialized (all-MiniLM-L6-v2)');
    return extractor;
  } catch (err) {
    console.warn('Transformers pipeline load notice:', err.message);
    return null;
  } finally {
    pipelineLoading = false;
  }
}

getExtractor().catch(() => {});

// Comprehensive journalistic headline synonyms (base stems and inflections)
const JOURNALISTIC_SYNONYMS = {
  unveil: ['reveal', 'announce', 'launch', 'introduce', 'disclose', 'present', 'show'],
  reveal: ['unveil', 'announce', 'disclose', 'expose', 'show', 'report', 'find'],
  announce: ['reveal', 'unveil', 'declare', 'disclose', 'confirm', 'state', 'report'],
  discover: ['find', 'detect', 'unearth', 'identify', 'locate', 'spot', 'uncover'],
  launch: ['unveil', 'introduce', 'release', 'start', 'roll', 'begin', 'deploy'],
  surge: ['soar', 'jump', 'climb', 'rise', 'spike', 'skyrocket', 'boom'],
  plunge: ['drop', 'fall', 'crash', 'slump', 'slide', 'dive', 'decline'],
  slash: ['cut', 'reduce', 'lower', 'trim', 'drop', 'axe'],
  warn: ['caution', 'alert', 'advise', 'forewarn', 'signal', 'flag'],
  scientist: ['researcher', 'expert', 'astronomer', 'scholar', 'physicist', 'biologist'],
  agreement: ['deal', 'pact', 'accord', 'treaty', 'contract', 'settlement'],
  crisis: ['emergency', 'turmoil', 'disaster', 'catastrophe', 'chaos', 'breakdown'],
  lawsuit: ['suit', 'action', 'case', 'litigation', 'complaint'],
  record: ['historic', 'all-time', 'unprecedented', 'highest', 'peak'],
  global: ['worldwide', 'international', 'planetary', 'universal'],
  leader: ['chief', 'president', 'head', 'premier', 'boss', 'director', 'official'],
  ban: ['prohibit', 'bar', 'block', 'outlaw', 'restrict', 'stop'],
  approve: ['clear', 'pass', 'endorse', 'sanction', 'authorize', 'greenlight'],
  attack: ['strike', 'assault', 'hit', 'target', 'bomb'],
  historic: ['record', 'landmark', 'unprecedented', 'monumental'],
  battery: ['cell', 'accumulator', 'pack'],
  vehicle: ['car', 'automobile', 'transport', 'ev'],
  clean: ['green', 'renewable', 'carbon-free', 'sustainable'],
  energy: ['power', 'electricity', 'generation'],
};

function normalizeWord(word) {
  if (!word) return '';
  return word
    .toLowerCase()
    .replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, '')
    .trim();
}

function getWordNetSynonyms(word) {
  return new Promise((resolve) => {
    wordnet.lookup(word, (results) => {
      if (!results || !results.length) return resolve([]);
      const set = new Set();
      for (const r of results) {
        if (r.synonyms) {
          r.synonyms.forEach((s) => set.add(s.toLowerCase().replace(/_/g, ' ')));
        }
      }
      resolve(Array.from(set));
    });
  });
}

function computeCosineSimilarity(a, b) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Evaluates semantic closeness of a guessed word in relation to the target word and preceding context.
 */
async function evaluateCloseness(guess, target, context = '', attempt = 1) {
  const normGuess = normalizeWord(guess);
  const normTarget = normalizeWord(target);

  if (!normGuess) {
    return {
      closenessScore: 0,
      isExact: false,
      isCloseEnough: false,
      tier: 'cold',
      tierColor: 'gray',
      feedback: 'Please enter a word!',
      pointsAwarded: 0,
      attempt,
    };
  }

  // 1. Exact match check
  if (normGuess === normTarget) {
    const points = attempt === 1 ? 1000 : attempt === 2 ? 850 : Math.max(500, 1000 - attempt * 100);
    return {
      closenessScore: 100,
      isExact: true,
      isCloseEnough: true,
      tier: 'bullseye',
      tierColor: 'emerald',
      feedback: attempt === 1 ? 'Bullseye! Exact word match on first try!' : 'Bullseye! You nailed the exact word!',
      pointsAwarded: points,
      attempt,
    };
  }

  // 2. Stem match check (e.g. "unveiling" vs "unveil", "discovers" vs "discover")
  const stemGuess = natural.PorterStemmer.stem(normGuess);
  const stemTarget = natural.PorterStemmer.stem(normTarget);
  if (stemGuess === stemTarget && stemGuess.length > 2) {
    const score = 95;
    const points = Math.max(300, 900 - (attempt - 1) * 75);
    return {
      closenessScore: score,
      isExact: false,
      isCloseEnough: true,
      tier: 'hot',
      tierColor: 'teal',
      feedback: 'Extremely close! Grammatical form of the exact word.',
      pointsAwarded: points,
      attempt,
    };
  }

  // 3. WordNet and Journalistic Synonym matching
  const [wordnetSynsGuess, wordnetSynsTarget] = await Promise.all([
    getWordNetSynonyms(normGuess),
    getWordNetSynonyms(normTarget),
  ]);

  const hasWordnetSynonymMatch =
    wordnetSynsGuess.includes(normTarget) ||
    wordnetSynsTarget.includes(normGuess) ||
    wordnetSynsGuess.some((s) => wordnetSynsTarget.includes(s));

  const customTargetSyns = JOURNALISTIC_SYNONYMS[stemTarget] || JOURNALISTIC_SYNONYMS[normTarget] || [];
  const customGuessSyns = JOURNALISTIC_SYNONYMS[stemGuess] || JOURNALISTIC_SYNONYMS[normGuess] || [];
  const hasCustomMatch =
    customTargetSyns.some((s) => s === normGuess || natural.PorterStemmer.stem(s) === stemGuess) ||
    customGuessSyns.some((s) => s === normTarget || natural.PorterStemmer.stem(s) === stemTarget);

  if (hasWordnetSynonymMatch || hasCustomMatch) {
    const score = 88;
    const points = Math.max(250, 850 - (attempt - 1) * 70);
    return {
      closenessScore: score,
      isExact: false,
      isCloseEnough: true,
      tier: 'hot',
      tierColor: 'teal',
      feedback: 'Hot! Direct synonym for this headline context.',
      pointsAwarded: points,
      attempt,
    };
  }

  // 4. Jaro-Winkler orthographic distance
  const jaroDist = natural.JaroWinklerDistance(normGuess, normTarget);

  // 5. Semantic Vector Embedding Cosine Similarity
  let wordSim = 0;
  let contextSim = 0;
  const pipeline = await getExtractor();

  if (pipeline) {
    try {
      const [embTarget, embGuess] = await Promise.all([
        pipeline(normTarget, { pooling: 'mean', normalize: true }),
        pipeline(normGuess, { pooling: 'mean', normalize: true }),
      ]);
      wordSim = computeCosineSimilarity(embTarget.data, embGuess.data);

      const targetPhrase = `${context} ${normTarget}`.trim();
      const guessPhrase = `${context} ${normGuess}`.trim();
      const [phraseTarget, phraseGuess] = await Promise.all([
        pipeline(targetPhrase, { pooling: 'mean', normalize: true }),
        pipeline(guessPhrase, { pooling: 'mean', normalize: true }),
      ]);
      contextSim = computeCosineSimilarity(phraseTarget.data, phraseGuess.data);
    } catch (embErr) {
      console.warn('Embedding warning:', embErr.message);
    }
  }

  // Composite score calculation
  let calculatedScore = 0;
  if (wordSim > 0 || contextSim > 0) {
    // Word embedding cosine ranges from -0.1 to 1.0 (with 0.4+ being quite related)
    // Context cosine ranges from 0.4 to 1.0
    let scaledWordScore = 0;
    if (wordSim > 0.6) scaledWordScore = 80 + (wordSim - 0.6) * 45;
    else if (wordSim > 0.35) scaledWordScore = 55 + (wordSim - 0.35) * 100;
    else if (wordSim > 0.15) scaledWordScore = 25 + (wordSim - 0.15) * 150;
    else scaledWordScore = Math.max(5, wordSim * 100);

    let scaledContextScore = 0;
    if (contextSim > 0.72) scaledContextScore = 78 + (contextSim - 0.72) * 65;
    else if (contextSim > 0.62) scaledContextScore = 58 + (contextSim - 0.62) * 200;
    else if (contextSim > 0.52) scaledContextScore = 35 + (contextSim - 0.52) * 230;
    else scaledContextScore = Math.max(10, contextSim * 60);

    calculatedScore = Math.round(0.4 * scaledWordScore + 0.6 * scaledContextScore);

    // Boost if high string similarity
    if (jaroDist > 0.8) {
      calculatedScore = Math.max(calculatedScore, Math.round(jaroDist * 88));
    }
  } else {
    // Fast NLP fallback
    calculatedScore = Math.round(jaroDist * 75);
  }

  calculatedScore = Math.min(97, Math.max(5, calculatedScore));

  const isCloseEnough = calculatedScore >= 68;
  let tier = 'cold';
  let tierColor = 'slate';
  let feedback = 'Too far off. Try another angle or proceed nevertheless.';

  if (calculatedScore >= 85) {
    tier = 'hot';
    tierColor = 'teal';
    feedback = 'Very close! Strong contextual fit. You can proceed or try for the exact word.';
  } else if (calculatedScore >= 68) {
    tier = 'warm';
    tierColor = 'amber';
    feedback = 'Close enough! Good contextual guess. You may advance or refine.';
  } else if (calculatedScore >= 45) {
    tier = 'lukewarm';
    tierColor = 'orange';
    feedback = 'Related domain, but too far to advance. Try again or proceed nevertheless.';
  }

  let pointsAwarded = 0;
  if (isCloseEnough) {
    pointsAwarded = Math.max(150, Math.round(calculatedScore * 8.5) - (attempt - 1) * 60);
  }

  return {
    closenessScore: calculatedScore,
    isExact: false,
    isCloseEnough,
    tier,
    tierColor,
    feedback,
    pointsAwarded,
    attempt,
  };
}

module.exports = {
  evaluateCloseness,
  normalizeWord,
};
