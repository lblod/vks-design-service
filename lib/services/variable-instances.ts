import type z from 'zod';
import type { variableInstanceSchema } from '../schemas/variable-instance';

type Args = {
  measureDesignUri: string;
  trafficSignalUris: string[];
  measureConceptUri: string;
};

const VariableInstancesService = {
  getVariableInstances: async ({
    measureDesignUri,
    trafficSignalUris,
    measureConceptUri,
  }: Args) => {
    const result: z.infer<typeof variableInstanceSchema>[] = [];
    return result;
  },
};
export default VariableInstancesService;
