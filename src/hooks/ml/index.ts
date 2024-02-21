import * as toxicity from '@tensorflow-models/toxicity';
import { useState } from 'react';

interface ToxicityResult {
  label: string;
  results: {
    probabilities: Float32Array;
    match: boolean;
  }[];
}

/**
 * A hook that uses the toxicity model to classify text.
 * @returns
 */
export const useToxicityModel = () => {
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ToxicityResult[]>([]);

  const [classifying, setClassifying] = useState(false);

  const handlePredict = async (text: string) => {
    if (classifying) return;
    setError(null);
    setResults([]);
    setClassifying(true);
    try {
      const model = await toxicity.load(0.8, [
        'identity_attack',
        'insult',
        'obscene',
        'severe_toxicity',
        'sexual_explicit',
        'threat',
        'toxicity'
      ]);

      const predictions = await model.classify(text);
      setResults(predictions);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setClassifying(false);
    }
  };

  return {
    error,
    results,
    classifying,
    classifyAsync: handlePredict
  };
};
