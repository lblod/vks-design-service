import { query } from 'mu';
import * as z from 'zod';
import { queryResultSchema } from '../database-validation/sparql-result-schema';
import {
  dateTimeValue,
  plainString,
  stringValue,
  uriList,
  uriValue,
} from '../database-validation/sparql-value-schemas';

export const designSchema = z
  .object({
    name: z.string(),
    date: z.date(),
    uri: z.string(),
    id: z.uuid(),
    signs: z.array(z.string()),
  })
  .strict();
export type DesignResource = z.infer<typeof designSchema>;

const designBindings = z.array(
  z.strictObject({
    name: stringValue,
    date: dateTimeValue,
    uri: uriValue,
    id: plainString,
    signs: uriList,
  }),
);

const designResultSchema = queryResultSchema(designBindings);
const resultsToDesigns = designResultSchema
  .pipe(
    z.transform<z.infer<typeof designResultSchema>, DesignResource[]>(
      (result) =>
        result.results.bindings.map((b) => ({
          name: b.name.value,
          date: b.date.value,
          uri: b.uri.value,
          signs: b.signs.value,
          id: b.id.value,
        })),
    ),
  )
  .pipe(z.array(designSchema));
export async function getAllDesigns(): Promise<DesignResource[]> {
  const queryStr = `
  PREFIX mobiliteit: <https://data.vlaanderen.be/ns/mobiliteit#>
  PREFIX ontwerp: <https://data.vlaanderen.be/ns/mobiliteit#SignalisatieOntwerp.>
  PREFIX relatie: <https://wegenenverkeer.data.vlaanderen.be/ns/implementatieelement#RelatieObject.>
  PREFIX onderdeel: <https://wegenenverkeer.data.vlaanderen.be/ns/onderdeel#>
  PREFIX mu: <http://mu.semte.ch/vocabularies/core/>

  SELECT DISTINCT ?uri ?name ?date ?id (GROUP_CONCAT(?containsSign; SEPARATOR = ",") as ?signs) WHERE { 
    ?uri a mobiliteit:SignalisatieOntwerp;
       mu:uuid ?id;
       ontwerp:naam ?name;
       ontwerp:datum ?date.
    ?rel a onderdeel:BevatVerkeersteken;
       relatie:bron ?uri;
      relatie:doel ?containsSign.
  } GROUP BY ?uri ?name ?date ?id

  `;
  const rawResult = await query<{ name: string; s: string }>(queryStr);
  // console.log(JSON.stringify(rawResult, undefined, 2));
  const result = resultsToDesigns.parse(rawResult);

  return result;
}
