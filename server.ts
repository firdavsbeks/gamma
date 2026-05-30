/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialize Gemini API client to prevent startup failure if key is missing
let aiInstance: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY muhit o'zgaruvchisi topilmadi. Iltimos, Sozlamalar -> Secrets panelida API kalitini o'rnating."
      );
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// Global error handler utility
function handleApiError(res: Response, error: any, customMessage: string) {
  console.error(`${customMessage}:`, error);
  res.status(500).json({
    error: true,
    message: error instanceof Error ? error.message : "Noma'lum xatolik",
    detail: customMessage,
  });
}

// 1. WORKOUT SPLIT GENERATOR ROUTE
app.post("/api/generate-plan", async (req: Request, res: Response) => {
  try {
    const { profile } = req.body;
    if (!profile) {
      res.status(400).json({ error: true, message: "Profil ma'lumotlari kiritilmagan" });
      return;
    }

    const ai = getGenAI();
    let prompt = `Men uchun shaxsiylashtirilgan fitnes mashqlari rejasini (Workout routine) tuzib bering.
Mening profil ma'lumotlarim:
- Ismim: ${profile.name}
- Yoshim: ${profile.age || "kiritilmagan"}
- Vaznim: ${profile.weight || "kiritilmagan"} kg
- Bo'yim: ${profile.height || "kiritilmagan"} sm
- Maqsadim: ${
      profile.goal === "lose_weight"
        ? "Vazn yo'qotish (Ozish)"
        : profile.goal === "build_muscle"
        ? "Mushak massasini oshirish"
        : profile.goal === "stay_fit"
        ? "Sog'lom tonus va chidamlilik"
        : "Umumiy salomatlik"
    }
- Mashg'ulot darajam: ${profile.experience || "beginner"}

Iltimos, haftalik 3 yoki 4 kunlik mashg'ulotlar rejasini tuzib bering. Har bir kunga bir nechta mos mashqlarni, yondashuvlar soni (sets) va takrorlashlar (reps) bilan belgilang. Izohlar qismida mashq bajarish bo'yicha qisqacha o'zbek tilida maslahatlar bering. Barcha mashqlar nomlari va tavsiflari O'zbek tilida yozilishi shart.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Siz O'zbekistondagi professional fitnes murabbiysisiz. Foydalanuvchilarning jismoniy holatiga mos keladigan eng samarali va xavfsiz mashg'ulot dasturlari tuzib bering. Javoblar to'liq o'zbek tilida bo'lsin.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            routines: {
              type: Type.ARRAY,
              description: "Haftalik xilma-xil kunlik mashg'ulot rejalari ro'yxati (3 yoki 4 kunlik bo'lishi maqbul)",
              items: {
                type: Type.OBJECT,
                properties: {
                  dayName: {
                    type: Type.STRING,
                    description: "Kun nomi va uning asosiy fokal qismi, masalan: 'Kun 1: Ko'krak va Triceps', 'Kun 2: Orqa va Biceps' kabi",
                  },
                  exercises: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING, description: "Mashqning o'zbekcha ommabop nomi" },
                        sets: { type: Type.INTEGER, description: "Yondashuvlar (sets) soni, masalan: 3 yoki 4" },
                        reps: { type: Type.STRING, description: "Takrorlashlar soni yoki vaqti, masalan: '10-12 marta' yoki '45 soniya'" },
                        notes: { type: Type.STRING, description: "Mashqni bajarish texnikasi haqida qisqa o'zbekcha maslahat" },
                      },
                      required: ["name", "sets", "reps"],
                    },
                  },
                },
                required: ["dayName", "exercises"],
              },
            },
            motivation: {
              type: Type.STRING,
              description: "Foydalanuvchini maqsad sari harakat qilishga undaydigan hayajonli o'zbekcha gap",
            },
          },
          required: ["routines", "motivation"],
        },
      },
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    res.json(data);
  } catch (error: any) {
    handleApiError(res, error, "Mashg'ulot rejasini yaratishda xatolik yuz berdi");
  }
});

// 2. NATURAL LANGUAGE MEAL ANALYZER ROUTE
app.post("/api/analyze-meal", async (req: Request, res: Response) => {
  try {
    const { mealText } = req.body;
    if (!mealText || typeof mealText !== "string") {
      res.status(400).json({ error: true, message: "Taom tavsifi kiritilmagan" });
      return;
    }

    const ai = getGenAI();
    const prompt = `Foydalanuvchi quyidagi matnda nima yeganini yozdi. Iltimos buni tahlil qiling va tarkibidagi ovqat va mahsulotlarni, ularning taqribiy kaloriya (Kkal), oqsil (protein - grammda), uglevod (carbs - grammda) va yog' (fat - grammda) miqdorini aniqlab bering. 

Foydalanuvchi matni: "${mealText}"

Tahlil davomida milliy o'zbek taomlari (osh, somsa, sho'rva, manti va h.k.) yoki xalqaro ovqatlar kaloriyasini hisoblashda eng keng tarqalgan o'rtacha moshliklardan foydalaning. Agar foydalanuvchi miqdorini yozmagan bo'lsa (masalan, shunchaki 'palov yedim' desa), bitta standart porsiya (300-350g) deb hisoblang. Baraka toping, barcha ma'lumotlar o'zbekona tilda bo'lsin.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Siz malakali dietolog va nutrisiologsiz. O'zbekona taomlar va har qanday mahsulotlar kaloriyasi hamda makronutrientlarini juda yaxshi bilasiz.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              description: "Tahlil qilingan alohida oziq-ovqat mahsulotlari",
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Mahsulot/taom nomi (o'zbek tilida, masalan: 'Palov (bitta porsiya)' yoki 'Qora non')" },
                  calories: { type: Type.INTEGER, description: "Portsiya uchun energiya qiymati (kkal)" },
                  protein: { type: Type.INTEGER, description: "Oqsil miqdori (g)" },
                  carbs: { type: Type.INTEGER, description: "Uglevod miqdori (g)" },
                  fat: { type: Type.INTEGER, description: "Yog' miqdori (g)" },
                },
                required: ["name", "calories", "protein", "carbs", "fat"],
              },
            },
            summary: {
              type: Type.STRING,
              description: "Ushbu ovqatlanishning ratsionga ta'siri va umumiy foydali tomonlari haqida qisqacha o'zbekcha maslahat (maksimal 25 ta so'z)",
            },
          },
          required: ["items", "summary"],
        },
      },
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    res.json(data);
  } catch (error: any) {
    handleApiError(res, error, "Taom tahlilida xatolik yuz berdi");
  }
});

