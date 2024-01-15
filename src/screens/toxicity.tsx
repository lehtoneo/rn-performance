import * as toxicity from '@tensorflow-models/toxicity';
import { useEffect, useRef, useState } from 'react';
import {
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

const Toxicity = () => {
  const [predictions, setPredictions] = useState<
    {
      label: string;
      results: {
        probabilities: Float32Array;
        match: boolean;
      }[];
    }[]
  >([]);
  const [predicting, setPredicting] = useState(false);

  const [text, setText] = useState('');

  const handlePredict = async () => {
    if (predicting) return;

    setPredictions([]);
    setPredicting(true);
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
    setPredictions(predictions);
    setPredicting(false);
  };

  return (
    <View style={{ flex: 1, padding: 8 * 2 }}>
      <View style={{ flexDirection: 'row', width: '100%' }}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          multiline
        />
      </View>

      {predicting && <Text>Predicting...</Text>}

      {!predicting && <Button title="Predict" onPress={handlePredict} />}

      <ScrollView>
        <View style={{ gap: 8 }}>
          {predictions.map((pred, i) => {
            const isMatch = pred.results[0].match;
            return (
              <View key={i}>
                <Text style={{ color: isMatch ? 'red' : 'green' }}>
                  {pred.label}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    flex: 1,
    minHeight: 40,
    padding: 10,
    borderWidth: 1
  }
});

export default Toxicity;
