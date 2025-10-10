import { query } from 'mu';
import * as z from 'zod';
import { queryResultSchema } from '../database-validation/sparql-result-schema';
import {
  dateTimeValue,
  plainString,
  stringValue,
  uriValue,
} from '../database-validation/sparql-value-schemas';

export const designSchema = z
  .object({
    name: z.string(),
    date: z.date(),
    uri: z.string(),
    id: z.string(),
  })
  .strict();
export type DesignResource = z.infer<typeof designSchema>;

const designBindings = z.array(
  z.strictObject({
    name: stringValue,
    date: dateTimeValue,
    uri: uriValue,
    id: plainString,
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
          id: b.id.value,
        })),
    ),
  )
  .pipe(z.array(designSchema));
export async function getAllDesigns(): Promise<DesignResource[]> {
  const queryStr = `
  PREFIX mobiliteit: <https://data.vlaanderen.be/ns/mobiliteit#>
  PREFIX arOntwerp: <https://data.vlaanderen.be/ns/mobiliteit#AanvullendReglementOntwerp.>
  PREFIX relatie: <https://wegenenverkeer.data.vlaanderen.be/ns/implementatieelement#RelatieObject.>
  PREFIX onderdeel: <https://wegenenverkeer.data.vlaanderen.be/ns/onderdeel#>
  PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
  PREFIX dct: <http://purl.org/dc/terms/>

  SELECT DISTINCT ?uri ?name ?date ?id WHERE { 
    ?uri a mobiliteit:AanvullendReglementOntwerp;
       mu:uuid ?id;
       arOntwerp:naam ?name;
       dct:issued ?date.
  } 

  `;
  const rawResult = await query(queryStr);
  const result = resultsToDesigns.parse(rawResult);

  return result;
}
