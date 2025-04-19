import mongoose from 'mongoose';

const LogAdminActionChangePointToCoinsSchema = new mongoose.Schema(
  {
    rqstnumber: {
      type: String,
      required: true,
    },
    usertlg: {
      type: Number,
      required: true,
    },
    sum: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  'LogAdminActionChangePointToCoins',
  LogAdminActionChangePointToCoinsSchema
);
