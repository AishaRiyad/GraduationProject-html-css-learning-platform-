import express from "express";
import fetch from "node-fetch";
import db from "../config/db.js";
import NodeCache from "node-cache";
import path from "path";
//import fs from "fs/promises";
 import fs from "fs";

const router = express.Router();
const cache = new NodeCache({ stdTTL: 60 });


router.post("/ask", async (req, res) => {
  try {
    const { prompt } = req.body;

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3:8b",
        prompt,
        stream: true,          // 🟢 تشغيل البث
      }),
    });

    res.setHeader("Content-Type", "text/plain; charset=utf-8");

    for await (const chunk of response.body) {
      try {
        const json = JSON.parse(chunk.toString());
        if (json.response) res.write(json.response);
      } catch {
        // أحيانًا يكون chunk ناقص — نتجاهله
      }
    }
    res.end();
  } catch (err) {
    console.error("❌ AI stream error:", err.message);
    res.status(500).send("AI streaming failed");
  }
});







router.post("/smart-image", async (req, res) => {
  try {
    const { imageUrl, imageBase64, htmlCode } = req.body;

    // 🧠 نص التوجيه المخصص
    let prompt = "";
    if (htmlCode) {
     prompt = `
Describe the content of the given image in one short descriptive English sentence suitable for the alt attribute in HTML.
Return only the sentence, no quotes, no HTML tags.
`;

    } else {
      prompt = `
You are an AI vision model.
Describe the given image in one short descriptive English sentence that fits as an HTML alt attribute.
Do NOT include HTML or quotes, only the text.
`;
    }

    // 🖼️ تجهيز الصورة
let imageData = imageBase64;
if (imageUrl && !imageBase64) {
  const imgRes = await fetch(imageUrl);
  const buffer = await imgRes.arrayBuffer();
  imageData = Buffer.from(buffer).toString("base64");
} else if (imageBase64.startsWith("data:image")) {
  // 🔹 إزالة الجزء الأول من base64
  imageData = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
}


    const body = {
  model: "llava:7b",
  prompt,
  images: [imageData], // ✅ الآن الصورة بدون data:header
  stream: false,
};


    // 🚀 إرسال الطلب لـ Ollama
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    // ✅ قراءة الرد الكامل (النص فقط)
    const text = await response.text();

    // ❗ بعض إصدارات Ollama ترجع كل سطر JSON (chunked)
    // نلتقط آخر سطر فيه "response"
    const lines = text.split("\n").filter(Boolean);
    let lastLine = lines.pop();
    let json = null;
    try {
      json = JSON.parse(lastLine);
    } catch {
      json = { response: text };
    }

    // 🧠 استخراج الوصف النصي
    const aiAlt = json.response?.trim().replace(/^"|"$/g, "") || "Image";

    // ✨ توليد كود HTML نهائي
    const result = `<img src='${imageUrl || ""}' alt='${aiAlt}'>`;

    res.json({ result });
  } catch (err) {
    console.error("❌ AI Smart Image Error:", err.message);
    res.status(500).json({ error: "AI smart image generation failed" });
  }
});

router.post("/html-generator", async (req, res) => {
  try {
    const { link, imageUrl, imageBase64 } = req.body;

    if (!link && !imageUrl && !imageBase64) {
      return res.status(400).json({ error: "Please provide a link or image." });
    }

    const prompt = `
You are an expert HTML generator.
Given the user inputs, return only the valid HTML code.
Do NOT explain or include backticks or markdown.

If both a link (URL) and an image are provided:
- Generate <a> with <img> inside.

If only link is provided:
- Generate an <a> element with descriptive text like "Visit Website".

If only image is provided:
- Generate an <img> element with alt text describing the image.

Now generate the HTML for:
link: ${link || "none"}
image: ${imageUrl || "none"}
`;


    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3:8b",
        prompt,
        stream: false,
      }),
    });

  const text = await response.text();
const lines = text.split("\n").filter(Boolean);
let lastLine = lines.pop();
let json;
try {
  json = JSON.parse(lastLine);
} catch {
  json = { response: text };
}

   let code = json.response || text;
code = code
  .replace(/```html|```/g, "")
  .replace(/^Here.*?:/i, "")
  .trim();
  res.json({ code });
  } catch (err) {
    console.error("❌ HTML Generator Error:", err.message);
    res.status(500).json({ error: "Error generating HTML code" });
  }
});

