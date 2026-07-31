const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');

const app = express();
const port = process.env.PORT || 10000;

const token = '8818468854:AAEsiqfgCUgP2PgNdKPJywUnePSkmYwo-2g';
const ADMIN_ID = 7838760702; // ⚠️ ЗАМЕНИ НА СВОЙ ЦИФРОВОЙ ТГ ID!

const bot = new TelegramBot(token, { polling: true });
let memoryUsers = {};

app.use(express.json());
app.use(express.static(__dirname));

// КНОПКА СТАРТА И МЕНЮ БОТА
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `👋 Привет! Добро пожаловать в наше NFT казино!\n\nИспользуй кнопку Меню, чтобы открыть игры.`, {
    reply_markup: {
      inline_keyboard: [[{ text: "🎮 Играть (Mini App)", web_app: { url: `https://${process.env.RENDER_EXTERNAL_HOSTNAME}` } }]]
    }
  });
});

// АДМИН ПАНЕЛЬ
bot.onText(/\/admin/, (msg) => {
  if (msg.from.id !== ADMIN_ID) return;
  bot.sendMessage(msg.chat.id, "🛠 Админка:\n\n/give ID СУММА — выдать баланс\n/msg ТЕКСТ — рассылка");
});

// ОБРАБОТКА ПОПОЛНЕНИЯ ИЗ MINI APP
bot.on('web_app_data', async (msg) => {
  const chatId = msg.chat.id;
  try {
    const data = JSON.parse(msg.web_app_data.data);
    if (data.action === 'deposit') {
      bot.sendInvoice(chatId, "Пополнение баланса", `Покупка ${data.amount} Stars`, "payload", "", "XTR", [{ label: "Оплата", amount: data.amount }]);
    }
  } catch (e) {
    console.log("Ошибка парсинга WebApp данных");
  }
});

bot.on('successful_payment', (msg) => {
  const chatId = msg.chat.id;
  const amount = msg.successful_payment.total_amount;
  if(!memoryUsers[chatId]) memoryUsers[chatId] = { balance: 0 };
  memoryUsers[chatId].balance += amount;
  bot.sendMessage(chatId, `🎉 Баланс успешно пополнен на +${amount} Stars!`);
});

// API ДЛЯ САЙТА
app.get('/api/user/:id', (req, res) => {
  const id = req.params.id;
  if (!memoryUsers[id]) memoryUsers[id] = { balance: 500 };
  res.json(memoryUsers[id]);
});

app.listen(port, () => console.log(`Server started on port ${port}`));
 
