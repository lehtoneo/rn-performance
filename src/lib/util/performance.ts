type PerformanceTestOpts<T> = {
  name: string;
  fn: () => T;
};

async function createMultipleAsyncPerformanceTests<T>(opts: {
  name: string;
  fns: Array<() => Promise<T>>;
  opts?: {
    logResults?: boolean;
  };
}) {
  let sum = 0;
  let avg = 0;

  let results: Array<{ fnResult: T; time: number; index: number }> = [];

  let i = 0;
  console.log('Running tests');
  while (i < opts.fns.length) {
    const start = performance.now();
    const r = await opts.fns[i]();
    const end = performance.now();
    const time = end - start;
    if (opts.opts?.logResults) {
      console.log(`${opts.name} took ${time}ms`);
    }
    sum += time;
    results = [...results, { fnResult: r, time, index: i }];
    i++;
  }

  const framesPerSecond = 1000 / (sum / opts.fns.length);

  return {
    framesPerSecond,
    results,
    sum,
    avg: sum / opts.fns.length
  };
}

async function createAsyncPerformanceTest<T>(
  opts: PerformanceTestOpts<Promise<T>>
) {
  const { name, fn } = opts;
  const start = Date.now();
  const r = await fn();
  const end = Date.now();
  console.log(`${name} took ${end - start}ms`);

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
  console.log(`${name} took ${end - start}ms`);

  return {
    fnResult: r,
    time: end - start
  };
}

export const perfUtil = {
  createMultipleAsyncPerformanceTests,
  createAsyncPerformanceTest,
  createSyncPerformanceTest
};
