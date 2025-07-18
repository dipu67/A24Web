import React from "react";
import Tryping from "@/components/typing";
import bot from "@/lib/tgbot/bot";
import { aiClient } from "@/lib/gemini/ai";
import { Modality } from "@google/genai";
import fs from "fs";
import { Readable } from "stream";

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;

  if (msg.text && msg.text.startsWith("/image")) {
    const mg = await bot.sendMessage(chatId, "Generate Image...");
    
    const res = await image(msg.text);
    if (!res || !res.buffer || res.buffer.length === 0) {
      bot.sendMessage(chatId, "Sorry, I could not process your request.");
      return;
    }
    const [buffer] = res.buffer; // Assuming the first buffer is the image
    const [text] = res.text; // Assuming the first text is the caption


    bot.deleteMessage(chatId, mg.message_id);
    bot.sendPhoto(
      chatId,
      buffer,
      {
        caption: text || "Here is your image:",
      },
      { contentType: "image/png", filename: `a24_image-${Date.now()}.png` }
    );
  } else if (msg.text && msg.text.startsWith("/video")) {
    const mg = await bot.sendMessage(chatId, "Generate Video...");
    const res = await video(msg.text);

    if (!res!) {
      bot.sendMessage(chatId, "Sorry, I could not process your request.");
      return;
    }

    bot.deleteMessage(chatId, mg.message_id);
    bot.sendVideo(
      chatId,
      res,
      {
        caption: "Here is your video:",
      },
      { contentType: "video/mp4", filename: res }
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

async function image(data: any): Promise<any> {
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
    const texts: string[] = [];
    const buffers: Buffer[] = [];

    for (const part of parts) {
      // Based on the part type, either show the text or save the image
      if (part.text) {
        texts.push(part.text);
      } else if (part.inlineData) {
        const imageData = part.inlineData.data;
        const buffer = Buffer.from(imageData!, "base64");
        buffers.push(buffer);
        // Return the file name or path for further processing
      }
    }
    return { text: texts, buffer: buffers }; // Return the text and image buffer
  } catch (error) {
    console.error("Error fetching AI image:", error);
  }
}

async function video(data: any) {
  let operation = await aiClient.models.generateVideos({
    model: "veo-3.0-generate-preview",
    prompt: data,
    config: {
      personGeneration: "allow_all",
      aspectRatio: "16:9",
    },
  });

  while (!operation.done) {
    await new Promise((resolve) => setTimeout(resolve, 10000));
    operation = await aiClient.operations.getVideosOperation({
      operation: operation,
    });
  }

  operation.response?.generatedVideos?.forEach(async (generatedVideo, n) => {
    const resp = await fetch(
      `${generatedVideo.video?.uri}${process.env.GOOGLE_GENAI_API_KEY}`
    ); // append your API key
    const writer = fs.createWriteStream(`video${n}.mp4`);
    Readable.fromWeb(resp.body).pipe(writer);
    writer.on("finish", () => {
      console.log(`Video ${n} downloaded successfully.`);
    });

    return `video${n}.mp4`; // Return the file name or path for further processing
  });
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
