import * as z from 'zod';

// needs to be a function to support the tests,
// which also mess with the env because the mu functions don't take in endpoint arguments
export function getMowEndpoint() {
  return (
    process.env.MOW_ENDPOINT ??
    process.env.MU_SPARQL_ENDPOINT ??
    'http://database:8890/sparql'
  );
}

const authSchema = z.strictObject({
  checkType: z.literal(['session_group', 'agent']).default('session_group'),
});
export const AUTH_CONFIG = authSchema.parse({
  checkType: process.env.AUTH_CHECK_TYPE,
});

export const DEFAULT_PAGINATION_SIZE = 20;
