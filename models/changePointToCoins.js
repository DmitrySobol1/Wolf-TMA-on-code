import mongoose from 'mongoose';

const ChangePointToCoinsSchema = new mongoose.Schema(
  {
    userid: {
      type: Number,
      required: true,
    },
    walletAdress: {
      type: String,
      required: true,
    },
    sum: {
      type: Number,
      required: true,
    },
    isCoinSentToUserByAdmid: Boolean,
    remarks: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('ChangePointToCoins', ChangePointToCoinsSchema);
