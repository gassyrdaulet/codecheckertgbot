import TelegramApi from "node-telegram-bot-api";
import mysql from "mysql2/promise";
import config from "config";
import dotenv from "dotenv";
import { buyOptions, defaultMenu } from "./keyboards/KeyboardOptions.js";
import Moment from "moment";

dotenv.config();
const { dbConfig, dbConfigProd } = config.get("dbConfig");
const { PRODUCTION, BOT_TOKEN } = process.env;

export const bot = new TelegramApi(BOT_TOKEN, { polling: true });

const start = async () => {
  bot.on("message", async (msg) => {
    bot.setMyCommands(defaultMenu);
    const chatId = msg.chat.id;
    const fromWho = msg.from.id;
    const text = msg.text;

    if (text === "/start" && !msg.reply_to_message) {
      await bot.sendMessage(
        chatId,
        "Введите Идентификационный номер Вашего Аккаунта: "
      );
      bot.once("message", async (msg2) => {
        const chatId = msg2.chat.id;
        const fromWho = msg2.from.id;
        const text = msg2.text;
        if (text === "/start" || text === "/info") {
          return;
        }
        try {
          const conn = await mysql.createConnection(
            PRODUCTION === "0" ? dbConfig : dbConfigProd
          );
          const sql1 = "SELECT * FROM users WHERE ?";
          const candidate = (await conn.query(sql1, { uid: text }))[0][0];
          if (!candidate) {
            await bot.sendMessage(
              chatId,
              "Произошла ошибка! - " +
                "Пользователя с таким Ид. номером не существует! Выберите /start и попробуйте снова."
            );
            return;
          }
          const sql2 = "SELECT uid, store_name, premium FROM stores WHERE ?";
          const storeInfo = (
            await conn.query(sql2, { uid: candidate.store })
          )[0][0];
          await bot.sendMessage(
            chatId,
            `🏪 Магазин: ${storeInfo.store_name}\n\n🆔 UID магазина: ${
              storeInfo.uid
            }\n\n⭐ Premium: ${
              storeInfo.premium === "0" ? "Не оплачен." : "Активен."
            }\n\n📅 Действует до: ${Moment(parseInt(candidate.adate)).format(
              "YYYY.DD.MM , HH:mm"
            )}`,
            storeInfo.premium === "1" ? buyOptions : {}
          );
          conn.end();
        } catch (e) {
          await bot.sendMessage(chatId, "Произошла ошибка! - " + e);
        }
      });
      return;
    }
    if (text === "Hi" && !msg.reply_to_message) {
      await bot.sendMessage(chatId, "How are you?");
      return;
    }

    if (text === "/info" && !msg.reply_to_message) {
      await bot.sendMessage(
        chatId,

        `1. Как зарегистрироваться в CodeChecker?

      1) Скачайте приложение (пока доступно только для Android);
  https://play.google.com/store/apps/details?id=com.gassyrdaulet.codechecker
      2) На странице авторизации нажмите "Зарегистрироваться";
      3) Заполните Все необходимые поля и нажмите "Зарегистрироваться".
  
  
  2. Как настроить приложение?
  
      1) Зайдите в свой аккаунт;
      2) Нажмите посередине на "Мой Магазин";
      3) Ниже есть кнопка "Редактировать магазин", нажмите на неё;
      4) В поле "API-токен" введите свой токен из Кабинета Продавца; https://kaspi.kz/mc/#/settings
  (Доступно в "Кабинет Продавца -> Настройки -> Токен  API").
  


  3. Как поделиться доступом к Вашему Магазину?

  1) Узнайте Идентификационный номер человека которому Вы хотели бы предоставить доступ (он тоже должен быть зарегистрирован в CodeChecker). Этот номер можно увидеть в приложении во вкладке "Настройки";
  2) В приложении зайдите в "Мой Магазин -> Список пользователей магазина -> Добавить пользователя";
  3) Введите Ид. номер и нажмите "Добавить".


  
  4. Как удалить пользователя из списка доступов к Вашему Магазину?

    1) В приложении зайдите в "Мой Магазин -> Список пользователей магазина";
    2) Появится список пользователей с их именами и номерами;
    3) Возле соответствующего пользователя нажмите на крестик и подтвердите удаление.
    
    
    
  5. Как отправить и подтвердить код заказа?

    1) В приложении, во вкладке "Главная" нажмите на Магазин;
    2) Далее вам покажется список активных магазинов;
    3) Выберите один и далее выйдут все активные заказы;
    4) Возле соответствующего заказа нажмите на кнопку "Выслать код";
    5) После принятия кода нажмите на "Проверить" и проверьте код.
    
    
    
  6. Как купить премиум доступ к CodeChecker?

    1) Очень просто. Зайдите в приложении:
 "Мой Магазин -> Купить Premium".`
      );
    }
  });

  bot.on("callback_query", async (msg) => {
    const chatId = msg.message.chat.id;
    const fromWho = msg.message.from.id;
    const queryId = msg.id;
    const text = msg.message.text;
    const data = msg.data;
    if (data === "require payment") {
      await bot.answerCallbackQuery(msg.id, { text: "Payment Requested" });
      return;
    }
  });
};

try {
  start();
} catch (e) {
  console.log(e);
}
