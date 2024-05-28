import { Button, Text, View } from 'react-native';

import {
  UseMLPerformanceRunner,
  useMLPerformanceSpeedRunner
} from '@/lib/hooks/performance/useMLPerformanceSpeedRunner';
import { MLPerformanceRunnerService } from '@/lib/services/ml-performance-runner/common';
import { LoadModelOptions } from '@/lib/services/ml-performance-runner/types';

type Props = {
  service: MLPerformanceRunnerService;
};

const loadModelOptionsToString = (options: LoadModelOptions | null) => {
  if (!options) return '';
  return `${options.model} ${options.inputPrecision} ${options.delegate}`;
};

const PerformanceSpeedRunner = (props: Props) => {
  const performanceRunner = useMLPerformanceSpeedRunner(props.service);
  return (
    <View style={{ gap: 16 }}>
      <Text>
        {loadModelOptionsToString(performanceRunner.currentLoadModelOptions)}
      </Text>

      <Text>
        {performanceRunner.performedRuns.length} /{' '}
        {performanceRunner.runsAmount}
      </Text>

      <Text>Run {performanceRunner.runI}</Text>

      {performanceRunner.running && <Text>Running...</Text>}

      <Button
        title="Run all speed tests!"
        onPress={performanceRunner.runForAllAsync}
        disabled={performanceRunner.running}
      />
    </View>
  );
};

export default PerformanceSpeedRunner;
