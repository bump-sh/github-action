global.mockEnv = (env: Record<string, string>): (() => void) => {
  Object.keys(env).forEach((key) => {
    process.env[key] = env[key];
  });

  const restoreCallback = () => {
    Object.keys(env).forEach((key) => {
      delete process.env[key];
    });
  };

  return restoreCallback;
};
