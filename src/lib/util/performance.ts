const createPerformanceTest = (opts: {
  name: string;
  fn: () => Promise<any>;
}) => {
  const { name, fn } = opts;

  return async () => {
    const start = Date.now();
    await fn();
    const end = Date.now();
    console.log(`${name} took ${end - start}ms`);
  };
};

const perfUtil = {
  createPerformanceTest
};
