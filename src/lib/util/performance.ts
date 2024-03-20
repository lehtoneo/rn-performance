type PerformanceTestOpts<T> = {
  name: string;
  fn: () => T;
};

type PerformanceTestResult<T> = {
  fnResult: T;
  time: number;
};

async function createAsyncPerformanceTest<T>(
  opts: PerformanceTestOpts<Promise<T>>
): Promise<PerformanceTestResult<T>> {
  const { name, fn } = opts;
  const start = Date.now();
  const r = await fn();
  const end = Date.now();
  // console.log(`${name} took ${end - start}ms`);

  return {
    fnResult: r,
    time: end - start
  };
}

function createSyncPerformanceTest<T>(opts: PerformanceTestOpts<T>) {
  const { name, fn } = opts;
  const start = Date.now();
  const r = fn();
  const end = Date.now();
  // console.log(`${name} took ${end - start}ms`);

  return {
    fnResult: r,
    time: end - start
  };
}

export const perfUtil = {
  createAsyncPerformanceTest,
  createSyncPerformanceTest
};
