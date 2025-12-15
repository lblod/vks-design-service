type VKSRelationshipType =
  | 'onderdeel:BevatMaatregelOntwerp'
  | '<https://wegenenverkeer.data.vlaanderen.be/ns/onderdeel#BevatMaatregelOntwerp>'
  | 'onderdeel:IsGebaseerdOp'
  | '<https://wegenenverkeer.data.vlaanderen.be/ns/onderdeel#IsGebaseerdOp>'
  | 'onderdeel:HeeftOntwerp'
  | '<https://wegenenverkeer.data.vlaanderen.be/ns/onderdeel#HeeftOntwerp>'
  | 'onderdeel:BevatVerkeersteken'
  | '<https://wegenenverkeer.data.vlaanderen.be/ns/onderdeel#BevatVerkeersteken>'
  | 'onderdeel:WordtAangeduidDoor'
  | '<https://wegenenverkeer.data.vlaanderen.be/ns/onderdeel#WordtAangeduidDoor>'
  | 'onderdeel:HeeftVerkeersteken'
  | '<https://wegenenverkeer.data.vlaanderen.be/ns/onderdeel#HeeftVerkeersteken>'
  | 'onderdeel:HeeftWaardeVoor'
  | '<https://wegenenverkeer.data.vlaanderen.be/ns/onderdeel#HeeftWaardeVoor>';

export function hasVKSRelationship(
  source: string,
  target: string,
  relationshipType: VKSRelationshipType,
) {
  return `${source} ^relatie:bron [
          a ${relationshipType};
          relatie:doel ${target}
        ].`;
}
