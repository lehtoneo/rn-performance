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
    value: Model | null;
    onChange: (value: Model | null) => void;
  };
  performanceEvaluator: PerformanceEvaluator;
  modelLoadError: string | null;
}
const PerformanceEvaluatingScreen = (
  props: PerformanceEvaluatingScreenProps
) => {
  return (
    <View style={{ gap: 8 }}>
      <Text>Model</Text>
      <RadioGroup<Model | null>
        options={[
          {
            label: 'mobilenetv2',
            value: 'mobilenetv2'
          },
          {
            label: 'mobilenet_edgetpu',
            value: 'mobilenet_edgetpu'
          },
          {
            label: 'ssd_mobilenet',
            value: 'ssd_mobilenet'
          },
          {
            label: 'deeplabv3',
            value: 'deeplabv3'
          }
        ]}
        value={props.modelTypeProps.value}
        onChange={(value) => props.modelTypeProps.onChange(value)}
      />

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

      {props.performanceEvaluator.loadingData && <Text>Loading data...</Text>}

      <View>
        {props.performanceEvaluator.runErrors.length > 0 && (
          <Text style={{ color: 'red', fontSize: 18, fontWeight: 'bold' }}>
            Errors
          </Text>
        )}
        {props.performanceEvaluator.runErrors.map((e) => {
          return (
            <Text key={e} style={{ color: 'red' }}>
              {e}
            </Text>
          );
        })}
      </View>
      <Button
        title="Run inference"
        onPress={async () => {
          await props.performanceEvaluator.runPredictions(5);
        }}
        disabled={
          props.performanceEvaluator.running ||
          props.performanceEvaluator.loadingData ||
          props.performanceEvaluator.loadingModel
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
      {props.performanceEvaluator.accuracy !== undefined ? (
        <Text>Accuracy: {props.performanceEvaluator.accuracy.toFixed(4)}</Text>
      ) : null}
    </View>
  );
};

export default PerformanceEvaluatingScreen;
