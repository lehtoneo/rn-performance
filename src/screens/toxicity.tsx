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

import { useToxicityModel } from '../hooks/ml';

const Toxicity = () => {
  const { classifying, results, classifyAsync } = useToxicityModel();
  const [text, setText] = useState('');

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

      {classifying && <Text>Predicting...</Text>}

      {!classifying && (
        <Button
          title="Predict"
          onPress={async () => {
            await classifyAsync(text);
            setText('');
          }}
        />
      )}

      <ScrollView>
        <View style={{ gap: 8 }}>
          {results.map((pred, i) => {
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
