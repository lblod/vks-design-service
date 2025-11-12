import type z from 'zod';
import type { variableInstanceSchema } from '../schemas/variable-instance.ts';

type Args = {
  measureDesignUri: string;
  trafficSignalUris: string[];
  measureConceptUri: string;
};

const VariableInstancesService = {
  getVariableInstances: async ({
    measureDesignUri: _,
    trafficSignalUris: __,
    measureConceptUri: ___,
  }: Args) => {
    const result: z.infer<typeof variableInstanceSchema>[] = [];
    return result;
  },
};
export default VariableInstancesService;
