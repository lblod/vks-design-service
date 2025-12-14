import z from 'zod';
import type { variableInstanceSchema } from '../schemas/variable-instance.ts';
import type { MeasureConcept } from '../schemas/measure-concept.ts';
import { query, uuid } from 'mu';
import { getVariables } from '../db/variables.ts';
import { uriValuesClause } from '../db/schema-query.ts';
import { hasVKSRelationship } from '../utils/vks-relationship-helpers.ts';
import { objectify } from '../utils/sparql.ts';

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
      let value = undefined;
      if (templateVariable.correspondingSignVar) {
        value =
          (
            await getSignVarValue(
              templateVariable.correspondingSignVar,
              measureDesign.trafficSignals,
            )
          )[0]?.value || undefined;
      }
      result.push({
        uri,
        id,
        variable: templateVariable,
        value,
      });
    }
    return result;
  },
};
export default VariableInstancesService;
const signVarSchema = z.array(
  z.object({ signVar: z.string(), value: z.string() }),
);
async function getSignVarValue(
  signVarUri: string,
  signalInstanceUris: string[],
) {
  const result = await query(/* SPARQL */ `
  PREFIX variables: <https://lblod.data.gift/vocabularies/variables/>
  PREFIX onderdeel: <https://wegenenverkeer.data.vlaanderen.be/ns/onderdeel#>
  PREFIX relatie: <https://wegenenverkeer.data.vlaanderen.be/ns/implementatieelement#RelatieObject.>
  SELECT ?signVar ?value WHERE {

    ${uriValuesClause([signVarUri], '?signVar')}
    ${uriValuesClause(signalInstanceUris, '?signalInstance')}
    ${hasVKSRelationship('?signVarInstance', '?signVar', 'onderdeel:HeeftWaardeVoor')}
    ${hasVKSRelationship('?signVarInstance', '?signalInstance', 'onderdeel:HeeftVerkeersteken')}
    ?signVarInstance variables:VariableInstanceWithResourceValue.waarde ?value.
  }
  `);
  const bindings = result.results.bindings;
  return signVarSchema.parse(bindings.map(objectify));
}