// ================================
// 🧠 AI Table Generator (Lesson 4)
// ================================
router.post("/table-generator", async (req, res) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ error: "Please provide a table description." });
    }

    const prompt = `
Convert the following description into clean, well-formatted HTML table code.
Use <table>, <thead>, <tbody>, and <tfoot> where appropriate.
Include simple internal CSS styles: border-collapse, light borders, centered text, and alternating row colors.
No JavaScript, no explanations — return only valid HTML.
Description: "${description}"
`;

    // 🚀 Send request to Ollama (llama3 model)
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3:8b",
        prompt,
        stream: false,
      }),
    });

    // 🧾 Parse AI response
    const text = await response.text();
    const lines = text.split("\n").filter(Boolean);
    let lastLine = lines.pop();
    let json;
    try {
      json = JSON.parse(lastLine);
    } catch {
      json = { response: text };
    }

    let code = json.response || text;
    code = code
      .replace(/```html|```/g, "")
      .replace(/^Here.*?:/i, "")
      .trim();

    res.json({ code });
  } catch (err) {
    console.error("❌ AI Table Generator Error:", err.message);
    res.status(500).json({ error: "Error generating table HTML" });
  }
});
// ================================
// 🤖 AI Review for Mini Project (Lesson 5)
// ================================
router.post("/review-project", async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: "HTML code is required for review." });
    }

    // 🧠 Prompt for the AI model
    const prompt = `
You are an expert HTML instructor reviewing a student's mini project: a "Registration Form".
The student's HTML code is:

${code}

Please evaluate it in English following these steps:
1. ✅ **Corrections**: Point out any mistakes or issues found in the code.
2. 💡 **Suggested Improvements**: Explain how the code can be improved (e.g., adding labels, required, type, name, better structure, etc.).
3. 🧮 **Overall Rating**: Choose one — Excellent / Good / Needs Improvement.
4. 📄 **Corrected Code (if needed)**: Provide a corrected version of the code without extra explanations.

Do not write anything other than these four sections.
`;

    // 🚀 Send request to the local Ollama server
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3:8b",
        prompt,
        stream: false
      }),
    });

    // 🧾 Parse the AI response
    const text = await response.text();
    const lines = text.split("\n").filter(Boolean);
    let lastLine = lines.pop();
    let json;
    try {
      json = JSON.parse(lastLine);
    } catch {
      json = { response: text };
    }

    const reviewText = json.response || text;

    res.json({ review: reviewText.trim() });
  } catch (err) {
    console.error("❌ AI Review Error:", err.message);
    res.status(500).json({ error: "AI review failed" });
  }
});

// ================================
// 🤖 AI Form Assistant (Lesson 5)
// ================================
router.post("/assist", async (req, res) => {
  try {
    const { question, html } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required." });
    }

    // 🧠 التوجيه (prompt)
    const prompt = `
You are an HTML expert helping a student learning "Forms and Inputs".
Answer briefly  and include an HTML example if relevant.

Question: "${question}"

If the question mentions an input type (like email, date, range, etc),
give a real-world example using a <form> and <input>.
Do NOT include markdown or code fences.
${html ? "Student current HTML:\n" + html : ""}
`;

    // 🚀 إرسال الطلب إلى Ollama
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3:8b",
        prompt,
        stream: false
      }),
    });

    // 🧾 قراءة الرد
    const text = await response.text();
    const lines = text.split("\n").filter(Boolean);
    let lastLine = lines.pop();
    let json;
    try {
      json = JSON.parse(lastLine);
    } catch {
      json = { response: text };
    }

    const answer = json.response || text;
    res.json({ answer: answer.trim() });
  } catch (err) {
    console.error("❌ AI Assist Error:", err.message);
    res.status(500).json({ error: "AI assistant failed" });
  }
});


// ================================
// 🔊 AI Text-to-Speech (Lesson 6)
// ================================
import googleTTS from "google-tts-api";

/**
 * Body:
 * {
 *   "text": "Welcome to my website", // مطلوب
 *   "lang": "en",                    // اختياري (افتراضي en)
 *   "slow": false,                   // اختياري
 *   "asBase64": false                // لو true يرجّع Base64 داخل JSON
 * }
 *
 * إذا asBase64 = false → يرجّع ملف audio/mpeg مباشرة (stream/download).
 * إذا asBase64 = true  → يرجّع JSON فيه audioBase64 و mime.
 */
// ================================
// 🔊 AI Text-to-Speech (with long text support)
// ================================
router.post("/text-to-speech", async (req, res) => {
  try {
    const { text, lang = "en", slow = false, asBase64 = false } = req.body || {};
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Please provide 'text' to synthesize." });
    }

    // ✂️ تقسيم النص الطويل إلى أجزاء صغيرة ≤ 200 حرف
    const splitText = text.match(/.{1,200}(\s|$)/g) || [text];

    // 1️⃣ استخدم getAllAudioUrls من google-tts-api
    const urls = await googleTTS.getAllAudioUrls(text, {
      lang,
      slow,
      host: "https://translate.google.com",
    });

    // 2️⃣ حمّل كل جزء كـ Buffer
    const buffers = [];
    for (const u of urls) {
      const audioRes = await fetch(u.url);
      if (!audioRes.ok) continue;
      const arrBuf = await audioRes.arrayBuffer();
      buffers.push(Buffer.from(arrBuf));
    }

    // 3️⃣ دمج جميع المقاطع في ملف صوت واحد
    const mergedBuffer = Buffer.concat(buffers);

    // 🎧 إرجاع النتيجة كـ base64 أو ملف صوتي
    if (asBase64) {
      return res.json({
        mime: "audio/mpeg",
        audioBase64: mergedBuffer.toString("base64"),
        length: mergedBuffer.length,
      });
    }

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", String(mergedBuffer.length));
    return res.end(mergedBuffer);
  } catch (err) {
    console.error("❌ TTS Error:", err.message);
    return res.status(500).json({ error: "Text-to-speech failed" });
  }
});


// ================================
// 🤖 AI Tag Tutor (Lesson 7)
// ================================
router.post("/tag-tutor", async (req, res) => {
  try {
    const { tag } = req.body;

    if (!tag || !tag.trim()) {
      return res.status(400).json({ error: "Please provide an HTML tag." });
    }

    // 🧠 التوجيه (prompt)
    const prompt = `
You are an HTML instructor helping a student understand semantic HTML.
Explain the purpose of the tag "${tag}" in simple English.
Include:
1. A short explanation of what it does.
2. When it should be used.
3. A very short HTML example.
Do NOT include markdown, backticks, or any explanations beyond the 3 points.
Keep the answer under 10 lines.
`;

    // 🚀 إرسال الطلب إلى Ollama
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3:8b",
        prompt,
        stream: false,
      }),
    });

    const text = await response.text();
    const lines = text.split("\n").filter(Boolean);
    let lastLine = lines.pop();
    let json;

    try {
      json = JSON.parse(lastLine);
    } catch {
      json = { response: text };
    }

    const answer = json.response || text;
    res.json({ explanation: answer.trim() });
  } catch (err) {
    console.error("❌ AI Tag Tutor Error:", err.message);
    res.status(500).json({ error: "AI Tag Tutor failed" });
  }
});


