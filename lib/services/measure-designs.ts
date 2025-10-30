import { getARDesignById } from '../db/ar-designs';
import { getMeasureConceptByUri } from '../db/measure-concepts';
import { getMeasureDesigns } from '../db/measure-designs';
import { getTrafficSignals } from '../db/traffic-signals';
import type { MeasureDesign } from '../schemas/measure-design';
import VariableInstancesService from './variable-instances';

type Args = {
  arDesignId: string;
};

const MeasureDesignsService = {
  getMeasureDesignsForARDesign: async ({ arDesignId }: Args) => {
    const arDesign = await getARDesignById(arDesignId);
    if (!arDesign) {
      return;
    }
    const measureDesigns = await getMeasureDesigns({
      uris: arDesign.measureDesigns,
    });
    const measureDesignsResolved: MeasureDesign[] = await Promise.all(
      measureDesigns.map(async (measureDesign) => {
        const measureConceptResolved = await getMeasureConceptByUri(
          measureDesign.measureConcept,
        );

        const trafficSignalsResolved = await getTrafficSignals({
          uris: measureDesign.trafficSignals as string[],
        });
        const variableInstances =
          await VariableInstancesService.getVariableInstances({
            measureDesignUri: measureDesign.uri,
            trafficSignalUris: trafficSignalsResolved.map((t) => t.uri),
            measureConceptUri: measureConceptResolved!.uri,
          });
        return {
          ...measureDesign,
          measureConcept: measureConceptResolved!,
          trafficSignals: trafficSignalsResolved,
          variableInstances,
        };
      }),
    );
    return measureDesignsResolved;
  },
};

export default MeasureDesignsService;
