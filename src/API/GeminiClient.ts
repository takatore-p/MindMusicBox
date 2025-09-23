import { GoogleGenerativeAI } from "@google/generative-ai";

// VITE_プレフィックス付きの環境変数を読み込む
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("VITE_GEMINI_API_KEY 環境変数が設定されていません。");
}

const ai = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function getGeminiRecommendedSong(prompt: string) {
  try {
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const lines = text.split('\n');
    const titleLine = lines.find(line => line.includes("タイトル:"));
    const artistLine = lines.find(line => line.includes("アーティスト:"));
    const moodLine = lines.find(line => line.includes("雰囲気:"));

    const title = titleLine ? titleLine.split(':')[1].trim().replace(/^"|"$/g, '') : '未知の曲';
    const artist = artistLine ? artistLine.split(':')[1].trim().replace(/^"|"$/g, '') : '未知のアーティスト';
    const mood = moodLine ? moodLine.split(':')[1].trim().replace(/^"|"$/g, '') : '不明';

    return { title, artist, mood };

  } catch (error) {
    console.error("コンテンツ生成エラー:", error);
    throw new Error("Gemini APIからの楽曲取得に失敗しました。");
  }
}