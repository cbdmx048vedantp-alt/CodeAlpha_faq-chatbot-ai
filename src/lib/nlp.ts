import nlp from 'compromise';
import { GoogleGenAI, Type } from "@google/genai";
import { FAQ_DATASET, FAQItem } from '../data/faqs';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Common English stopwords for the local fallback/preprocessing
const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'if', 'then', 'else', 'when', 'at', 
  'by', 'from', 'for', 'with', 'in', 'on', 'to', 'is', 'are', 'was', 'were',
  'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
  'would', 'shall', 'should', 'can', 'could', 'may', 'might', 'must',
  'i', 'me', 'my', 'mine', 'you', 'your', 'yours', 'he', 'him', 'his',
  'she', 'her', 'hers', 'it', 'its', 'we', 'us', 'our', 'ours', 'they',
  'them', 'their', 'theirs'
]);

/**
 * Preprocesses text: lowercasing, tokenization, stopword removal.
 */
export function preprocess(text: string): string[] {
  const doc = nlp(text.toLowerCase());
  const terms = (doc.terms().out('array') as string[])
    .map(t => t.replace(/[^\w]/g, ''))
    .filter(t => t.length > 0 && !STOPWORDS.has(t));

  return terms;
}

/**
 * Local fallback for similarity if AI fails or key is missing.
 */
function localCosineSimilarity(queryTokens: string[], targetTokens: string[]): number {
  const v1 = new Map<string, number>();
  const v2 = new Map<string, number>();
  queryTokens.forEach(t => v1.set(t, (v1.get(t) || 0) + 1));
  targetTokens.forEach(t => v2.set(t, (v2.get(t) || 0) + 1));

  let dotProduct = 0;
  let mA = 0;
  let mB = 0;
  const allKeys = new Set([...v1.keys(), ...v2.keys()]);

  for (const key of allKeys) {
    const val1 = v1.get(key) || 0;
    const val2 = v2.get(key) || 0;
    dotProduct += val1 * val2;
    mA += val1 * val1;
    mB += val2 * val2;
  }
  mA = Math.sqrt(mA);
  mB = Math.sqrt(mB);
  if (mA === 0 || mB === 0) return 0;
  return dotProduct / (mA * mB);
}

export interface MatchResult {
  user_query: string;
  matched_question: string | null;
  answer: string | null;
  confidence_score: number;
  suggestions: string[];
}

/**
 * Finds the best FAQ match using Gemini for semantic intelligence.
 */
export async function getFaqMatch(userQuery: string): Promise<MatchResult> {
  const datasetContext = JSON.stringify(FAQ_DATASET.map(f => ({ q: f.question, a: f.answer })));
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `User Query: "${userQuery}"\n\nDataset: ${datasetContext}`,
      config: {
        systemInstruction: `You are a helpful AI assistant. 
        1. First, check if the User Query matches any question in the provided Dataset semantically.
        2. If confidence is >= 0.75, set 'matched_question' and use the 'answer' from the dataset.
        3. If no high-confidence match is found in the dataset, you MUST still answer the user's query using your general knowledge. In this case, 'matched_question' should be null.
        4. Always suggest 2-3 relevant questions from the dataset that might interest the user.
        5. Keep the tone helpful and human-like.
        6. Output MUST be strictly JSON.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matched_question: { type: Type.STRING, nullable: true },
            answer: { type: Type.STRING },
            confidence_score: { type: Type.NUMBER },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["answer", "confidence_score", "suggestions"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    
    return {
      user_query: userQuery,
      matched_question: result.matched_question || null,
      answer: result.answer,
      confidence_score: result.confidence_score,
      suggestions: result.suggestions || []
    };

  } catch (error) {
    console.warn("Gemini failing, falling back to local NLP:", error);
    // Local Fallback Logic
    const queryTokens = preprocess(userQuery);
    const results = FAQ_DATASET.map(faq => ({
      faq,
      score: localCosineSimilarity(queryTokens, preprocess(faq.question))
    })).sort((a, b) => b.score - a.score);

    const top = results[0];
    return {
      user_query: userQuery,
      matched_question: top && top.score >= 0.75 ? top.faq.question : null,
      answer: top && top.score >= 0.75 ? top.faq.answer : (top && top.score >= 0.5 ? `I found a similar question: ${top.faq.question}` : "Sorry, no relevant answer found."),
      confidence_score: top ? top.score : 0,
      suggestions: results.slice(1, 4).map(r => r.faq.question)
    };
  }
}

