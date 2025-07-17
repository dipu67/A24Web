import React from 'react'
import Tryping  from '@/components/typing'
import bot from '@/lib/tgbot/bot'
import { aiClient } from '@/lib/gemini/ai'
import {marked} from 'marked'



console.log("Telegram bot is running...");

export default function Home() {
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">Welcome to A24</h1>
      <Tryping />
      
    </div>
  )
}
