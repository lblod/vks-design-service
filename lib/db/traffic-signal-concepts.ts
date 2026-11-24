import {
  idValuesClause,
  uriValuesClause,
  type GetQueryOpts,
} from './schema-query.ts';
import { getMowEndpoint, getImageBaseUrl } from '../environment.ts';
import {
  query,
  sparqlEscapeString,
  sparqlEscapeUri,
  type BindingObject,
} from 'mu';
import { trafficSignalConceptSchema } from '../schemas/traffic-signal-concept.ts';
import type { Instruction } from '../schemas/instruction.ts';
import type { RoadSignCategory } from '../schemas/road-sign-category.ts';
import { objectify } from '../utils/sparql.ts';
import { TRAFFIC_SIGNAL_CONCEPT_TYPES } from '../constants.ts';
import * as z from 'zod';

type TrafficSignalConceptBinding = {
  uri: string;
  id: string;
  type: string;
  code: string;
  meaning: string;
  regulatoryNotation: string;
  image: string;
  category: string;
  categoryId: string;
  categoryLabel: string;
  instruction: string;
  instructionId: string;
  instructionValue: string;
  instructionPreview: string;
  mainSign: string;
};

type GroupedTrafficSignalConcept = {
  uri: string;
  id: string;
  type: string;
  code: string;
  meaning: string;
  regulatoryNotation?: string;
  image: string;
  categories: Map<string, RoadSignCategory>;
  instructions: Map<string, Instruction>;
  mainSigns: Set<string>;
};

const trafficSignalConceptPattern = /* sparql */ `
  ?uri
    a mobiliteit:Verkeerstekenconcept;
    mu:uuid ?id;
    a ?type;
    skos:prefLabel ?code;
    skos:scopeNote ?meaning.
`;

const regulatoryNotationPattern = /* sparql */ `
  OPTIONAL {
    ?uri ext:regulatoryNotation ?regulatoryNotation.
  }
`;

function imagePattern(imageBaseUrl: string) {
  return /* sparql */ `
    OPTIONAL {
      ?uri mobiliteit:grafischeWeergave/ext:hasFile/mu:uuid ?imageId.
      BIND(CONCAT(${sparqlEscapeString(imageBaseUrl)}, "/files/", ?imageId, "/download") AS ?image)
    }
  `;
}

const roadSignCategoryPattern = /* sparql */ `
  OPTIONAL {
    ?uri dct:type ?category.
    ?category
      a mobiliteit:Verkeersbordcategorie;
      mu:uuid ?categoryId;
      skos:prefLabel ?categoryLabel.
  }
`;

const instructionPattern = /* sparql */ `
  OPTIONAL {
    ?uri mobiliteit:heeftInstructie ?instruction.
    ?instruction
      a mobiliteit:Template;
      mu:uuid ?instructionId;
      rdf:value ?instructionValue;
      ext:preview ?instructionPreview.
  }
`;

const mainSignPattern = /* sparql */ `
  OPTIONAL {
    ?mainSign mobiliteit:heeftMogelijkOnderbord ?uri.
  }
`;

const typeValuesPattern = /* sparql */ `
  VALUES ?type {
    ${sparqlEscapeUri(TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_SIGN)}
    ${sparqlEscapeUri(TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_MARKING)}
    ${sparqlEscapeUri(TRAFFIC_SIGNAL_CONCEPT_TYPES.TRAFFIC_LIGHT)}
  }
`;

export async function getTrafficSignalConcepts(opts: GetQueryOpts = {}) {
  const { ids, uris } = opts;

  const response = await query<TrafficSignalConceptBinding>(
    /* sparql */ `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX mobiliteit: <https://data.vlaanderen.be/ns/mobiliteit#>
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX dct: <http://purl.org/dc/terms/>

    SELECT DISTINCT
      ?id
      ?uri
      ?type
      ?code
      ?meaning
      ?regulatoryNotation
      ?image
      ?category
      ?categoryId
      ?categoryLabel
      ?instruction
      ?instructionId
      ?instructionValue
      ?instructionPreview
      ?mainSign
    WHERE {
      ${trafficSignalConceptPattern}

      ${regulatoryNotationPattern}

      ${imagePattern(getImageBaseUrl())}

      ${roadSignCategoryPattern}

      ${instructionPattern}

      ${mainSignPattern}

      ${typeValuesPattern}

      ${ids ? idValuesClause(ids) : ''}
      ${uris ? uriValuesClause(uris) : ''}
    }
  `,
    {
      endpoint: getMowEndpoint(),
    },
  );
  const groupedConcepts = groupBindingsByConcept(response.results.bindings);
  return z.array(trafficSignalConceptSchema).parse(
    [...groupedConcepts.values()].map((groupedConcept) => {
      const { categories, instructions, mainSigns, ...concept } =
        groupedConcept;
      if (concept.type !== TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_SIGN) {
        return concept;
      }
      return {
        ...concept,
        categories: [...categories.values()],
        instructions: [...instructions.values()],
        mainSigns: [...mainSigns],
      };
    }),
  );
}

function groupBindingsByConcept(
  bindings: BindingObject<TrafficSignalConceptBinding>[],
) {
  const concepts = new Map<string, GroupedTrafficSignalConcept>();
  for (const binding of bindings) {
    const objectified = objectify(binding);
    let concept = concepts.get(objectified.uri);
    if (!concept) {
      concept = {
        uri: objectified.uri,
        id: objectified.id,
        type: objectified.type,
        code: objectified.code,
        meaning: objectified.meaning,
        regulatoryNotation: objectified.regulatoryNotation,
        image: objectified.image ?? '',
        categories: new Map<string, RoadSignCategory>(),
        instructions: new Map<string, Instruction>(),
        mainSigns: new Set<string>(),
      };
      concepts.set(objectified.uri, concept);
    }
    if (
      objectified.category &&
      objectified.categoryId &&
      objectified.categoryLabel
    ) {
      concept.categories.set(objectified.category, {
        uri: objectified.category,
        label: objectified.categoryLabel,
        id: objectified.categoryId,
      });
    }
    if (
      objectified.instruction &&
      objectified.instructionId &&
      objectified.instructionValue &&
      objectified.instructionPreview
    ) {
      concept.instructions.set(objectified.instruction, {
        uri: objectified.instruction,
        id: objectified.instructionId,
        value: objectified.instructionValue,
        preview: objectified.instructionPreview,
      });
    }
    if (objectified.mainSign) {
      concept.mainSigns.add(objectified.mainSign);
    }
  }
  return concepts;
}

export async function getTrafficSignalConceptByUri(uri: string) {
  return getTrafficSignalConcepts({ uris: [uri] }).then(
    (concepts) => concepts[0],
  );
}
