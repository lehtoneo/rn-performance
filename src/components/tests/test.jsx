import { Text, View } from 'react-native';
import { NativeModules } from 'react-native';

/**
 * - Sorts an array using the bubble sort algorithm.
 * - Time complexity: O(n^2)
 * @param {number[]} arr - The array to sort.
 */
function bubbleSort(arr) {
  let n = arr.length;
  let swapped;

  do {
    swapped = false;
    for (let i = 0; i < n - 1; i++) {
      if (arr[i] > arr[i + 1]) {
        // Swap the elements
        let temp = arr[i];
        arr[i] = arr[i + 1];
        arr[i + 1] = temp;

        swapped = true;
      }
    }
    n--;
  } while (swapped);

  return arr;
}

const ExpensiveComponent = () => {
  const expensiveResult = expensiveJSFunction();
  return (
    <View>
      {
        // Display the result of the expensive function
      }
    </View>
  );
};

const ExpensiveComponent2 = () => {
  const [expensiveResult, setExpensiveResult] = useState(null);

  useEffect(() => {
    const result = expensiveJSFunction();
    setExpensiveResult(result);
  }, []);

  return (
    <View>
      {
        // Display the result of the expensive function
      }
    </View>
  );
};

import { NativeModules } from 'react-native';

const { ExampleModule } = NativeModules;

const expensiveJSFunction = async () => {
  const result = await ExampleModule.expensiveFunction();
  return result;
};



export { ExpensiveComponent, ExpensiveComponent2 };
