
import { GoogleGenAI } from "@google/genai";
import { authService } from "./authService";

/**
 * PnevmoScan AI - Gemini API xizmati.
 * Netlify va boshqa deployment muhitlarida barqaror ishlash uchun optimallashgan.
 */

const LUNG_SYSTEM_INSTRUCTION = `Siz professional radiologsiz. 
O'pka rentgen tasvirini tahlil qiling. 
Xulosani O'ZBEK tilida, Markdown formatida, juda aniq bering.`;

const UZI_SYSTEM_INSTRUCTION = `Siz UZI mutaxassisiz. 
Tasvirni tahlil qilib, organlar holati bo'yicha O'ZBEK tilida xulosa bering.`;

const DIABETES_SYSTEM_INSTRUCTION = `Siz endokrinologsiz. 
Ma'lumotlar asosida diabet xavfini O'ZBEK tilida baholang.`;

async function handleGeminiCall(model: string, contents: any, systemInstruction: string, temp = 0.2): Promise<string> {
  // API Kaliti to'g'ridan-to'g'ri kiritildi (Netlify-da ishlashi uchun)
  const apiKey = 'AIzaSyCX3N54w-SYNzZAzDtI3ahxjkb_qSNBEQ8';

  try {
    // Har gal yangi instance yaratish (eng so'nggi kalitni olish uchun)
    const ai = new GoogleGenAI({ apiKey: apiKey });

    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: temp,
      },
    });

    if (!response || !response.text) {
      throw new Error("AI javob qaytara olmadi (Empty response).");
    }

    return response.text;
  } catch (error: any) {
    console.error("Gemini API Error Details:", error);

    // Maxsus xatoliklarni ajratib ko'rsatish
    const errorMsg = error.message || "";
    if (errorMsg.includes("429") || errorMsg.includes("quota")) {
      throw new Error("Google API limiti tugadi. Iltimos, 1 daqiqa kutib qaytadan urinib ko'ring.");
    } else if (errorMsg.includes("403") || errorMsg.includes("API key")) {
      throw new Error("API kaliti noto'g'ri yoki ruxsat berilmagan. Sozlamalarni tekshiring.");
    } else if (errorMsg.includes("fetch")) {
      throw new Error("Internet aloqasi yoki Google serverlari bilan bog'lanishda xatolik.");
    }

    throw new Error(`Tahlil xatosi: ${errorMsg}`);
  }
}

export async function analyzeLungImage(base64Image: string): Promise<{ resultText: string; id: string }> {
  const mimeMatch = base64Image.match(/data:([^;]+);base64/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const imageData = base64Image.split(',')[1] || base64Image;

  const contents = {
    parts: [
      { text: "Ushbu o'pka rentgen tasvirini tahlil qiling va o'zbek tilida xulosa bering." },
      { inlineData: { mimeType, data: imageData } }
    ]
  };

  const resultText = await handleGeminiCall('gemini-3-flash-preview', contents, LUNG_SYSTEM_INSTRUCTION);
  const id = await saveToLocalHistory('lung', base64Image, resultText);
  return { resultText, id };
}

export async function analyzeUziImage(base64Image: string): Promise<{ resultText: string; id: string }> {
  const mimeMatch = base64Image.match(/data:([^;]+);base64/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const imageData = base64Image.split(',')[1] || base64Image;

  const contents = {
    parts: [
      { text: "Ushbu UZI tasvirini tahlil qiling va o'zbek tilida batafsil xulosa bering." },
      { inlineData: { mimeType, data: imageData } }
    ]
  };

  const resultText = await handleGeminiCall('gemini-3-flash-preview', contents, UZI_SYSTEM_INSTRUCTION);
  const id = await saveToLocalHistory('uzi', base64Image, resultText);
  return { resultText, id };
}

export async function analyzeDiabetesRisk(userData: any): Promise<{ resultText: string; id: string }> {
  const contents = [{ parts: [{ text: `Bemorning so'rovnomadagi ma'lumotlari: ${JSON.stringify(userData)}. Iltimos, ushbu ma'lumotlar asosida diabet rivojlanish xavfini o'zbek tilida tahlil qilib bering.` }] }];
  const resultText = await handleGeminiCall('gemini-3-flash-preview', contents, DIABETES_SYSTEM_INSTRUCTION, 0.4);
  const id = await saveToLocalHistory('diabetes', userData, resultText);
  return { resultText, id };
}

async function saveToLocalHistory(type: string, inputData: any, report: string): Promise<string> {
  const user = authService.getCurrentUser();
  const id = 'TR-' + Date.now();
  const newEntry = {
    id: id,
    timestamp: new Date().toLocaleString('uz-UZ'),
    type,
    imageUrl: type !== 'diabetes' ? inputData : null,
    inputData: type === 'diabetes' ? inputData : null,
    report,
    summary: report.substring(0, 150) + "...",
    userEmail: user?.email || 'guest'
  };
  try {
    await authService.saveGlobalHistory(newEntry);
  } catch (err) {
    console.error("History saqlashda xatoga yo'l qo'yildi, lekin tahlil davom etadi:", err);
  }
  return id;
}
