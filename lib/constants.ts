export const TRAFFIC_SIGNAL_CONCEPT_TYPES = {
  TRAFFIC_SIGNAL:
    'https://data.vlaanderen.be/ns/mobiliteit#Verkeerstekenconcept',
  ROAD_SIGN: 'https://data.vlaanderen.be/ns/mobiliteit#Verkeersbordconcept',
  TRAFFIC_LIGHT:
    'https://data.vlaanderen.be/ns/mobiliteit#Verkeerslichtconcept',
  ROAD_MARKING: 'https://data.vlaanderen.be/ns/mobiliteit#Wegmarkeringconcept',
} as const;

export const ZONALITY_OPTIONS = {
  POTENTIALLY_ZONAL:
    'http://lblod.data.gift/concepts/8f9367b2-c717-4be7-8833-4c75bbb4ae1f',
  ZONAL: 'http://lblod.data.gift/concepts/c81c6b96-736a-48cf-b003-6f5cc3dbc55d',
  NON_ZONAL:
    'http://lblod.data.gift/concepts/b651931b-923c-477c-8da9-fc7dd841fdcc',
} as const;

export const Z_SIGN_CONCEPT =
  'http://data.lblod.info/road-sign-concepts/68E768F053FC4746C00D7A38';
