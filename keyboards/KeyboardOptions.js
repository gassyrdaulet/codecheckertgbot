export const deleteMenu = {
  reply_markup: JSON.stringify({
    remove_keyboard: true,
  }),
};

export const forceReply = {
  reply_markup: JSON.stringify({
    force_reply: true,
    input_field_placeholder: "Введите значение...",
  }),
};

export const buyOptions = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{ text: "Оплатить подписку 💰", callback_data: "require payment" }],
    ],
    resize_keyboard: true,
  }),
};
export const defaultMenu = [
  { command: "/start", description: "Запустить бота" },
  {
    command: "/info",
    description: "Получить дополнительную информацию",
  },
];
