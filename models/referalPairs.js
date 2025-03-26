import mongoose from 'mongoose';

const ReferalPairsSchema = new mongoose.Schema(
  {
    referer: {
      type: Number,
      required: true,
    },
    referal: {
      type: Number,
      required: true,
    },
    referalNameForFront: String,
    referalNameFull: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('ReferalPairs', ReferalPairsSchema);
