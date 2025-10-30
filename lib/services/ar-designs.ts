import { getARDesigns } from '../db/ar-designs';

const ARDesignsService = {
  getARDesigns: async () => {
    return getARDesigns();
  },
};

export default ARDesignsService;
