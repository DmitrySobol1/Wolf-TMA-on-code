import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    tlgid: {
      type: Number,
      required: true,
      unique:true
    },
    score: {
      type: Number,
      required: true,
    },
    energy: {
      type: Number,
      required: true,
    },
    userLevel: {
      type: Number,
      required: true,
    },
    referalQty: {
      type: Number,
      required: true,
    },
    walletAdress: String,
    isSentWalletAdress: {
      type: Boolean,
      required: true,
    },
    language: {
        type: String,
        required: true,
      },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model ('User', UserSchema)
