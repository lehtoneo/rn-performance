import { Button, Text, View } from 'react-native';

import { UseMLPerformanceRunner } from '@/lib/hooks/performance/useMLPerformanceRunner';
import { LoadModelOptions } from '@/lib/services/ml-performance-runner/common';

type Props = {
  useMLPerformanceRunner: UseMLPerformanceRunner;
};

const loadModelOptionsToString = (options: LoadModelOptions | null) => {
  if (!options) return '';
  return `${options.model} ${options.inputPrecision} ${options.delegate}`;
};

const PerformanceRunnerScreen = (props: Props) => {
  const { useMLPerformanceRunner } = props;
  return (
    <View style={{ gap: 16 }}>
      <Text>
        {loadModelOptionsToString(
          useMLPerformanceRunner.currentLoadModelOptions
        )}
      </Text>

      <Text>
        {useMLPerformanceRunner.performedRuns.length} /{' '}
        {useMLPerformanceRunner.runsAmount}
      </Text>

      <Text>Run {useMLPerformanceRunner.runI}</Text>

      {useMLPerformanceRunner.running && <Text>Running...</Text>}

      <Button
        title="Run ALL!"
        onPress={useMLPerformanceRunner.runForAllAsync}
        disabled={useMLPerformanceRunner.running}
      />
    </View>
  );
};

export default PerformanceRunnerScreen;
