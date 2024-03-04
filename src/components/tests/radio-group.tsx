import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface RadioGroupProps<T> {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}

function RadioGroup<T>(props: RadioGroupProps<T>) {
  return (
    <View style={styles.container}>
      {props.options.map((option, index) => {
        const selected = option.value === props.value;
        return (
          <TouchableOpacity
            key={index}
            style={[styles.radio, selected && styles.selectedStyle]}
            onPress={() => props.onChange(option.value)}
          >
            <Text>{option.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8
  },
  radio: {
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8
  },
  selectedStyle: {
    backgroundColor: 'green'
  }
});

export default RadioGroup;
