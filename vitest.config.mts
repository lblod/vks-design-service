import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // ... Specify options here.
    testTimeout: 50000,
    hookTimeout: 50000,
    env: {
      MU_SPARQL_ENDPOINT: 'http://database:8890/sparql',
      // DEBUG: 'testcontainers:*',
      TESTCONTAINERS_RYUK_DISABLED: 'true',
      TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE: '/run/docker.sock',
    },
  },
});
