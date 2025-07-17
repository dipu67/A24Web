import React from 'react'
import Tryping  from '@/components/typing'
import bot from '@/lib/tgbot/bot'
import { aiClient } from '@/lib/gemini/ai'

bot.on('message', async (msg) => {
  const chatId = msg.chat.id
const mg= await bot.sendMessage(chatId, 'Writing...')

  const res = await resAi(msg.text)
  if (!res) {
    bot.sendMessage(chatId, 'Sorry, I could not process your request.')
    return
  }
 if(msg.text){
   if (res) {
    bot.deleteMessage(chatId, mg.message_id)
    bot.sendMessage(chatId, res.text || 'No response from AI.')
  }
  
 }
})
async function resAi(data: any) {
  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: data,
      
    })
    return response
    
  } catch (error) {
    console.error('Error fetching AI response:', error)
  }
}

console.log("Telegram bot is running...");

export default function Home() {
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">Welcome to A24</h1>
      <Tryping />
      
    </div>
  )
}
