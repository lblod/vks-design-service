import z from 'zod';
import type { variableInstanceSchema } from '../schemas/variable-instance.ts';
import type { MeasureConcept } from '../schemas/measure-concept.ts';
import { query, uuid } from 'mu';
import { getVariables } from '../db/variables.ts';
import { uriValuesClause } from '../db/schema-query.ts';
import { hasVKSRelationship } from '../utils/vks-relationship-helpers.ts';
import { objectify } from '../utils/sparql.ts';
import { getMowEndpoint } from '../environment.ts';

type Args = {
  measureConcept: MeasureConcept;
  measureDesign: { trafficSignals: string[] };
};

const VariableInstancesService = {
  getVariableInstances: async ({ measureConcept, measureDesign }: Args) => {
    const templateVariables = await getVariables({
      uris: measureConcept.variables,
    });
    const result: z.infer<typeof variableInstanceSchema>[] = [];
    for (const templateVariable of templateVariables) {
      const id = uuid();
      const uri = `http://data.lblod.info/variable-instances/${id}`;
      if (templateVariable.correspondingSignVar) {
        const { value, valueLabel } =
          (await getSignVarValue(
            templateVariable.correspondingSignVar,
            measureDesign.trafficSignals,
          )) ?? {};

        result.push({
          uri,
          id,
          variable: templateVariable,
          value,
          valueLabel,
        });
      } else {
        result.push({
          uri,
          id,
          variable: templateVariable,
        });
      }
    }
    return result;
  },
};
export default VariableInstancesService;
const signVarSchema = z
  .array(z.object({ signVar: z.string(), value: z.string() }))
  .max(1);
async function getSignVarValue(
  signVarUri: string,
  signalInstanceUris: string[],
) {
  const result = await query(/* SPARQL */ `
  PREFIX variables: <https://lblod.data.gift/vocabularies/variables/>
  PREFIX onderdeel: <https://wegenenverkeer.data.vlaanderen.be/ns/onderdeel#>
  PREFIX relatie: <https://wegenenverkeer.data.vlaanderen.be/ns/implementatieelement#RelatieObject.>
  SELECT DISTINCT ?signVar ?value WHERE {

    ${uriValuesClause([signVarUri], '?signVar')}
    ${uriValuesClause(signalInstanceUris, '?signalInstance')}
    ${hasVKSRelationship('?signVarInstance', '?signVar', 'onderdeel:HeeftWaardeVoor')}
    ${hasVKSRelationship('?signVarInstance', '?signalInstance', 'onderdeel:HeeftVerkeersteken')}
    ?signVarInstance variables:VariableInstanceWithResourceValue.waarde ?value.
  }
  `);
  const bindings = result.results.bindings;

  const parsed = signVarSchema.parse(bindings.map(objectify))[0];

  if (!parsed) return;
  // You might think you can use the sparql type of the binding, e.g. binding.value.type === 'uri'
  // but because the codelist uri is given to us as a literal, its type is 'typed-literal' and not 'uri'
  // so we need to manually check for a uri-style string
  if (z.url().safeParse(parsed.value)) {
    const valueLabel = (await getCodelistOptionLabel(parsed.value))[0]?.label;
    return { value: parsed.value, valueLabel };
  }
  return { value: parsed.value };
}

const codeListLabelSchema = z.array(z.object({ label: z.string() })).max(1);
async function getCodelistOptionLabel(conceptUri: string) {
  const result = await query(
    /* sparql */ `
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    SELECT DISTINCT ?label WHERE {
    ${uriValuesClause([conceptUri], '?concept')} 
    ?concept skos:prefLabel ?label.
    }`,
    { endpoint: getMowEndpoint() },
  );
  const bindings = result.results.bindings;
  return codeListLabelSchema.parse(bindings.map(objectify));
}