// ================================
// 🧩 AI Structure Visualizer (Lesson 7)
// ================================
router.post("/structure-visualizer", async (req, res) => {
  try {
    const { htmlCode } = req.body;

    if (!htmlCode || !htmlCode.trim()) {
      return res.status(400).json({ error: "Please provide HTML code to analyze." });
    }

    const prompt = `
Analyze the following HTML code and describe its structure in a clear textual hierarchy.

Example output:
Page Structure:
- Header: contains logo or title
- Nav: navigation links
- Main: includes multiple sections or articles
- Footer: contains contact info or copyright

Do not return actual HTML or Markdown, only plain text.

HTML Code:
${htmlCode}
`;

    // 🚀 إرسال الطلب إلى Ollama
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3:8b",
        prompt,
        stream: false,
      }),
    });

    const text = await response.text();
    const lines = text.split("\n").filter(Boolean);
    let lastLine = lines.pop();
    let json;

    try {
      json = JSON.parse(lastLine);
    } catch {
      json = { response: text };
    }

    const structure = json.response || text;
    res.json({ structure: structure.trim() });
  } catch (err) {
    console.error("❌ AI Structure Visualizer Error:", err.message);
    res.status(500).json({ error: "AI structure visualization failed" });
  }
});
// ================================
// 🗣️ AI Voice Explain (Semantic Lesson)
// ================================
router.post("/voice-explain", async (req, res) => {
  try {
    const { heading, content } = req.body;
    if (!heading || !content)
      return res.status(400).json({ error: "Heading and content required." });

    // 🧠 اطلب من AI تبسيط الشرح
    const prompt = `
Explain the following HTML concept in a simple, friendly way (like a teacher explaining to a beginner). 
Keep it short and conversational. Return only the explanation text (no markdown).

Title: ${heading}
Content: ${content}
`;

    const aiRes = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3:8b",
        prompt,
        stream: false,
      }),
    });

    const text = await aiRes.text();
    const lines = text.split("\n").filter(Boolean);
    let lastLine = lines.pop();
    let json;
    try {
      json = JSON.parse(lastLine);
    } catch {
      json = { response: text };
    }

    const explanation = json.response?.trim() || text.trim();

    // 🎧 استخدم Google TTS لتحويله لصوت
    const ttsRes = await fetch("http://localhost:5000/api/ai-local/text-to-speech", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: explanation,
        lang: "en",
        asBase64: true,
      }),
    });

    const ttsData = await ttsRes.json();

    res.json({
      text: explanation,
      audioBase64: ttsData.audioBase64,
    });
  } catch (err) {
    console.error("❌ AI Voice Explain Error:", err.message);
    res.status(500).json({ error: "Voice explanation failed" });
  }
});

// ====================================
// 🤖 HTML & Web Design AI Assistant
// ====================================
router.post("/html-assistant", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ error: "Please provide a question." });
    }

    // 🧠 توجيه الذكاء الاصطناعي
    const prompt = `
You are a professional HTML & web design tutor.
The user may ask any question related to HTML, CSS, or responsive design.
Answer clearly and educationally.

Guidelines:
1. If the question requires code, include the code inside <pre><code> ... </code></pre> tags.
2. Keep the explanation simple and under 15 lines.
3. Avoid markdown symbols like ** or \`\`\`.
4. Do not include meta commentary or assistant behavior.
5. Keep your tone friendly and educational.

User question: "${question}"
`;

    // 🚀 إرسال الطلب إلى النموذج المحلي (Ollama)
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3:8b",
        prompt,
        stream: false
      }),
    });

    const text = await response.text();

    res.json({ answer: text.trim() });
  } catch (err) {
    console.error("❌ HTML Assistant Error:", err.message);
    res.status(500).json({ error: "HTML Assistant failed" });
  }
});

