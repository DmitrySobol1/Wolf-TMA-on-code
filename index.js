import express from 'express';
import mongoose from 'mongoose';
import UserModel from './models/user.js';
import ReferalPairsModel from './models/referalPairs.js';
import ChangePointToCoinsModel from './models/changePointToCoins.js';
import logAdminActionChangePointToCoinsModel from './models/logAdminActionChangePointToCoins.js';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import { TEXTS } from './texts.js';
import './EnergyRestore/cron.js'; // Импорт планировщика

import https from 'https';
const baseurl = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`;

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log('DB OK'))
  .catch((err) => console.log('db error:', err));

const app = express();

app.use(express.json());
app.use(cors());

app.get('/api', (req, res) => {
  res.send('hello man');
});

// вывод своих рефералов
app.get('/api/getMyReferal', async (req, res) => {
  try {
    const result = await ReferalPairsModel.find({
      referer: req.query.tlgid,
    });

    // const { tlgid } = req.query; // GET-параметры приходят в `req.query`

    return res.json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'ошибка сервера',
    });
  }
});

// вход пользователя в аппку
app.post('/api/enter', async (req, res) => {
  try {
    const user = await UserModel.findOne({ tlgid: req.body.tlgid });

    //тут запустить создание юзера
    // получить инфо из функции createNewUser - что объект создался и вывести на фронт "приветствие" для юзера
    if (!user) {
      await createNewUser(req.body.tlgid, req.body.language);
      return res.json({ result: 'created' });
    }

    // тут извлечь инфо о юзере из БД и передать на фронт
    const { _id, createdAt, updatedAt, ...userData } = user._doc;
    userData.result = 'exist';
    return res.json(userData);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'ошибка сервера',
    });
  }
});

// обновление score
app.post('/api/scoreincrement', async (req, res) => {
  try {
    const updatedUser = await UserModel.findOneAndUpdate(
      { tlgid: req.body.tlgid }, // Условие поиска
      { $inc: { score: 1, energy: -1 } }, // Обновление
      { new: true } // Возвращать обновлённый документ
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: 'some info',
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

// смена языка
app.post('/api/setlanguage', async (req, res) => {
  try {
    const updatedUser = await UserModel.findOneAndUpdate(
      { tlgid: req.body.tlgid }, // Условие поиска
      { $set: { language: req.body.language } }, // Обновление
      { new: true } // Возвращать обновлённый документ
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: 'some info',
      });
    }

    res.json(updatedUser.language); // Возвращаем обновлённый документ
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

// смена уровня
app.post('/api/setuserLevel', async (req, res) => {
  try {
    const updatedUser = await UserModel.findOneAndUpdate(
      { tlgid: req.body.tlgid }, // Условие поиска
      { $set: { userLevel: req.body.userLevel } }, // Обновление
      { new: true } // Возвращать обновлённый документ
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: 'some info',
      });
    }

    res.json(updatedUser.language); // Возвращаем обновлённый документ
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

// сохранить referalPair из бота
app.post('/api/postReferalPair', async (req, res) => {
  try {
    const isExist = await ReferalPairsModel.findOne({
      referer: req.body.father,
      referal: req.body.son,
    });

    if (!isExist) {
      await saveNewReferalPair(
        req.body.father,
        req.body.son,
        req.body.username
      );
      return res.json({ result: 'created' });
    }

    const { _id, createdAt, updatedAt, ...refPair } = isExist._doc;
    return res.json('already exist');
  } catch (err) {
    console.log(err);
    res.status(500).json({
      result: 'exist',
      message: 'ошибка',
      error: err.message, // Добавляем сообщение об ошибке для отладки
    });
  }
});

// TODO: сделать
// +1) новую БД
// +2) сообщение админу
// 3) фронт для админа, с возможностью отмечать

// запрос на обмен монет
app.post('/api/changeRqst', async (req, res) => {
  try {
    const NewRqst = new ChangePointToCoinsModel({
      userid: req.body.tlgid,
      walletAdress: req.body.walletAdress,
      sum: req.body.sum,
      isCoinSentToUserByAdmid: false,
    });

    const rqst = await NewRqst.save();
    sendMessageToAdmin(req.body.tlgid, req.body.walletAdress, req.body.sum);
  } catch (err) {
    console.log(err);
  }
});

async function createNewUser(tlgid, language) {
  try {
    const doc = new UserModel({
      tlgid: tlgid,
      score: 1000,
      energy: 1000,
      userLevel: 1,
      isSentWalletAdress: false,
      language: language,
      referalQty: 0,
    });

    const user = await doc.save();
  } catch (err) {
    console.log(err);
  }
}

async function saveNewReferalPair(father, son, username) {
  try {
    // добавление пары в refPairs
    const pair = new ReferalPairsModel({
      referer: father,
      referal: son,
      referalNameFull: username,
    });

    const newPair = await pair.save();

    // КОРРЕКТ +500 баллов за реферала и +1 к количеству рефералов
    const updatedUser = await UserModel.findOneAndUpdate(
      { tlgid: father }, // Условие поиска
      { $inc: { score: 500, referalQty: 1 } }, // Обновление
      { new: true } // Возвращать обновлённый документ
    );

    const referalQty = updatedUser.referalQty;
    const language = updatedUser.language;

    // если =10 рефералов, то назначаем уровень 2
    if (referalQty == 10) {
      const level = 2;
      const updatedUser = await UserModel.findOneAndUpdate(
        { tlgid: father }, // Условие поиска
        { $set: { userLevel: level } }, // Обновление
        { new: true } // Возвращать обновлённый документ
      );
      sendTlgMessage(father, level, language);
    }
  } catch (err) {
    console.log(err);
  }
}

function sendTlgMessage(father, level, language) {
  const sendingText = TEXTS[language].text;
  const params = `?chat_id=${father}&text=${sendingText} ${level}`;
  const url = baseurl + params;

  https
    .get(url, (response) => {
      let data = '';

      // Получаем данные частями
      // response.on('data', (chunk) => {
      //   data += chunk;
      // });

      // Когда запрос завершён
      response.on('end', () => {
        console.log(JSON.parse(data)); // Выводим результат
      });
    })
    .on('error', (err) => {
      console.error('Ошибка:', err);
    });
}

function sendMessageToAdmin(userid, walletAdress, sum) {
  const sendingText = `Запрос на обмен монет:%0Auser: ${userid} %0A${walletAdress} %0Aсумма: ${sum}`;
  const params = `?chat_id=${process.env.ADMIN_TLGID}&text=${sendingText}`;
  const url = baseurl + params;

  https
    .get(url, (response) => {
      let data = '';

      // Когда запрос завершён
      response.on('end', () => {
        console.log(JSON.parse(data)); // Выводим результат
      });
    })
    .on('error', (err) => {
      console.error('Ошибка:', err);
    });
}

function sendMessageToUser(userid) {
  const sendingText = 'На ваш кошелек зачиcлены монеты';
  const params = `?chat_id=${userid}&text=${sendingText}`;
  const url = baseurl + params;

  https
    .get(url, (response) => {
      let data = '';

      // Когда запрос завершён
      response.on('end', () => {
        console.log(JSON.parse(data)); // Выводим результат
      });
    })
    .on('error', (err) => {
      console.error('Ошибка:', err);
    });
}

app.listen(4444, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log('server has been started');
});

// TODO: настроить, чтобы только админ мог данный запрос слать
// юзер из массива юзеров

// админ - показать всех пользователей
app.get('/api/getAllUsers', async (req, res) => {
  try {
    const result = await UserModel.find().sort({ score: -1 });

    return res.json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'ошибка сервера',
    });
  }
});

// админ - показать все запросы на обмен
app.get('/api/getAllChangeRqst', async (req, res) => {
  try {
    const result = await ChangePointToCoinsModel.find({
      isCoinSentToUserByAdmid: false,
    });

    return res.json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'ошибка сервера',
    });
  }
});

// логирование админа - обмен монет завершен
app.post('/api/logChanging', async (req, res) => {
  try {
    const NewRqst = new logAdminActionChangePointToCoinsModel({
      rqstnumber: req.body.rqstId,
      usertlg: req.body.userId,
      sum: req.body.summa,
    });

    const rqst = await NewRqst.save();
    // return res.json('ok');

    const updatedUser = await UserModel.findOneAndUpdate(
      { tlgid: req.body.userId },
      { $inc: { score: -req.body.summa } }
      // { new: true }
    );

    const updatedStatus = await ChangePointToCoinsModel.findOneAndUpdate(
      { _id: req.body.rqstId },
      { isCoinSentToUserByAdmid: true }
      // { new: true }
    );

    sendMessageToUser(req.body.userId);

    return res.json('succes');
    // if (!updatedUser) {
    //   return res.status(404).json({
    //     message: 'some info',
    //   });
    // }
  } catch (err) {
    console.log(err);
    return res.json('not succes');
  }
});
