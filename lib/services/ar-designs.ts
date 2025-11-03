import { getARDesigns } from '../db/ar-designs';
import { type GetQueryOpts } from '../db/schema-query';

const ARDesignsService = {
  getARDesigns: async (opts: GetQueryOpts = {}) => {
    return getARDesigns(opts);
  },
};

export default ARDesignsService;