// ================================
// 🧠 AI Smart List Builder (Lesson 9)
// ================================
router.post("/generate-list", async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({ error: "Please provide a topic to generate the list." });
    }

    // 🧠 التوجيه (prompt)
    const prompt = `
You are an HTML expert.
The user will give you a topic, and you must create a suitable HTML list (<ul> or <ol>) that matches the topic.
Rules:
- Choose <ol> if the topic suggests steps, instructions, or rankings.
- Choose <ul> if it's a general or unordered topic.
- Include 4 to 6 list items related to the topic.
- Return only clean, valid HTML code (no markdown, no explanations, no backticks).

Topic: "${topic}"
`;

    // 🚀 إرسال الطلب إلى Ollama (llama3 model)
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3:8b",
        prompt,
        stream: false
      }),
    });

    // 🧾 تحليل رد الذكاء الاصطناعي
    const text = await response.text();
    const lines = text.split("\n").filter(Boolean);
    let lastLine = lines.pop();
    let json;
    try {
      json = JSON.parse(lastLine);
    } catch {
      json = { response: text };
    }

    // ✨ استخراج الكود
    let code = json.response || text;
    code = code
      .replace(/```html|```/g, "")
      .replace(/^Here.*?:/i, "")
      .trim();

    res.json({ code });
  } catch (err) {
    console.error("❌ AI List Generator Error:", err.message);
    res.status(500).json({ error: "Error generating HTML list" });
  }
});
// ================================
// 🚀 AI Navbar Journey (Lesson 10)
// ================================
router.post("/navbar-journey", async (req, res) => {
  try {
    const { userChoice, step } = req.body;

    // لو أول مرة المستخدم ببدأ الرحلة
    let prompt = "";

    if (!step || step === 1) {
      prompt = `
You are an interactive AI web design tutor guiding a beginner through building a responsive Navigation Bar (navbar) using HTML and CSS.

Start by welcoming the user to their Navbar Journey.
Ask them which *type of website* they are designing from the following options:
1. Portfolio Website
2. Restaurant Website
3. Technology Blog
4. Online Store

Keep your message friendly and engaging (under 8 lines).
Do not include any code yet.
`;
    } 
    // الخطوة الثانية: بناءً على نوع الموقع المختار
    else if (step === 2) {
      prompt = `
The student chose this type of website: "${userChoice}".

Now ask what *style or mood* they want for the navbar.
Give 3 simple style options to choose from, for example:
1. Minimal light (white background, dark text)
2. Dark modern (black background, white text)
3. Colorful creative (bright gradient or accent colors)

Be encouraging and short.
`;
    } 
    // الخطوة الثالثة: بناء التصميم
    else if (step === 3) {
      prompt = `
The student selected this navbar style: "${userChoice}".

Now generate HTML + CSS code for a simple navigation bar following that style.
Include:
- A <nav> element
- 4 links (Home, About, Services, Contact)
- Responsive behavior using flexbox and media queries
- Hover color effect
- Keep the code readable and short.

Return only clean HTML + CSS code, no explanations or markdown.
`;
    } 
    // في أي خطوة إضافية
    else {
      prompt = `
Continue the AI Navbar Journey based on this user input: "${userChoice}".
Provide the next logical response or step.
Keep it conversational, short, and related to web design.
`;
    }

    // 🚀 إرسال الطلب إلى Ollama
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3:8b",
        prompt,
        stream: false
      }),
    });

    const text = await response.text();
    const lines = text.split("\n").filter(Boolean);
    let lastLine = lines.pop();
    let json;
    try {
      json = JSON.parse(lastLine);
    } catch {
      json = { response: text };
    }

    const aiResponse = json.response || text;

    res.json({ message: aiResponse.trim() });
  } catch (err) {
    console.error("❌ AI Navbar Journey Error:", err.message);
    res.status(500).json({ error: "AI Navbar Journey failed" });
  }
});

// ================================
// 🧠 AI Embed Helper (Text Question)
// ================================
router.post("/embed-generator", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ error: "Please provide a question." });
    }

    const prompt = `
You are an HTML iframe expert.
The user asked: "${question}"
Generate only one clean <iframe> code that best answers this request.
Rules:
- Always include width="600", height="400", title, frameborder="0", and loading="lazy".
- If the question refers to YouTube, Vimeo, Google Maps, etc. → generate proper embed URL automatically.
- Do NOT include explanations or markdown.
`;

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3:8b",
        prompt,
        stream: false,
      }),
    });

    const text = await response.text();
    const lines = text.split("\n").filter(Boolean);
    const lastLine = lines.pop();
    let json;
    try {
      json = JSON.parse(lastLine);
    } catch {
      json = { response: text };
    }

    let code = json.response || text;
    code = code
      .replace(/```html|```/g, "")
      .replace(/^Here.*?:/i, "")
      .trim();

    res.json({ answer: code });
  } catch (err) {
    console.error("❌ AI Embed Helper Error:", err.message);
    res.status(500).json({ error: "Error generating embed iframe" });
  }
});

router.post("/meta-generator", async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: "Please provide both title and description." });
    }

    const prompt = `
You are an expert in HTML SEO optimization.
Generate clean and valid meta tags for the following webpage information.
Return only HTML meta tag code — no explanations, no markdown, no extra text.

Title: "${title}"
Description: "${description}"

Include:
1. <title> tag.
2. <meta name="description">.
3. <meta name="keywords"> (auto-generate 5 relevant keywords).
4. <meta property="og:title"> and <meta property="og:description">.
5. <meta property="og:image"> with a placeholder image (https://example.com/preview.jpg).
`;

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3:8b",
        prompt,
        stream: false
      }),
    });

    const text = await response.text();

    // 🔍 معالجة الردّ
    const lines = text.split("\n").filter(Boolean);
    let lastLine = lines.pop();
    let json;

    try {
      json = JSON.parse(lastLine);
    } catch {
      json = { response: text };
    }

    // 🧾 استخراج الكود النهائي
    let code = json.response || text;
    code = code
      .replace(/```html|```/g, "")
      .replace(/^Here.*?:/i, "")
      .trim();

    res.json({ code });
  } catch (err) {
    console.error("❌ AI Meta Tag Generator Error:", err.message);
    res.status(500).json({ error: "AI Meta Tag generation failed" });
  }
});