// 3. AI FITNES COACH CHAT ROUTE
app.post("/api/coach-chat", async (req: Request, res: Response) => {
  try {
    const { messages, userMessage } = req.body;
    if (!userMessage) {
      res.status(400).json({ error: true, message: "Xabar matni yo'q" });
      return;
    }

    const ai = getGenAI();

    // Transform chat messages list for standard call
    // Set a solid persona in the systemInstruction to keep it context aware
    const systemPersona = `Siz Temur fitsnes-klubining professional o'zbek murabbiyi va dietologesiz.
Sizning maqsadingiz foydalanuvchiga fitnes, ozish, semirish, mashg'ulotlar texnikasi va sog'lom ovqatlanish masalalarida yordam berishdir.
Xushmuomala, bilimli, motivatsiya beruvchi va aniq gapiring. Savollarga ilmiy jihatdan, lekin tushunarli tilda javob bering.
Doimo o'zbek tilida so'zlashing. Nojo'ya yoki fitnesga aloqador bo'lmagan mavzularda savol berilsa, muloyimlik bilan mavzuni sport va sog'liqqa burib yuboring.`;

    // We can use simple text generation with structured messages history
    const historyParts = (messages || []).map((msg: any) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));

    // Add the current prompt
    historyParts.push({ role: "user", parts: [{ text: userMessage }] });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: historyParts,
      config: {
        systemInstruction: systemPersona,
        temperature: 0.8,
      },
    });

    const coachReply = response.text || "Kechirasiz, javob olishda muammo bo'ldi. Qaytadan urinib ko'ring.";
    res.json({ text: coachReply });
  } catch (error: any) {
    handleApiError(res, error, "Murabbiy bilan bog'lanishda xatolik yuz berdi");
  }
});

// MAIN SERVER VITE MIDDLEWARE SETUP
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    // Development server with HMR / proxy middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware mounted.");
  } else {
    // Production build serves compile outputs
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving compiled production assets.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Fitnes va Kaloriya backend listening on http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Server start error:", err);
});
