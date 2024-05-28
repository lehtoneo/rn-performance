import { useKeepAwake } from '@sayem314/react-native-keep-awake';
import { View } from 'react-native';

import PerformanceResourcesRunner from './PerformanceResourcesRunner';
import PerformanceSpeedRunner from './PerformanceSpeedRunner';
import { MLPerformanceRunnerService } from '@/lib/services/ml-performance-runner/common';

type Props = {
  service: MLPerformanceRunnerService;
};

const PerformanceRunnerScreen = (props: Props) => {
  useKeepAwake();
  return (
    <View style={{ gap: 16 }}>
      <PerformanceSpeedRunner service={props.service} />
    </View>
  );
};

export default PerformanceRunnerScreen;
