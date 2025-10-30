import z from 'zod';
import { TRAFFIC_SIGNAL_CONCEPT_TYPES } from '../routes/measure-designs/measure-concept';

export const trafficSignalConceptSchema = z.strictObject({
  uri: z.string(),
  id: z.string(),
  meaning: z.string(),
  code: z.string(),
  type: z.literal([
    TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_SIGN,
    TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_MARKING,
    TRAFFIC_SIGNAL_CONCEPT_TYPES.TRAFFIC_LIGHT,
  ]),
});
