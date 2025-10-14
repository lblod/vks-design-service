// needs to be a function to support the tests,
// which also mess with the env because the mu functions don't take in endpoint arguments
export function getMowEndpoint() {
  return (
    process.env.MOW_ENDPOINT ??
    process.env.MU_SPARQL_ENDPOINT ??
    'http://database:8890/sparql'
  );
}
