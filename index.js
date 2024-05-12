require('dotenv').config();
const { Bot } = require('grammy');

// Создаем экземпляр бота с токеном, полученным от BotFather
const bot = new Bot(process.env.BOT_API_KEY);

// Обработчик команды /start
bot.command('start', async (ctx) => {
  await ctx.reply('Привет, я бот для отправки домашних заданий 🤖');
});

// Функция для проверки, является ли сообщение командой
function isCommand(message) {
  return (
    message.entities &&
    message.entities.some((entity) => entity.type === 'bot_command')
  );
}

// Обработчик текстовых сообщений
bot.on('message', async (ctx) => {
  if (!isCommand(ctx.message)) {
    try {
      // Проверяем, есть ли у сообщения подпись
      const caption = ctx.message.caption || '';
      const text = ctx.message.text;

      const firstName = ctx.update.message.from.first_name;
      const lastName = ctx.update.message.from.last_name || 'Муравкин';
      const link = ctx.update.message.from.username;

      const message = `<b><a href='https://t.me/${link}'>${firstName} ${lastName}</a></b>\n\n`;

      // Пересылаем сообщение в группу в зависимости от его типа
      if (text) {
        // Пересылаем текстовое сообщение
        await ctx.api.sendMessage(process.env.targetGroupId, message + text, {
          parse_mode: 'HTML',
        });
      } else if (ctx.message.photo) {
        // Пересылаем фото с подписью, если она есть

        await ctx.api.sendPhoto(
          process.env.targetGroupId,
          ctx.message.photo[ctx.message.photo.length - 1].file_id,
          { caption: message + caption, parse_mode: 'HTML' }
        );
      } else if (ctx.message.document) {
        // Пересылаем документ с подписью, если она есть
        await ctx.api.sendDocument(
          process.env.targetGroupId,
          ctx.message.document.file_id,
          {
            caption: message + caption,
            parse_mode: 'HTML',
          }
        );
      } else {
        // Для других типов сообщений используем метод forwardMessage
        await ctx.forwardMessage(process.env.targetGroupId);
      }

      // Отправляем подтверждение пользователю
      await ctx.reply('Сообщение было переслано в группу.');
    } catch (error) {
      console.error('Ошибка:', error);
      await ctx.reply('Произошла ошибка при пересылке сообщения.');
    }
  }
});

// Запускаем бота
bot.start();
