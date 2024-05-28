import RadioGroup from './tests/radio-group';
import { ModelInputPrecision } from '@/lib/types';

type Props = {
  value: ModelInputPrecision;
  onChange: (value: ModelInputPrecision) => void;
};

const SelectInputPrecision = ({ value, onChange }: Props) => {
  return (
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
      value={value}
      onChange={(value) => onChange(value)}
    />
  );
};

export default SelectInputPrecision;
