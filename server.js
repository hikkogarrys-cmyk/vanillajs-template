const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');

const app = express();
const port = process.env.PORT || 10000;

const token = '8818468854:AAG_BjNvYddzVo-uD94F8E7fO_ZiRwG6yYY';
const bot = new TelegramBot(token, { polling: true });

app.use(express.json());
// Отдаем файлы напрямую из папки dist
app.use(express.static(path.join(__dirname, 'dist')));

let users = {}; 

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  if (!users[chatId]) users[chatId] = { balance: 1000, inventory: [] };

  bot.sendMessage(chatId, `👋 Привет! Добро пожаловать в NFT Stars Casino!\n💰 Твой баланс: ${users[chatId].balance} Stars.`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🎮 Открыть Игры (Mini App)", web_app: { url: `https://${process.env.RENDER_EXTERNAL_HOSTNAME}` } }],
        [{ text: "⚡ Пополнить на 50 Stars", callback_data: "buy_50" }]
      ]
    }
  });
});

// Отдача живого баланса на сайт
app.get('/api/user/:id', (req, res) => {
  const id = req.params.id;
  if (!users[id]) users[id] = { balance: 1000, inventory: [] };
  res.json(users[id]);
});

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
