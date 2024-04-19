import SelectDelegate from '../SelectDelegate';
import SelectInputPrecision from '../SelectInputPrecision';
import SelectLoadModelOptions from '../SelectLoadModelOptions';
import SelectModel from '../SelectModel';
import { Button, View } from 'react-native';

import { useMLPerformanceResourcesRunner } from '@/lib/hooks/performance/useMLPerformanceResourcesRunner';
import { MLPerformanceRunnerService } from '@/lib/services/ml-performance-runner/common';

type Props = {
  service: MLPerformanceRunnerService;
};

const PerformanceResourcesRunner = (props: Props) => {
  const resourcesRunner = useMLPerformanceResourcesRunner(props.service);
  return (
    <View style={{ gap: 16, backgroundColor: 'blue', padding: 16 }}>
      <SelectLoadModelOptions
        delegateOptions={resourcesRunner.delegates}
        value={resourcesRunner.state.LoadModelOptions}
        onChange={resourcesRunner.state.setLoadModelOptions}
      />
      <Button
        title="Run Resources test!"
        onPress={resourcesRunner.run}
        disabled={resourcesRunner.running}
      />
    </View>
  );
};

export default PerformanceResourcesRunner;
