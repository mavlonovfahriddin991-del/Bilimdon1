/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini Client
let aiClient: any = null;
function getGeminiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return aiClient;
}

// AI Ustoz API Route
const SYSTEM_INSTRUCTION = `Siz o'zbek tilida gaplashadigan bolajonlar uchun mo'ljallangan juda mehribon, quvnoq va aqlli "AI Ustoz Robotvoy" ismli o'qituvchisiz.
Bolalarning yoshi 4 va 10 yosh oralig'ida. Ularga sodda, qiziqarli, juda do'stona va rag'batlantiruvchi tarzda javob bering.
Quyidagi qoidalarga qat'iy amal qiling:
1. Murakkab ilmiy atamalarni ishlatmang. Soddaroq so'zlar va kundalik hayotdagi bolabop misollar orqali tushuntiring.
2. Gaplaringiz juda qisqa, tushunarli va do'stona bo'lsin.
3. Har doim quvnoq emojilardan ko'p foydalaning (masalan, 🌟, 🚀, 🐱, 🎨, 🍎, 🧸, 🤖).
4. Bolajonni ismi bilan (agar aytsa) yoki "mittivoy", "do'stim", "aqlligim" deb chaqiring.
5. Har bir javobingiz oxirida bolani qiziqtiruvchi bitta oson savol yoki qiziqarli bolalarbop fakt bering.
6. Agar bola xato so'z yozsa yoki noto'g'ri hisoblasa ham uni aslo urishmang, "hechqisi yo'q, sen juda aqllisan, yana bir bor birgalikda urinib ko'ramiz!" deb dalda bering.`;

async function getGroqReply(message: string, history: any[]): Promise<string | null> {
  const groqKey = process.env.GROQ_API_KEY || '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';
  if (!groqKey) return null;

  try {
    const formattedMessages = [
      { role: 'system', content: SYSTEM_INSTRUCTION },
      ...(history || []).map((h: any) => ({
        role: h.role === 'model' ? 'assistant' : 'user',
        content: h.text
      })),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: formattedMessages,
        temperature: 0.8,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      console.error('Groq principal model error:', response.status);
      // Fallback model llama3-8b-8192
      const backupResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: formattedMessages,
          temperature: 0.8,
          max_tokens: 1024
        })
      });
      if (backupResponse.ok) {
        const data = await backupResponse.json();
        return data.choices?.[0]?.message?.content || null;
      }
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.error('Groq fetch error:', err);
    return null;
  }
}

