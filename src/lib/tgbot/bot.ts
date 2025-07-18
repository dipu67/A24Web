import tgbot from 'node-telegram-bot-api'

const bot = new tgbot(process.env.TELEGRAM_BOT_TOKEN!, {polling: true})

export default bot
