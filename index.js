import express from 'express';
import mongoose from 'mongoose';
import UserModel from './models/user.js';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();



mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log('DB OK'))
  .catch((err) => console.log('db error:', err));

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('hello man');
});


// вход пользователя в аппку
app.post('/enter', async (req, res) => {
  try {
        const user = await UserModel.findOne({ tlgid: req.body.tlgid });

        //тут запустить создание юзера
        // получить инфо из функции createNewUser - что объект создался и вывести на фронт "приветствие" для юзера
        if (!user) {
        await createNewUser(req.body.tlgid);
        return res.json({ msg: 'создаю юзера' });
        }

        // тут извлечь инфо о юзере из БД и передать на фронт
        const {_id,createdAt,updatedAt, ...userData} = user._doc
        return res.json(userData);

  } catch (err) {
        console.log(err);
        res.status(500).json({
        message: 'ошибка сервера',
    });
  }
});




// обновление score
app.post('/scoreincrement', async (req, res) => {
    try {
        const updatedUser = await UserModel.findOneAndUpdate(
            { tlgid: req.body.tlgid }, // Условие поиска
            { $inc: { score: 1 } },    // Обновление
            { new: true }              // Возвращать обновлённый документ
        );

        if (!updatedUser) {
            return res.status(404).json({
                message: 'Пользователь не найден',
            });
        }

        res.json(updatedUser.score); // Возвращаем обновлённый документ
        // res.json('added'); // Возвращаем обновлённый документ
        // res.json(user._doc)

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Ошибка сервера',
            error: err.message, // Добавляем сообщение об ошибке для отладки
        });
    }
});





async function createNewUser(tlgid) {
  try {
    const doc = new UserModel({
      tlgid: tlgid,
      score: 1000,
      energy: 1000,
      userLevel: 1,
      isSentWalletAdress: false,
      language: 'ru',
    });

    const user = await doc.save();
    
  } catch (err) {
    console.log(err);
  }
}




app.listen(4444, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log('server has been started');
});
