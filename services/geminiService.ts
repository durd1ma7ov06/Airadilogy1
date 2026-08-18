import { authService } from "./authService";

/**
 * AiRadiology - OpenRouter API orqali Gemini tahlil xizmati
 */

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemini-3.6-flash'; // Gemini 3.6 Flash - OpenRouter to'g'ri ID

const LUNG_SYSTEM_PROMPT = `Siz professional radiologsiz. 
O'pka rentgen tasvirini tahlil qiling. 
Xulosani O'ZBEK tilida, aniq va batafsil bering.

Quyidagi formatda yozing:

## 🫁 Tahlil Natijasi

**Tasvirda ko'rinadigan belgilar:**
[batafsil yozing]

## 🔍 Ehtimoliy Tashxis
[tashxis yoki holat]

## ✅ Tavsiyalar
[keyingi qadamlar]

## ⚠️ Ogohlantirish
Bu AI tahlili bo'lib, mutaxassis shifokor xulosasi emas.`;

const UZI_SYSTEM_PROMPT = `Siz UZI mutaxassisiz. 
Ultratovush tasvirini tahlil qiling. 
Organlar holati bo'yicha O'ZBEK tilida batafsil xulosa bering.

Formatda yozing:

## 🔍 UZI Tahlil Natijasi

**Ko'rinadigan organlar va holati:**
[batafsil yozing]

## 📋 Xulosa
[umumiy baho]

## ✅ Tavsiyalar
[tavsiyalar]`;

const DIABETES_SYSTEM_PROMPT = `Siz endokrinologsiz. 
Bemor ma'lumotlari asosida diabet xavfini O'ZBEK tilida baholang.

Formatda yozing:

## 🩸 Diabet Xavfi Tahlili

**Risk darajasi:** [Past / O'rta / Yuqori]

**Asosiy risk faktorlari:**
[ro'yxat]

## 📋 Tavsiyalar
[tavsiyalar va hayot tarzi o'zgarishlari]`;

// OpenRouter API ga so'rov yuborish
async function callOpenRouter(messages: any[]): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OpenRouter API key topilmadi!");
  }

  console.log('🔄 OpenRouter API ga so\'rov yuborilmoqda...');

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'AiRadiology',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: messages,
      temperature: 0.3,
      max_tokens: 2048,
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    console.error('OpenRouter xatosi:', errData);
    
    if (response.status === 401) {
      throw new Error("API key noto'g'ri. OpenRouter kalitini tekshiring.");
    }
    if (response.status === 429) {
      throw new Error("API limiti tugadi. Bir oz kuting.");
    }
    throw new Error(`Server xatosi: ${response.status} - ${errData?.error?.message || 'Noma\'lum xato'}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error("AI javob qaytara olmadi.");
  }

  console.log('✅ Tahlil muvaffaqiyatli yakunlandi!');
  return text;
}

// Rasmni base64 formatda tayyorlash
function prepareImage(base64Image: string) {
  const mimeType = base64Image.match(/data:([^;]+);base64/)?.[1] || 'image/jpeg';
  const imageData = base64Image.includes(',') ? base64Image : `data:${mimeType};base64,${base64Image}`;
  return { mimeType, imageData };
}

// O'pka rentgen tahlili
export async function analyzeLungImage(base64Image: string): Promise<{ resultText: string; id: string }> {
  try {
    console.log('🫁 O\'pka rentgeni tahlil qilinmoqda...');
    const { imageData } = prepareImage(base64Image);

    const messages = [
      {
        role: 'system',
        content: LUNG_SYSTEM_PROMPT
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: "Ushbu o'pka rentgen tasvirini professional tarzda tahlil qilib, o'zbek tilida batafsil xulosa bering."
          },
          {
            type: 'image_url',
            image_url: { url: imageData }
          }
        ]
      }
    ];

    const resultText = await callOpenRouter(messages);
    const id = await saveHistory('lung', base64Image, resultText);
    return { resultText, id };

  } catch (error: any) {
    console.error('❌ O\'pka tahlilida xatolik:', error);
    throw error;
  }
}

// UZI tahlili
export async function analyzeUziImage(base64Image: string): Promise<{ resultText: string; id: string }> {
  try {
    console.log('🔍 UZI tasviri tahlil qilinmoqda...');
    const { imageData } = prepareImage(base64Image);

    const messages = [
      {
        role: 'system',
        content: UZI_SYSTEM_PROMPT
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: "Ushbu UZI tasvirini tahlil qiling va o'zbek tilida batafsil xulosa bering."
          },
          {
            type: 'image_url',
            image_url: { url: imageData }
          }
        ]
      }
    ];

    const resultText = await callOpenRouter(messages);
    const id = await saveHistory('uzi', base64Image, resultText);
    return { resultText, id };

  } catch (error: any) {
    console.error('❌ UZI tahlilida xatolik:', error);
    throw error;
  }
}

// Diabet xavfi tahlili
export async function analyzeDiabetesRisk(userData: any): Promise<{ resultText: string; id: string }> {
  try {
    console.log('🩸 Diabet xavfi baholanmoqda...');

    const messages = [
      {
        role: 'system',
        content: DIABETES_SYSTEM_PROMPT
      },
      {
        role: 'user',
        content: `Quyidagi bemor ma'lumotlari asosida diabet xavfini baholang:\n\n${JSON.stringify(userData, null, 2)}`
      }
    ];

    const resultText = await callOpenRouter(messages);
    const id = await saveHistory('diabetes', userData, resultText);
    return { resultText, id };

  } catch (error: any) {
    console.error('❌ Diabet tahlilida xatolik:', error);
    throw error;
  }
}

// Tarixni saqlash
async function saveHistory(type: string, inputData: any, report: string): Promise<string> {
  const id = 'TR-' + Date.now();
  const user = authService.getCurrentUser();

  const entry = {
    id,
    timestamp: new Date().toLocaleString('uz-UZ'),
    type,
    imageUrl: type !== 'diabetes' ? inputData : null,
    inputData: type === 'diabetes' ? inputData : null,
    report,
    summary: report.substring(0, 150) + "...",
    userEmail: user?.email || 'guest'
  };

  try {
    await authService.saveGlobalHistory(entry);
  } catch (err) {
    console.error("Tarix saqlashda xatolik:", err);
  }

  return id;
}
