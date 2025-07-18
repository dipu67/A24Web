import React from "react";
import Tryping from "@/components/typing";
import bot from "@/lib/tgbot/bot";
import { aiClient } from "@/lib/gemini/ai";
import { Modality } from "@google/genai";
import fs from "fs";

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;

  if (msg.text && msg.text.startsWith("/image")) {
    const mg = await bot.sendMessage(chatId, "Generate Image...");
    const res = await image(msg.text);

    if (!res!) {
      bot.sendMessage(chatId, "Sorry, I could not process your request.");
      return;
    }

    bot.deleteMessage(chatId, mg.message_id);
    bot.sendPhoto(
      chatId,
      res,
      {
        caption: "Here is your image:",
      },
      { contentType: "image/png" ,
        filename: res
      }
    );
  } else {
    const mg = await bot.sendMessage(chatId, "Writing...");
    const res = await resAi(msg.text);

    if (!res!) {
      bot.sendMessage(chatId, "Sorry, I could not process your request.");
      return;
    }

    bot.deleteMessage(chatId, mg.message_id);
    bot.sendMessage(chatId, res.text!);
  }
});
async function resAi(data: any) {
  try {
    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: data,
    });
    return response;
  } catch (error) {
    console.error("Error fetching AI response:", error);
  }
}

async function image(data: any) {
  try {
    // Set responseModalities to include "Image" so the model can generate  an image
    const response = await aiClient.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: data,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });
    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("No candidates returned from AI model.");
    }
    const parts = response.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      // Based on the part type, either show the text or save the image
      if (part.text) {
        console.log(part.text);
      } else if (part.inlineData) {
        const imageData = part.inlineData.data;
        const buffer = Buffer.from(imageData!, "base64");
        const fileName = `a24_image-${Date.now()}.png`;
        fs.writeFileSync(fileName, buffer);

        return fileName; // Return the file name or path for further processing
      }
    }
  } catch (error) {
    console.error("Error fetching AI image:", error);
  }
}

console.log("Telegram bot is running...");

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">Welcome to A24</h1>
      <Tryping />
    </div>
  );
}
