import { View } from 'react-native';

import SelectDelegate from './SelectDelegate';
import SelectInputPrecision from './SelectInputPrecision';
import SelectModel from './SelectModel';
import { LoadModelOptions } from '@/lib/services/ml-performance-runner/types';
import { Delegate } from '@/lib/services/resultService';

type Props = {
  delegateOptions?: Delegate[];
  value: LoadModelOptions;
  onChange: (value: LoadModelOptions) => void;
};

const SelectLoadModelOptions = ({
  value,
  onChange,
  delegateOptions
}: Props) => {
  return (
    <View>
      <SelectDelegate
        options={delegateOptions}
        value={value.delegate}
        onChange={(val) => {
          onChange({
            ...value,
            delegate: val
          });
        }}
      />
      <SelectModel
        value={value.model}
        onChange={(val) => {
          if (!val) return;
          onChange({
            ...value,
            model: val
          });
        }}
      />

      <SelectInputPrecision
        value={value.inputPrecision}
        onChange={(val) => {
          onChange({
            ...value,
            inputPrecision: val
          });
        }}
      />
    </View>
  );
};

export default SelectLoadModelOptions;
