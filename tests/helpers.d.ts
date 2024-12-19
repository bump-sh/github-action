declare namespace global {
  function mockEnv(env: Record<string, string>): () => void;
}
