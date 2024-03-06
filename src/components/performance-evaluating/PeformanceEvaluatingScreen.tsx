import RadioGroup from '../tests/radio-group';
import { Button, Text, View } from 'react-native';

import { PerformanceEvaluator } from '@/lib/hooks/performance/usePerformanceEvaluator';
import { ModelPrecision } from '@/lib/types';

interface PerformanceEvaluatingScreenProps {
  modelPrecisionProps: {
    value: ModelPrecision;
    onChange: (value: ModelPrecision) => void;
  };
  performanceEvaluator: PerformanceEvaluator;
  loadingData: boolean;
  loadingModel: boolean;
  modelLoadError: string | null;
}
const PerformanceEvaluatingScreen = (
  props: PerformanceEvaluatingScreenProps
) => {
  return (
    <View>
      <Text>Model type</Text>
      <RadioGroup<ModelPrecision>
        options={[
          {
            label: 'uint8',
            value: 'uint8'
          },
          {
            label: 'float32',
            value: 'float32'
          }
        ]}
        value={props.modelPrecisionProps.value}
        onChange={(value) => props.modelPrecisionProps.onChange(value)}
      />
      <Button
        title="Run inference"
        onPress={props.performanceEvaluator.runPredictions}
        disabled={
          props.performanceEvaluator.running ||
          props.loadingData ||
          props.loadingModel
        }
      />
      {props.modelLoadError && (
        <Text style={{ color: 'red' }}>{props.modelLoadError}</Text>
      )}
      {props.performanceEvaluator.running && <Text>Running...</Text>}
      <Text style={{ fontWeight: 'bold' }}>Results</Text>

      {props.performanceEvaluator.avg ? (
        <Text>
          Avg inference time: {props.performanceEvaluator.avg.toFixed(4)}ms
        </Text>
      ) : null}
    </View>
  );
};

export default PerformanceEvaluatingScreen;
