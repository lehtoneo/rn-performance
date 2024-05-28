import RadioGroup from './tests/radio-group';
import { Delegate } from '@/lib/services/resultService';
import { ModelInputPrecision } from '@/lib/types';

type Props = {
  options?: Delegate[];
  value: Delegate;
  onChange: (value: Delegate) => void;
};

const allDelegates = Object.values(Delegate);
const SelectDelegate = ({ value, onChange, options }: Props) => {
  const usedOptions = options || allDelegates;
  return (
    <RadioGroup<Delegate>
      options={usedOptions.map((d) => {
        return {
          value: d,
          label: d
        };
      })}
      value={value}
      onChange={(value) => onChange(value)}
    />
  );
};

export default SelectDelegate;