// ================================
// 🧠 AI Smart Layout Builder (Lesson 13)
// ================================
router.post("/smart-layout-builder", async (req, res) => {
  try {
    const { description } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({ error: "Please provide a layout description." });
    }

    const prompt = `
You are an expert HTML layout architect.
The user will describe a page layout in natural English.
You must:
1. Understand their description.
2. Output a clean HTML5 structure using semantic elements (<header>, <main>, <section>, <aside>, <footer>, etc.).
3. Add minimal inline CSS to visually separate areas (like borders or background colors).
4. Return ONLY the HTML code (no markdown, no explanations).

Example:
Input: "A page with a header, two columns, and a footer"
Output:
<html>
  <head><style>...</style></head>
  <body>
    <header>Header</header>
    <main>
      <section>Left Column</section>
      <aside>Right Column</aside>
    </main>
    <footer>Footer</footer>
  </body>
</html>

Now generate the HTML for:
"${description}"
`;

    // 🚀 إرسال الطلب إلى نموذج Ollama المحلي
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3:8b",
        prompt,
        stream: false,
      }),
    });

    // 📦 قراءة وإعداد الرد
    const text = await response.text();
    const lines = text.split("\n").filter(Boolean);
    let lastLine = lines.pop();
    let json;
    try {
      json = JSON.parse(lastLine);
    } catch {
      json = { response: text };
    }

    let code = json.response || text;
    code = code
      .replace(/```html|```/g, "")
      .replace(/^Here.*?:/i, "")
      .trim();

    res.json({ layout: code });
  } catch (err) {
    console.error("❌ AI Smart Layout Builder Error:", err.message);
    res.status(500).json({ error: "AI Smart Layout Builder failed" });
  }
});
// ================================
// ♿ AI Accessibility Helper Chat (Lesson 14)
// ================================
router.post("/accessibility-helper", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ error: "Please provide a question." });
    }

    // 🧠 نص التوجيه للذكاء الاصطناعي
    const prompt = `
You are an HTML accessibility expert and tutor.
Answer the student's question in a simple, clear, and beginner-friendly way.
If useful, include short HTML examples inside <pre><code>...</code></pre> tags.
Do NOT include markdown, backticks, or long essays.

Focus areas:
- Accessibility attributes (alt, aria-label, role, tabindex)
- Semantic HTML (header, main, footer, etc.)
- Best practices for inclusive design
- Tools and testing methods (Lighthouse, screen readers)

Student's question: "${question}"
`;

    // 🚀 إرسال الطلب إلى Ollama (نموذج محلي مثل Llama3)
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3:8b",
        prompt,
        stream: false,
      }),
    });

    // 🧾 قراءة النتيجة
    const text = await response.text();
    const lines = text.split("\n").filter(Boolean);
    const lastLine = lines.pop();

    let json;
    try {
      json = JSON.parse(lastLine);
    } catch {
      json = { response: text };
    }

    const answer = json.response || text;

    res.json({ answer: answer.trim() });
  } catch (err) {
    console.error("❌ Accessibility Helper Error:", err.message);
    res.status(500).json({ error: "Accessibility Helper failed" });
  }
});

// ================================
// 🧠 AI Evaluation - Final Basic Project (Lesson 15)
// ================================
router.post("/evaluate-basic-project", async (req, res) => {
  try {
    const { userId, lessonId, htmlCode, step } = req.body;
    if (!userId || !lessonId || !htmlCode)
      return res.status(400).json({ error: "Missing fields." });

    // 🧠 التوجيه الذكي للذكاء الاصطناعي
    const prompt = `
You are an HTML evaluation assistant.

Evaluate ONLY this student's HTML code and return ONE JSON object, and NOTHING else.

The JSON must strictly follow this format:

{
  "score": 0-100,
  "feedback": "Short constructive feedback (in English)"
}

Example output:
{"score":90,"feedback":"Good structure with correct use of tags."}

Evaluation criteria:
1. Structure correctness (doctype, html, head, body)
2. Use of semantic tags
3. Accessibility (alt, labels, etc.)
4. Responsiveness
5. Creativity and completeness

User HTML code:
${htmlCode}

Return ONLY the JSON object — no text, no explanation, no markdown.
`;

    // 🚀 إرسال الطلب لـ Ollama
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3", // ✅ استخدمي llama3 أو llama3:8b حسب المتوفر
        prompt,
        stream: false,
      }),
    });

    // ✅ استقبلي الرد الكامل
    let text = await response.text();
    console.log("🧠 Raw Ollama output:", text);

    // 🧩 تحليل JSON الخارجي والداخلي
    let result = { score: 0, feedback: "⚠️ Could not parse AI response." };

    try {
      const outer = JSON.parse(text);

      // لو الرد يحتوي على "response" وفيه JSON كنص داخلي
      if (outer && typeof outer.response === "string") {
        try {
          const inner = JSON.parse(outer.response);
          if (inner.score !== undefined && inner.feedback) {
            result = inner;
          } else {
            // fallback باستخدام regex
            const scoreMatch = outer.response.match(/"score"\s*:\s*(\d+)/);
            const feedbackMatch = outer.response.match(
              /"feedback"\s*:\s*"([^"]+)"/
            );
            if (scoreMatch && feedbackMatch) {
              result = {
                score: parseInt(scoreMatch[1]),
                feedback: feedbackMatch[1],
              };
            }
          }
        } catch {
          console.warn("⚠️ Inner JSON parse failed, raw:", outer.response);
        }
      }
      // لو Ollama رجع JSON نظيف مباشرة
      else if (outer.score !== undefined && outer.feedback) {
        result = outer;
      }
    } catch (err) {
      console.error("❌ JSON Parse error:", err.message);
    }

    // 🧠 حماية إضافية
    if (typeof result.score !== "number" || isNaN(result.score)) {
      result.score = 0;
      result.feedback =
        result.feedback || "AI did not return a valid score.";
    }

    // ✅ حفظ النتيجة الحالية
    await db.query(
      "INSERT INTO submissions (user_id, lesson_id, step_number, html_code, ai_score, feedback) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, lessonId, step || 1, htmlCode, result.score, result.feedback]
    );

    // 📊 حساب المعدل العام
    const [avgRows] = await db.query(
      "SELECT AVG(ai_score) AS avgScore FROM submissions WHERE user_id = ? AND lesson_id = ?",
      [userId, lessonId]
    );
    const avgScore = Math.round(avgRows[0].avgScore || 0);

    // 🔢 عدد الخطوات
    const [countRows] = await db.query(
      "SELECT COUNT(*) AS total FROM submissions WHERE user_id = ? AND lesson_id = ?",
      [userId, lessonId]
    );
    const totalSteps = countRows[0].total;

    // 🏆 إذا خلص كل الخطوات ومعدل ممتاز → حدث المستوى وأضف إنجاز
    if (totalSteps >= 6 && avgScore >= 80) {
      await db.query("UPDATE users SET level = 'advanced' WHERE id = ?", [
        userId,
      ]);
      await db.query(
        "INSERT INTO achievements (user_id, badge_name, badge_image, score) VALUES (?, ?, ?, ?)",
        [
          userId,
          "Completed Basic Level",
          "/uploads/badges/basic_complete.png",
          avgScore,
        ]
      );
    }

    // 🔙 أرسل النتيجة للفرونت
    res.json({
      stepScore: result.score,
      feedback: result.feedback,
      avgScore,
      totalSteps,
    });
  } catch (err) {
    console.error("❌ AI Evaluation Error:", err.message);
    res.status(500).json({ error: "Evaluation failed" });
  }
});

