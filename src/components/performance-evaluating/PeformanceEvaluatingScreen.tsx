import RadioGroup from '../tests/radio-group';
import { Button, Text, View } from 'react-native';

import { Model } from '@/lib/hooks/ml/fast-tf-lite/useReactNativeFastTfLite';
import { PerformanceEvaluator } from '@/lib/hooks/performance/usePerformanceEvaluator';
import { ModelInputPrecision } from '@/lib/types';

interface PerformanceEvaluatingScreenProps {
  modelInputPrecisionProps?: {
    value: ModelInputPrecision;
    onChange: (value: ModelInputPrecision) => void;
  };
  modelTypeProps: {
    value: Model;
    onChange: (value: Model) => void;
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
    <View style={{ gap: 8 }}>
      {props.modelInputPrecisionProps && (
        <>
          <Text>Input precision</Text>
          <RadioGroup<ModelInputPrecision>
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
            value={props.modelInputPrecisionProps.value}
            onChange={(value) =>
              props.modelInputPrecisionProps?.onChange(value)
            }
          />
        </>
      )}
      <Text>Model</Text>
      <RadioGroup<Model>
        options={[
          {
            label: 'mobilenet',
            value: 'mobilenet'
          },
          {
            label: 'ssd_mobilenet',
            value: 'ssd_mobilenet'
          }
        ]}
        value={props.modelTypeProps.value}
        onChange={(value) => props.modelTypeProps.onChange(value)}
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
