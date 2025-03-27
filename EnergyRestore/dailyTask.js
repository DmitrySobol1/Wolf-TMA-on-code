import UserModel from '../models/user.js';
import mongoose from 'mongoose';

export async function executeDailyTask() {
 
    console.log('Выполняю ежедневные операции...');
    
       await UserModel.updateMany(
        { energy: { $lt: 1000 } }, 
        { $set: { energy: 1000 } }
      );


    return { success: true };
  }