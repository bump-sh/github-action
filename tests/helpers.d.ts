declare namespace globalThis {
  function mockEnv(env: Record<string, string>): () => void;
}
