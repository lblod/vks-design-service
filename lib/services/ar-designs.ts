import { getARDesigns, type ArDesignsQueryOpts } from '../db/ar-designs';

const ARDesignsService = {
  getARDesigns: async (opts: ArDesignsQueryOpts) => {
    return getARDesigns(opts);
  },
};

export default ARDesignsService;
