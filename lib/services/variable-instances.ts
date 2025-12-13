import type z from 'zod';
import type { variableInstanceSchema } from '../schemas/variable-instance.ts';
import type { MeasureConcept } from '../schemas/measure-concept.ts';
import { uuid } from 'mu';
import { getVariables } from '../db/variables.ts';

type Args = {
  measureConcept: MeasureConcept;
};

const VariableInstancesService = {
  getVariableInstances: async ({ measureConcept }: Args) => {
    const templateVariables = await getVariables({
      uris: measureConcept.variables,
    });
    const result: z.infer<typeof variableInstanceSchema>[] = [];
    for (const templateVariable of templateVariables) {
      const id = uuid();
      const uri = `http://data.lblod.info/variable-instances/${id}`;
      result.push({
        uri,
        id,
        variable: templateVariable,
      });
    }
    return result;
  },
};
export default VariableInstancesService;
