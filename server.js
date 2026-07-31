const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const port = process.env.PORT || 10000;

const token = process.env.BOT_TOKEN || '8818468854:AAG_BjNvYddzVo-uD94F8E7fO_ZiRwG6yYY';
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/casino'; 
const ADMIN_ID = 111111111; // ПОДСТАВЬ СВОЙ ID ИЗ ТГ!

const bot = new TelegramBot(token, { polling: true });
let db;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

async function initDb() {
  try {
    const client = new MongoClient(mongoUri);
    await client.connect();
    db = client.db('casino_database');
    console.log('🚀 Успешно подключено к базе данных MongoDB!');
  } catch (err) {
    console.error('❌ Ошибка подключения к MongoDB:', err);
  }
}
initDb();

const caseItems = [
  { id: 1, name: 'Cyber Punk Duck', type: 'common', img: 'https://postimg.cc' },
  { id: 2, name: 'Diamond Star NFT', type: 'rare', img: 'https://postimg.cc' },
  { id: 3, name: 'Golden Rolex NFT', type: 'epic', img: 'https://postimg.cc' },
  { id: 4, name: 'TON Crypto King', type: 'legendary', img: 'https://postimg.cc' }
];

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username || msg.from.first_name;

  let user = await db.collection('users').findOne({ _id: chatId });
  if (!user) {
    user = { _id: chatId, username, balance: 200, inventory: [] };
    await db.collection('users').insertOne(user);
  }

  bot.sendMessage(chatId, `✨ Добро пожаловать в премиальный NFT Stars Club, @${username}!\n\n💰 Твой balance сохранен: ${user.balance} Stars.`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🎮 Открыть Кейсы (Glass NFT App)", web_app: { url: `https://${process.env.RENDER_EXTERNAL_HOSTNAME}` } }],
        [{ text: "💎 Купить 100 Stars (Оплата ТГ)", callback_data: "deposit_100" }]
      ]
    }
  });
});

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  if (query.data === 'deposit_100') {
    await bot.sendInvoice(
      chatId, "Пополнение баланса", "Покупка 100 игровых Stars для открытия NFT кейсов", 
      "stars_payload", "", "XTR", [{ label: "100 Stars", amount: 100 }]
    );
  }
});

bot.on('successful_payment', async (msg) => {
  const chatId = msg.chat.id;
  const amount = msg.successful_payment.total_amount;
  await db.collection('users').updateOne({ _id: chatId }, { $inc: { balance: amount } });
  bot.sendMessage(chatId, `🎉 Отлично! Реальный платеж получен. Вам начислено +${amount} Stars в базу данных.`);
});

bot.onText(/\/admin/, (msg) => {
  if (msg.from.id !== ADMIN_ID) return;
  bot.sendMessage(msg.chat.id, "🛠 Мощная Админ-Панель сервера:", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📢 Сделать рассылку по всей базе", callback_data: "adm_news" }],
        [{ text: "🎁 Выдать 1,000 Stars всем игрокам", callback_data: "adm_gift_all" }]
      ]
    }
  });
});

bot.on('callback_query', async (query) => {
  if (query.from.id !== ADMIN_ID) return;
  if (query.data === 'adm_gift_all') {
    await db.collection('users').updateMany({}, { $inc: { balance: 1000 } });
    bot.answerCallbackQuery(query.id, { text: "1000 Stars успешно начислены всем пользователям из MongoDB!" });
  }
});

app.get('/api/user/:id', async (req, res) => {
  const userId = parseInt(req.params.id);
  let user = await db.collection('users').findOne({ _id: userId });
  if (!user) user = { _id: userId, balance: 0, inventory: [] };
  res.json(user);
});

app.post('/api/spin', async (req, res) => {
  const { userId } = req.body;
  const user = await db.collection('users').findOne({ _id: parseInt(userId) });
  if (!user || user.balance < 100) return res.status(400).json({ error: "Недостаточно Stars!" });
  
  const randomIndex = Math.floor(Math.random() * caseItems.length);
  const prize = caseItems[randomIndex];
  
  await db.collection('users').updateOne(
    { _id: parseInt(userId) },
    { 
      $inc: { balance: -100 },
      $push: { inventory: { id: Date.now(), name: prize.name, type: prize.type, img: prize.img } }
    }
  );
  res.json({ prize, index: randomIndex });
});

app.listen(port, () => console.log(`Casino Core Server active on port ${port}`));

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username || msg.from.first_name;

  let user = await db.collection('users').findOne({ _id: chatId });
  if (!user) {
    user = { _id: chatId, username, balance: 200, inventory: [] };
    await db.collection('users').insertOne(user);
  }

  bot.sendMessage(chatId, `✨ Добро пожаловать в премиальный NFT Stars Club, @${username}!\n\n💰 Твой баланс защищен и сохранен: ${user.balance} Stars.`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🎮 Открыть Кейсы (Glass NFT App)", web_app: { url: `https://${process.env.RENDER_EXTERNAL_HOSTNAME}` } }],
        [{ text: "💎 Купить 100 Stars (Оплата ТГ)", callback_data: "deposit_100" }]
      ]
    }
  });
});

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  if (query.data === 'deposit_100') {
    await bot.sendInvoice(
      chatId, "Пополнение баланса", "Покупка 100 игровых Stars для открытия NFT кейсов", 
      "stars_payload", "", "XTR", [{ label: "100 Stars", amount: 100 }]
    );
  }
});

