import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // ... Specify options here.
    env: {
      MU_SPARQL_ENDPOINT: 'http://database:8890/sparql',
    },
  },
});
