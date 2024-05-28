import SelectInputPrecision from '../SelectInputPrecision';
import SelectModel from '../SelectModel';
import RadioGroup from '../tests/radio-group';
import { useState } from 'react';
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
  dataLoadError: string | null;
}
const PerformanceEvaluatingScreen = (
  props: PerformanceEvaluatingScreenProps
) => {
  const [runTimes, setRuntimes] = useState<number>(5);
  return (
    <View style={{ gap: 8 }}>
      <Text>Model</Text>

      <SelectModel
        value={props.modelTypeProps.value}
        onChange={props.modelTypeProps.onChange}
      />

      {props.modelInputPrecisionProps && (
        <>
          <Text>Input precision</Text>
          <SelectInputPrecision
            value={props.modelInputPrecisionProps.value}
            onChange={(val) => {
              props.modelInputPrecisionProps?.onChange(val);
            }}
          />
        </>
      )}

      {props.performanceEvaluator.loadingData && <Text>Loading data...</Text>}
      {props.dataLoadError && (
        <Text style={{ color: 'red' }}>{props.dataLoadError}</Text>
      )}

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
          await props.performanceEvaluator.runPredictions(runTimes);
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