bot.on('successful_payment', async (msg) => {
  const chatId = msg.chat.id;
  const amount = msg.successful_payment.total_amount;
  await db.collection('users').updateOne({ _id: chatId }, { $inc: { balance: amount } });
  bot.sendMessage(chatId, `🎉 Отлично! Реальный платеж получен. Вам начислено +${amount} Stars в базу данных.`);
});

bot.onText(/\/admin/, (msg) => {
  if (msg.from.id !== ADMIN_ID) return;
  bot.sendMessage(msg.chat.id, "🛠 Мощная Админ-Панель сервера:", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📢 Сделать рассылку по всей базе", callback_data: "adm_news" }],
        [{ text: "🎁 Выдать 1,000 Stars всем игрокам", callback_data: "adm_gift_all" }]
      ]
    }
  });
});

bot.on('callback_query', async (query) => {
  if (query.from.id !== ADMIN_ID) return;
  if (query.data === 'adm_gift_all') {
    await db.collection('users').updateMany({}, { $inc: { balance: 1000 } });
    bot.answerCallbackQuery(query.id, { text: "1000 Stars успешно начислены всем пользователям из MongoDB!" });
  }
});

app.get('/api/user/:id', async (req, res) => {
  const userId = parseInt(req.params.id);
  let user = await db.collection('users').findOne({ _id: userId });
  if (!user) user = { _id: userId, balance: 0, inventory: [] };
  res.json(user);
});

app.post('/api/spin', async (req, res) => {
  const { userId } = req.body;
  const user = await db.collection('users').findOne({ _id: parseInt(userId) });
  if (!user || user.balance < 100) return res.status(400).json({ error: "Недостаточно Stars!" });
  
  const randomIndex = Math.floor(Math.random() * caseItems.length);
  const prize = caseItems[randomIndex];
  
  await db.collection('users').updateOne(
    { _id: parseInt(userId) },
    { 
      $inc: { balance: -100 },
      $push: { inventory: { id: Date.now(), name: prize.name, type: prize.type, img: prize.img } }
    }
  );
  res.json({ prize, index: randomIndex });
});

app.listen(port, () => console.log(`Casino Core Server active on port ${port}`));

app.listen(port, () => console.log(`Server running on port ${port}`));
  const chatId = query.message.chat.id;
  if (query.data === 'buy_50') {
    bot.sendInvoice(
      chatId, "Пополнение баланса", "Покупка 50 игровых Stars", "payload_stars", "", "XTR", 
      [{ label: "50 Stars", amount: 50 }]
    );
  }
});

// Подтверждение успешного платежа
bot.on('successful_payment', (msg) => {
  const chatId = msg.chat.id;
  const amount = msg.successful_payment.total_amount;
  if (!users[chatId]) users[chatId] = { balance: 0, inventory: [] };
  users[chatId].balance += amount;
  bot.sendMessage(chatId, `🎉 Оплата прошла! Вам начислено ${amount} игровых Stars!`);
});

// 2. АДМИН ПАНЕЛЬ В ТЕЛЕГРАМЕ
bot.onText(/\/admin/, (msg) => {
  if (msg.from.id !== ADMIN_ID) return;
  bot.sendMessage(msg.chat.id, "🛠 Добро пожаловать в Админку!", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📢 Сделать рассылку", callback_data: "adm_broadcast" }],
        [{ text: "💰 Раздать всем по 500 Stars", callback_data: "adm_give_money" }]
      ]
    }
  });
});

bot.on('callback_query', (query) => {
  if (query.from.id !== ADMIN_ID) return;
  if (query.data === 'adm_give_money') {
    Object.keys(users).forEach(id => users[id].balance += 500);
    bot.answerCallbackQuery(query.id, { text: "Всем успешно начислено по 500 Stars!" });
  }
});

// 3. API ДЛЯ САЙТА (ИГРЫ И БАЛАНС)
app.get('/api/user/:id', (req, requireRes) => {
  const id = req.params.id;
  if (!users[id]) users[id] = { balance: 100, inventory: [] };
  requireRes.json(users[id]);
});

// Игра Мины (Серверная проверка)
app.post('/api/games/mines', (req, res) => {
  const { userId, bet, countMines } = req.body;
  if (!users[userId] || users[userId].balance < bet) return res.status(400).json({ error: "Нет денег" });
  
  users[userId].balance -= bet;
  // Логика: генерация поля 5х5 с минами
  let field = Array(25).fill(false);
  let placed = 0;
  while(placed < countMines) {
    let idx = Math.floor(Math.random() * 25);
    if (!field[idx]) { field[idx] = true; placed++; }
  }
  res.json({ newBalance: users[userId].balance, field });
});

app.listen(port, () => console.log(`Casino backend listening on port ${port}`));