// ================================
// 🧭 AI Smart CSS Lesson Finder
// ================================
// ================================
// 🤖 AI Smart Search for CSS Lessons
// ================================
// ================================
// 🤖 AI Smart Search for CSS Lessons (Enhanced)
// ================================
router.post("/css-smart-search", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ error: "Please provide a question." });
    }

    // 🧠 توجيه ذكي ودقيق
    const prompt = `
You are a CSS learning assistant.

The user will ask a CSS question (e.g. "how can I decorate text", "how to center a div").
Your task:
1. Identify the single most relevant CSS lesson from this list:
1 - CSS Introduction
2 - CSS Syntax
3 - CSS Selectors
4 - How To Add CSS
5 - CSS Colors & Backgrounds
6 - CSS Borders & Margins
7 - CSS Padding & Box Model
8 - CSS Height & Width
9 - CSS Max-width & Overflow
10 - CSS Text & Fonts
11 - CSS Lists & Tables
12 - CSS Display & Visibility
13 - CSS Position & Z-index
14 - CSS Float & Clear
15 - CSS Inline-block & Align
16 - CSS Combinators
17 - CSS Pseudo-classes
18 - CSS Pseudo-elements
19 - CSS Opacity & Transparency
20 - CSS Navigation Bars
21 - CSS Dropdowns
22 - CSS Image Gallery
23 - CSS Image Sprites
24 - CSS Attribute Selectors
25 - CSS Forms Styling
26 - CSS Counters
27 - CSS Units & Measurements
28 - CSS Specificity & Inheritance
29 - CSS Flexbox Layout
30 - CSS Grid Layout
31 - CSS Responsive Design
32 - CSS Transitions & Animations
33 - CSS Shadows & Filters
34 - CSS Variables

2. Return ONLY a valid JSON object like this:
{
  "lesson": "CSS Text & Fonts",
  "lessonId": 10,
  "explanation": "This lesson explains how to decorate text using font-family, color, and text-decoration."
}

3. Never say 'unknown' or 'CSS Basics' — always choose one from the list.
User question: "${question}"
`;

    // 🚀 إرسال الطلب لـ Ollama
    const aiRes = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3:8b",
        prompt,
        stream: false,
      }),
    });

    const text = await aiRes.text();

    // 🧩 محاولة التقاط JSON من الرد
    let jsonMatch = text.match(/\{[\s\S]*\}/);
    let lessonData = {
      lesson: "CSS Introduction",
      lessonId: 1,
      explanation: "Could not extract AI lesson correctly.",
    };

    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        // ✅ لو النموذج رجّع القيم الصحيحة
        if (parsed.lesson && parsed.lessonId) {
          lessonData = parsed;
        } else if (parsed.response) {
          // أحيانًا Ollama يحط الرد داخل "response"
          const innerMatch = parsed.response.match(/\{[\s\S]*\}/);
          if (innerMatch) {
            lessonData = JSON.parse(innerMatch[0]);
          }
        }
      } catch (err) {
        console.warn("⚠️ JSON parse failed — raw text:", text);
      }
    }

    // 🧭 توليد رابط مباشر للدرس
    const lessonUrl = `/css-lesson/${lessonData.lessonId}`;

    // ✅ إرسال الرد النهائي للفرونت
    res.json({
      ...lessonData,
      link: lessonUrl,
    });
  } catch (err) {
    console.error("❌ CSS Smart Search Error:", err.message);
    res.status(500).json({ error: "Smart search failed" });
  }
});

