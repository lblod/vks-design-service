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

// WARNING: this schema used to check that only one sign-variable instance was available for a given measure-template-variable.
// We've since discovered that this is a fundamental flaw in the design of the measure-template system:
// Consider the case where in a single street, 2 signs with a distance limit (aka "You can park for the next X meters") are implemented in 2 spots
// Normally, a measure that's implemented in 2 places means 1 article, with the 2 locations written out in the "plaatsbeschrijving".
// However, in this case, that' doesn't work, cause each of the locations may have a different value for X, and the idea falls apart.
// Luckily this is rare, and there is a workaround by simply making a separate measure article, or by manually adjusting the text as the user sees fit.
// But it's not ideal. In any case, we can't error on this situation as it may legitimately occur.
const signVarSchema = z.array(
  z.object({
    signVar: z.string(),
    value: z.string(),
    isResource: z.string(),
  }),
);
// The zod limit used to look like this:
//.max(1);

async function getSignVarValue(
  signVarUri: string,
  signalInstanceUris: string[],
) {
  const result = await query(
    /* SPARQL */ `
  PREFIX variables: <https://lblod.data.gift/vocabularies/variables/>
  PREFIX onderdeel: <https://wegenenverkeer.data.vlaanderen.be/ns/onderdeel#>
  PREFIX relatie: <https://wegenenverkeer.data.vlaanderen.be/ns/implementatieelement#RelatieObject.>
  SELECT DISTINCT ?signVar ?value ?isResource WHERE {
    GRAPH <http://mu.semte.ch/graphs/awv/ldes> {
      ${uriValuesClause([signVarUri], '?signVar')}
      ${uriValuesClause(signalInstanceUris, '?signalInstance')}
      ${hasVKSRelationship('?signVarInstance', '?signVar', 'onderdeel:HeeftWaardeVoor')}
      ${hasVKSRelationship('?signVarInstance', '?signalInstance', 'onderdeel:HeeftVerkeersteken')}
       {
      ?signVarInstance variables:VariableInstanceWithResourceValue.waarde ?value.
	BIND("true" as ?isResource)
      } UNION {
      ?signVarInstance variables:VariableInstanceWithLiteralValue.waarde ?value.
	BIND("false" as ?isResource)
      }
    }
  }
  `,
    { sudo: true },
  );
  const bindings = result.results.bindings;

  const parsed = signVarSchema.parse(bindings.map(objectify))[0];

  if (!parsed) return;
  if (parsed.isResource) {
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
