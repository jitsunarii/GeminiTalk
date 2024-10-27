// Gemini.js
let API_KEY = "";
const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

// 設定ファイルを読み込む関数
async function loadConfig() {
  try {
    const response = await fetch("config.json");
    if (!response.ok) {
      throw new Error("設定ファイルの読み込みに失敗しました");
    }
    const config = await response.json();
    API_KEY = config.API_KEY;
  } catch (error) {
    console.error("設定の読み込みエラー:", error);
    alert("APIキーの設定が読み込めません。config.jsonを確認してください。");
  }
}

async function generateGeminiResponse(userInput) {
  if (!API_KEY) {
    throw new Error("APIキーが設定されていません");
  }

  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: userInput,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Error:", error);
    return "申し訳ありません。エラーが発生しました。";
  }
}

// 設定を読み込む
loadConfig();