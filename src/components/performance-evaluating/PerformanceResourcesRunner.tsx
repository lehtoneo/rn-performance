import SelectDelegate from '../SelectDelegate';
import SelectInputPrecision from '../SelectInputPrecision';
import SelectLoadModelOptions from '../SelectLoadModelOptions';
import SelectModel from '../SelectModel';
import { useBatteryLevel } from 'expo-battery';
import { Button, Text, TextInput, View } from 'react-native';

import { useMLPerformanceResourcesRunner } from '@/lib/hooks/performance/useMLPerformanceResourcesRunner';
import { MLPerformanceRunnerService } from '@/lib/services/ml-performance-runner/common';

type Props = {
  service: MLPerformanceRunnerService;
};

const PerformanceResourcesRunner = (props: Props) => {
  const resourcesRunner = useMLPerformanceResourcesRunner(props.service);
  const batteryLevel = useBatteryLevel();
  return (
    <View
      style={{ gap: 16, padding: 16, borderWidth: 1, borderColor: 'black' }}
    >
      <Text>{props.service.getLibraryName()}</Text>
      <Text>Battery: {batteryLevel}</Text>
      <Text>Times</Text>
      <Text style={{ color: 'red' }}>{resourcesRunner.state.error}</Text>
      <TextInput
        style={{ backgroundColor: 'white', padding: 20 }}
        value={resourcesRunner.state.times.toString()}
        onChangeText={(text) => {
          text = text.replace(/[^0-9]/g, '');
          resourcesRunner.state.setTimes(parseInt(text));
        }}
        keyboardType="numeric"
      />
      <SelectModel
        value={resourcesRunner.state.model}
        onChange={(val) => {
          resourcesRunner.state.setModel(val!);
        }}
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
