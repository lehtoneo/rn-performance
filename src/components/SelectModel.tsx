import RadioGroup from './tests/radio-group';
import { Model } from '@/lib/hooks/ml/fast-tf-lite/useReactNativeFastTfLite';

type Props = {
  value: Model | null;
  onChange: (value: Model | null) => void;
};

const SelectModel = (props: Props) => {
  return (
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
      value={props.value}
      onChange={(value) => props.onChange(value)}
    />
  );
};

export default SelectModel;
