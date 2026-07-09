import { z } from 'zod';
import { jsonApiResourceObject } from '../jsonapi-schema';

export const ROAD_SIGN_CATEGORY_TYPE = 'road-sign-category' as const;
export const roadSignCategorySchema = z.object({
  uri: z.string(),
  label: z.string(),
  id: z.string(),
});

export type RoadSignCategory = z.infer<typeof roadSignCategorySchema>;
export const roadSignCategoryJsonSchema = jsonApiResourceObject({
  type: ROAD_SIGN_CATEGORY_TYPE,
  attributes: roadSignCategorySchema,
  relationships: z.undefined().optional(),
});

export type RoadsignCategoryJson = z.infer<typeof roadSignCategoryJsonSchema>;

export function roadSignCategoryToJson(roadSignCategory: RoadSignCategory) {
  return roadSignCategoryJsonSchema.decode({
    type: ROAD_SIGN_CATEGORY_TYPE,
    id: roadSignCategory.id,
    attributes: {
      label: roadSignCategory.label,
      uri: roadSignCategory.uri,
    },
  });
}