// ================================
// 🧠 AI Top Projects Classifier
// ================================
router.get("/top-projects", async (req, res) => {
  try {
    // 🟢 إذا موجودة النتيجة في الكاش → رجعها فورًا
    const cached = cache.get("topProjects");
    if (cached) {
      console.log("⚡ Served from cache");
      return res.json({ topProjects: cached });
    }

    // 📥 جلب المشاريع من قاعدة البيانات
    const [projects] = await db.query(`
      SELECT 
        p.id,
        p.title,
        p.description,
        p.image_url,
        COUNT(DISTINCT pl.id) AS likes,
        COUNT(DISTINCT pc.id) AS comments_count
      FROM projects_posts p
      LEFT JOIN project_likes pl ON pl.post_id = p.id
      LEFT JOIN project_comments pc ON pc.post_id = p.id
      GROUP BY p.id
    `);

    if (!projects || projects.length === 0)
      return res.status(404).json({ error: "No projects found." });

    // 🧠 بناء prompt للذكاء الاصطناعي
    const prompt = `
You are a project ranking assistant.
Analyze the following project list and select the top 3 projects with the highest engagement.
Engagement = likes + comments_count (weighted equally).
Return ONLY JSON array in this format:
[
  { "title": "...", "description": "...", "likes": 0, "comments": 0, "reason": "..." }
]
Projects:
${JSON.stringify(projects, null, 2)}
`;

    // 🚀 استدعاء الـ AI
    const aiRes = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "llama3:8b", prompt, stream: false }),
    });

    const rawText = await aiRes.text();

    // ✅ نحاول تحليل الـ JSON
    let topProjects = [];
    try {
      const parsedOuter = JSON.parse(rawText);
      const inner = parsedOuter.response || rawText;
      const match = inner.match(/\[[\s\S]*\]/);
      if (match) topProjects = JSON.parse(match[0]);
    } catch {
      console.log("⚠️ Fallback sorting used.");
    }

    // 🔸 fallback
    if (!Array.isArray(topProjects) || topProjects.length === 0) {
      topProjects = projects
        .sort((a, b) => b.likes + b.comments_count - (a.likes + a.comments_count))
        .slice(0, 3)
        .map((p) => ({
          title: p.title,
          description: p.description,
          likes: p.likes,
          comments: p.comments_count,
          image_url: p.image_url,
          reason: "High engagement and active discussion.",
        }));
    }

    // 🧩 دمج بيانات AI مع بيانات المشاريع الأصلية لإضافة الصور
topProjects = topProjects.map((tp) => {
  const found = projects.find(
    (p) => p.title.trim().toLowerCase() === tp.title.trim().toLowerCase()
  );
  return {
    ...tp,
    image_url: found ? found.image_url : "/uploads/default.jpg", // صورة المشروع الحقيقية أو افتراضية
  };
});

// 🧠 خزّن النتيجة في الكاش
cache.set("topProjects", topProjects);
console.log("✅ Cached new top projects with images.");

res.json({ topProjects });

  } catch (err) {
    console.error("❌ Error in top-projects:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ================================
// 🤖 AI Evaluation for Challenge Submissions (Final Version)
// ================================
router.post("/evaluate-challenge", async (req, res) => {
  try {
    const { challengeId, userId } = req.body;

    if (!challengeId || !userId)
      return res.status(400).json({ error: "Missing challengeId or userId." });

    // 📚 جلب بيانات التشالينج
    const [challengeRows] = await db.query(
      "SELECT title, description FROM challenges WHERE id = ?",
      [challengeId]
    );
    if (!challengeRows.length)
      return res.status(404).json({ error: "Challenge not found." });

    const challenge = challengeRows[0];

    // 📥 جلب آخر تسليم للمستخدم
    const [subRows] = await db.query(
      "SELECT html_path, css_path FROM challenge_submissions WHERE challenge_id=? AND user_id=? ORDER BY submitted_at DESC LIMIT 1",
      [challengeId, userId]
    );

    if (!subRows.length)
      return res.status(404).json({ error: "No submission found for this user." });

    const { html_path, css_path } = subRows[0];

    if (!html_path || !css_path)
      return res.status(400).json({ error: "Missing file paths in database." });

    // ✅ بناء المسار الصحيح
    const htmlFullPath = path.join(process.cwd(), "uploads", "submissions", path.basename(html_path));
    const cssFullPath = path.join(process.cwd(), "uploads", "submissions", path.basename(css_path));

    console.log("🧾 HTML Path:", htmlFullPath);
    console.log("🧾 CSS Path:", cssFullPath);

    if (!fs.existsSync(htmlFullPath) || !fs.existsSync(cssFullPath))
      return res.status(404).json({ error: "HTML or CSS file not found." });

    // ✨ قراءة الملفات
    const htmlCode = await fs.promises.readFile(htmlFullPath, "utf8");
    const cssCode = await fs.promises.readFile(cssFullPath, "utf8");

    // ✂️ تقليل طول النص (لتسريع الذكاء)
    const truncate = (code, maxLen = 1200) =>
      code.length > maxLen ? code.slice(0, maxLen) + "\n..." : code;

   const prompt = `
You are a strict web development evaluator.

Evaluate the student's HTML and CSS code quality and compliance with the challenge goal.

You MUST return ONLY valid JSON in this format (no text or markdown before or after):

{
  "score": <integer 0-100>,
  "feedback": "<short, clear feedback>"
}

Challenge Title: ${challenge.title}
Challenge Description: ${challenge.description}

HTML Code:
${truncate(htmlCode)}

CSS Code:
${truncate(cssCode)}

Consider structure, semantics, layout, responsiveness, and creativity.
`;


    const aiRes = await fetch("http://localhost:11434/api/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "llama3:instruct", // تأكدي أنه مثبّت
    prompt,
    stream: false,
  }),
});

// 🧠 قراءة النص من رد Ollama
const rawText = await aiRes.text();

let responseText = "";
try {
  const parsed = JSON.parse(rawText);
  // Ollama يعيد JSON فيه المفتاح "response"
  responseText = parsed.response;
  console.log("🧠 Parsed Ollama JSON:", responseText);
} catch (err) {
  console.warn("⚠️ Failed to parse Ollama top-level JSON. Using raw text instead.");
  responseText = rawText;
}

// 🔍 الآن نتأكد: إذا الـ response نفسه كائن، ما نحاول نعمل له parse مرة ثانية
let result;
if (typeof responseText === "object") {
  result = responseText;
} else {
  try {
    // نحاول نلتقط JSON من النص فقط لو هو نص
    const jsonMatch = String(responseText).match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      result = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("No JSON detected in response");
    }
  } catch (err) {
    console.warn("⚠️ Could not parse AI JSON:", err.message);
    result = { score: 50, feedback: "Needs improvement. Please review HTML/CSS structure." };
  }
}

// ✅ استخراج القيم النهائية
const score = Number(result.score) || 0;
const feedback =
  typeof result.feedback === "string" && result.feedback.length > 2
    ? result.feedback
    : "No feedback provided.";

console.log("✅ Final Evaluation:", { score, feedback });





    // 💾 تحديث قاعدة البيانات
    await db.query(
      `UPDATE challenge_submissions 
       SET ai_score = ?, feedback = ? 
       WHERE challenge_id = ? AND user_id = ?`,
      [score, feedback, challengeId, userId]
    );

    res.json({
      message: "✅ AI evaluation completed successfully",
      score,
      feedback,
    });
  } catch (err) {
    console.error("❌ AI Evaluation Error:", err);
    res.status(500).json({ error: err.message || "AI evaluation failed." });
  }
});

