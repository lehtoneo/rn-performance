import { ScrollView, Text, View } from 'react-native';

import PerformanceResourcesRunner from '@/components/performance-evaluating/PerformanceResourcesRunner';
import PerformanceRunnerScreen from '@/components/performance-evaluating/PerformanceRunnerScreen';

import { fastTfLiteMLPerformanceRunnerService } from '@/lib/services/ml-performance-runner/fast-tf-lite';
import { onnxMLPerformanceRunnerService } from '@/lib/services/ml-performance-runner/onnxruntime';

const Test = () => {
  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        <PerformanceResourcesRunner service={onnxMLPerformanceRunnerService} />
        <PerformanceResourcesRunner
          service={fastTfLiteMLPerformanceRunnerService}
        />
      </ScrollView>
    </View>
  );
};

export default Test;