app.post('/api/ai-ustoz', async (req: express.Request, res: express.Response) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      res.status(400).json({ error: 'Xabar kiritilmadi!' });
      return;
    }

    // Try Groq first as requested by the user
    const groqReply = await getGroqReply(message, history);
    if (groqReply) {
      res.json({ reply: groqReply });
      return;
    }

    // Try Gemini next
    const ai = getGeminiClient();
    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [
          { role: 'user', parts: [{ text: `Tizim yo'riqnomasi: ${SYSTEM_INSTRUCTION}` }] },
          ...(history || []).map((h: any) => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }]
          })),
          { role: 'user', parts: [{ text: message }] }
        ],
        config: {
          temperature: 0.85,
        }
      });

      const responseText = response.text || 'Uzr bolajonim, hozir biroz charchadim. Bir ozdan keyin gaplashamiz! 🧸';
      res.json({ reply: responseText });
    } else {
      // High-quality simulated conversational fallback
      const query = message.toLowerCase();
      let reply = '';

      if (query.includes('salom') || query.includes('assalom') || query.includes('qale')) {
        reply = "Salom bolajonim! Men sening aqlli AI Ustozing - Robotvoyman! 🤖 Senga harflar, sonlar, rasm chizish yoki dunyo sirlarini o'rganishda yordam bera olaman. Bugun qaysi qiziqarli mavzuda suhbatlashamiz? 🌟";
      } else if (query.includes('kosmos') || query.includes('raketa') || query.includes('yulduz') || query.includes('quyosh') || query.includes('oy')) {
        reply = "Vau! Kosmos juda ulkan va sirli joy! 🚀 Biz yashaydigan Yer sayyorasi ham Quyosh atrofida aylanadi. Bilasanmi, Quyosh aslida juda katta yulduzdir! Kelajakda fazogir bo'lishni xohlaysanmi? 🌌";
      } else if (query.includes('matem') || query.includes('son') || query.includes('hisob') || query.includes('qo\'shish') || query.includes('ayirish') || query.includes('kopaytirish')) {
        reply = "Sonlar dunyosiga xush kelibsiz! 🔢 Matematika juda qiziqarli o'yin. Masalan, senga 3 ta shirin pufak bersam, keyin yana 2 tasini sovg'a qilsam, senda jami 5 ta pufak bo'ladi! Qani ayt-chi, senda hozir nechta o'yinchoq bor? 🧸";
      } else if (query.includes('harf') || query.includes('alifbo') || query.includes('o\'qish') || query.includes('yozish')) {
        reply = "Harflar - so'zlar eshigining kalitidir! 🅰️ Biz harflarni birlashtirib sehrli so'zlar yasaymiz. Masalan, 'A' harfi 'Aqlli' yoki 'Olma' so'zlarining boshi! Sen o'z isming qaysi harfdan boshlanishini bilasanmi? 📚";
      } else if (query.includes('isming') || query.includes('kimsan') || query.includes('robot')) {
        reply = "Men sening quvnoq AI Ustozingman! Bolajonlar meni 'Robotvoy' deb chaqirishadi. Senga qiziqarli ertaklar va jumboqlar aytib bera olaman. Sening isming nima, do'stim? 🤖✨";
      } else if (query.includes('hayvon') || query.includes('it') || query.includes('mushuk') || query.includes('sher') || query.includes('ayiq')) {
        reply = "Hayvonlar bizning tabiatdagi eng yaqin do'stlarimizdir! 🦁 Bilasanmi, eng katta quruqlik jonzoti bu - Fil! Mushuklar esa juda muloyim va 'miyov' deb qo'shiq aytishadi. Sening uyingda qanday hayvon bor yoki qaysi birini eng ko'p yoqtirasan? 🐱";
      } else if (query.includes('buyash') || query.includes('rasm') || query.includes('chizish') || query.includes('rang')) {
        reply = "Rasm chizish va bo'yash xayolot olamini jonlantiradi! 🎨 Ranglar juda sehrli. Masalan, sariq va ko'k rangni aralashtirsak, yashil rang hosil bo'ladi! Bugun qaysi rasmni chizmoqchisan? 🌟";
      } else if (query.includes('rahmat') || query.includes('rahmatjon') || query.includes('zo\'r')) {
        reply = "Arziydi, mening jajji aqlligim! 💖 Senga yordam berganimdan juda xursandman. Esingda bo'lsin, sen juda iqtidorli va aqlli bolajonsan! Yana biror narsa haqida gaplashamiz hisob? 🍭";
      } else {
        reply = "Qiziqarli savol uchun rahmat, mening aqlli do'stim! 🌟 Men sening savoling haqida o'ylayapman. Dunyoda juda ko'p qiziqarli sirlar bor va biz ularni birga kashf etamiz. Senga yana qanday qiziqarli jumboq yoki ertak aytib beray? 🧸";
      }

      res.json({ reply });
    }
  } catch (error: any) {
    console.error('AI Ustoz Error:', error);
    res.status(500).json({ error: "Kechirasiz bolajonim, Robotvoy biroz charchadi. Iltimos qayta urinib ko'ring." });
  }
});

// PWA Manifest Endpoint
app.get('/manifest.json', (req, res) => {
  res.json({
    name: "Bolalar Bilim Platformasi",
    short_name: "Mitti Zukkolar",
    description: "Bolalar uchun qiziqarli o'yinlar va mantiqiy topishmoqlar platformasi.",
    start_url: "/",
    display: "standalone",
    background_color: "#1e1b4b",
    theme_color: "#1e1b4b",
    icons: [
      {
        "src": "https://img.icons8.com/emoji/192/000000/game-die.png",
        "sizes": "192x192",
        "type": "image/png"
      },
      {
        "src": "https://img.icons8.com/emoji/512/000000/game-die.png",
        "sizes": "512x512",
        "type": "image/png"
      }
    ]
  });
});

// PWA Service Worker Endpoint
app.get('/sw.js', (req, res) => {
  res.set('Content-Type', 'application/javascript');
  res.send(`
    self.addEventListener('install', (e) => {
      self.skipWaiting();
    });
    self.addEventListener('activate', (e) => {
      e.waitUntil(clients.claim());
    });
    self.addEventListener('fetch', (e) => {
      // Passive network-first strategy
    });
  `);
});

// Vite middleware development setup or static production assets
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