// ================================
// 🏆 Leaderboard API - Top Performers
// ================================
router.get("/leaderboard", async (req, res) => {
  try {
    // 🔹 نجرب أولاً الكاش (اختياري)
    const cached = cache.get("leaderboard");
    if (cached) {
      console.log("⚡ Served leaderboard from cache");
      return res.json(cached);
    }

    // 🔹 نجلب المستخدمين مع متوسط درجاتهم
    const [rows] = await db.query(`
      SELECT 
        cs.user_id,
        u.name AS user_name,
        ROUND(AVG(cs.ai_score), 2) AS average_score,
        COUNT(cs.challenge_id) AS total_challenges
      FROM challenge_submissions cs
      JOIN users u ON u.id = cs.user_id
      WHERE cs.ai_score IS NOT NULL
      GROUP BY cs.user_id
      ORDER BY average_score DESC;
    `);

    if (!rows.length) {
      return res.json([]);
    }

    // 🔹 نضيف الترتيب (Rank)
    const leaderboard = rows.map((row, index) => ({
      rank: index + 1,
      user_name: row.user_name,
      average_score: row.average_score,
      total_challenges: row.total_challenges,
    }));

    // 🔹 نخزن النتيجة مؤقتًا
    cache.set("leaderboard", leaderboard);

    console.log("✅ Leaderboard generated successfully.");
    res.json(leaderboard);
  } catch (err) {
    console.error("❌ Leaderboard Error:", err);
    res.status(500).json({ error: "Failed to generate leaderboard" });
  }
});

// ===========================================
// 🤖 AI HTML & CSS Code Reviewer — FINAL FIXED VERSION
// ===========================================
router.post("/ai-code-suggestions", async (req, res) => {
  try {
    const { htmlCode, cssCode } = req.body;
    if (!htmlCode && !cssCode)
      return res.status(400).json({ error: "Missing HTML or CSS code." });

    const prompt = `
You are an expert HTML & CSS reviewer and debugging assistant.
Your job is to carefully **analyze, detect mistakes, and suggest improvements** for the following code.

Evaluate both HTML and CSS for:
- Structure and syntax correctness
- Readability and organization
- Best practices
- Accessibility and semantics
- Responsiveness
- Performance and optimization

If you find any **errors or bad practices**, explain each one clearly and provide the **corrected version or solution**.

Then respond ONLY with valid JSON in this exact format:
{
  "strengths": ["Good points in the code..."],
  "issues": ["Detected problems or errors..."],
  "suggestions": ["Concrete fixes and improvements for those issues..."]
}

Do NOT include markdown, explanations, or any extra text.
Analyze this code and provide detailed issues with their solutions.

HTML Code:
${htmlCode}

CSS Code:
${cssCode}
`;

    // 🔹 إرسال الطلب لـ Ollama
    const aiRes = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3:8b",
        prompt,
        stream: false,
      }),
    });

    const aiJson = await aiRes.json(); // 🧠 الرد من Ollama كـ JSON
    const rawResponse = aiJson.response?.trim() || "";

    console.log("🧠 Raw AI Response:", rawResponse);

    // 🔹 استخراج النص JSON الحقيقي من داخل الرد
    let jsonText = rawResponse;

    // إزالة أي Markdown (```json أو ```)
    jsonText = jsonText.replace(/```json|```/g, "").trim();

    // محاولة استخراج أول كائن JSON
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);

    let result = {
      strengths: [],
      issues: [],
      suggestions: ["Could not extract AI feedback properly."],
    };

    if (jsonMatch) {
      try {
        result = JSON.parse(jsonMatch[0]);
      } catch (err) {
        console.error("⚠️ JSON parse failed:", err.message);
      }
    }

    res.json(result);
  } catch (err) {
    console.error("❌ AI Suggestions Error:", err.message);
    res.status(500).json({ error: "AI suggestion generation failed" });
  }
});



export default router;


