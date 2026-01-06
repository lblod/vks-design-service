import { getARDesignById } from '../db/ar-designs';
import { getMeasureConceptByUri } from '../db/measure-concepts';
import { getMeasureDesigns } from '../db/measure-designs';
import { getTrafficSignalConcepts } from '../db/traffic-signal-concepts';
import { getTrafficSignals } from '../db/traffic-signals';
import type { ArDesign } from '../schemas/ar-design';
import type { MeasureDesign } from '../schemas/measure-design';
import { isSome } from '../utils/option';
import VariableInstancesService from './variable-instances';

type Args = {
  administrativeUnit: string;
  arDesignId: string;
};

const MeasureDesignsService = {
  getMeasureDesignsForARDesign: async ({
    arDesignId,
    administrativeUnit,
  }: Args) => {
    const arDesign = (await getARDesignById(arDesignId, administrativeUnit)) as
      | ArDesign
      | undefined;
    if (!arDesign) {
      return;
    }
    const measureDesigns = await getMeasureDesigns({
      uris: arDesign.measureDesigns,
    });
    const measureDesignsResolved: MeasureDesign[] = (
      await Promise.all(
        measureDesigns.map(async (measureDesign) => {
          const measureConceptPromise = getMeasureConceptByUri(
            measureDesign.measureConcept,
          );
          const trafficSignalsPromise = getTrafficSignals({
            uris: measureDesign.trafficSignals as string[],
          });
          const [measureConceptResolved, trafficSignalsResolved] =
            await Promise.all([measureConceptPromise, trafficSignalsPromise]);
          if (!measureConceptResolved) {
            return;
          }

          const usedSignalConceptUris = [
            ...new Set(
              trafficSignalsResolved.map(
                (signal) => signal.trafficSignalConcept.uri,
              ),
            ),
          ];
          const measureSignalConceptUris =
            measureConceptResolved.signalConcepts;
          const unusedSignalConceptUris = measureSignalConceptUris.filter(
            (included) => !usedSignalConceptUris.includes(included),
          );
          const unIncludedSignalConceptUris = usedSignalConceptUris.filter(
            (used) => !measureSignalConceptUris.includes(used),
          );
          // We haven't got the data for signal concepts that have not been used, so fetch that
          const unusedSignalConcepts =
            unusedSignalConceptUris.length > 0
              ? await getTrafficSignalConcepts({
                  uris: unusedSignalConceptUris,
                })
              : [];
          // Signal concepts that are used but not included already have data in the list of traffic
          // signals, so we can find it there to avoid more queries
          const unIncludedSignalConcepts = unIncludedSignalConceptUris
            .map(
              (uri) =>
                trafficSignalsResolved.find(
                  (signal) => signal.trafficSignalConcept.uri === uri,
                )?.trafficSignalConcept,
            )
            .filter(isSome);
          const variableInstances =
            await VariableInstancesService.getVariableInstances({
              measureConcept: measureConceptResolved,
              measureDesign,
            });

          return {
            ...measureDesign,
            measureConcept: measureConceptResolved,
            trafficSignals: trafficSignalsResolved,
            unusedSignalConcepts,
            unIncludedSignalConcepts,
            variableInstances,
          };
        }),
      )
    ).filter(isSome);
    return measureDesignsResolved;
  },
};

export default MeasureDesignsService;
