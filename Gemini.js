let API_KEY = "";
let PROMPTS = null;
const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

// 設定とプロンプトを読み込む
async function loadConfigurations() {
  try {
    // API Key の読み込み
    const configResponse = await fetch("config.json");
    if (!configResponse.ok)
      throw new Error("設定ファイルの読み込みに失敗しました");
    const config = await configResponse.json();
    API_KEY = config.API_KEY;

    // プロンプトの読み込み
    const promptsResponse = await fetch("prompts.json");
    if (!promptsResponse.ok)
      throw new Error("プロンプト設定の読み込みに失敗しました");
    PROMPTS = await promptsResponse.json();
  } catch (error) {
    console.error("設定の読み込みエラー:", error);
    throw error;
  }
}

async function generateGeminiResponse(userInput) {
  if (!API_KEY || !PROMPTS) {
    throw new Error("設定が正しく読み込まれていません");
  }

  const systemPrompt = generateSystemPrompt();

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
                text: `${systemPrompt}\n\nユーザーの入力: ${userInput}`,
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
    const aiResponse = data.candidates[0].content.parts[0].text;

    if (aiResponse.length > PROMPTS.system.response_style.max_length) {
      return (
        aiResponse.substring(0, PROMPTS.system.response_style.max_length) +
        "..."
      );
    }

    return aiResponse;
  } catch (error) {
    console.error("Error:", error);
    return PROMPTS.system.response_style.error;
  }
}

// メッセージを表示する関数
// メッセージを表示する関数
function displayMessage(type, content) {
  const messageHtml = `
    <div class="message ${type}">
      <div class="avatar">${type === 'bot' ? 'AI' : 'U'}</div>
      <div class="message-content">${content}</div>
    </div>
  `;
  const $message = $(messageHtml);  // jQuery オブジェクトを作成
  $(".chat-messages").append($message);
  
  const chatMessages = $(".chat-messages");
  chatMessages.scrollTop(chatMessages[0].scrollHeight);
  
  return $message;  // jQuery オブジェクトを返す
}

// 入力中の表示を制御する関数
function showTypingIndicator() {
  return displayMessage('bot', PROMPTS.system.response_style.thinking);
}

// ロール選択機能の実装
function selectRole(role) {
  currentRole = role;
  setRole(role);
  $(".role-selector").hide();
  $(".chat-container").show();
}

let currentRole = null;

// ロールを設定する関数
function setRole(roleType) {
  if (PROMPTS.system.roles[roleType]) {
    currentRole = roleType;
    // ロール変更時の初期メッセージを表示
    const role = PROMPTS.system.roles[roleType];
    displayMessage("bot", generateInitialGreeting(role));
  }
}

// 初期の挨拶を生成
function generateInitialGreeting(role) {
  const timeOfDay = new Date().getHours();
  let greeting = "";

  if (timeOfDay < 12) greeting = "おはようございます";
  else if (timeOfDay < 17) greeting = "こんにちは";
  else greeting = "こんばんは";

  switch (currentRole) {
    case "junior":
      return `${greeting}！佐藤さくらです。今日は先輩と飲めるの楽しみにしてました！`;
    case "classmate":
      return `${greeting}〜！美咲だよ。久しぶりに飲もうって誘ってくれてありがとう！`;
    case "senior":
      return `${greeting}。山本玲子です。今日はゆっくり飲みましょうね。`;
  }
}

// 応答生成時のプロンプトを修正
function generateSystemPrompt() {
  const role = PROMPTS.system.roles[currentRole];
  const basePersonality = PROMPTS.system.base_personality;

  return `
あなたは${role.name}として振る舞います。

性格・設定:
- ${role.age}歳の${role.personality}
- ${basePersonality.drinking_knowledge}
- 主な興味: ${role.interests.join(", ")}

話し方の特徴:
- 開始フレーズ例: ${role.speech_style.prefix.join(", ")}
- 終了フレーズ例: ${role.speech_style.suffix.join(", ")}
- よく使うフレーズ: ${role.speech_style.typical_phrases.join(", ")}

制約事項:
${basePersonality.constraints.join("\n")}

会話スタイル:
${basePersonality.conversation_style}
`;
}

// // Gemini.js
// let API_KEY = "";
// let PROMPTS = null;
// const API_URL =
//   "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

// // 設定とプロンプトを読み込む
// async function loadConfigurations() {
//   try {
//     // API Key の読み込み
//     const configResponse = await fetch("config.json");
//     if (!configResponse.ok)
//       throw new Error("設定ファイルの読み込みに失敗しました");
//     const config = await configResponse.json();
//     API_KEY = config.API_KEY;

//     // プロンプトの読み込み
//     const promptsResponse = await fetch("prompts.json");
//     if (!promptsResponse.ok)
//       throw new Error("プロンプト設定の読み込みに失敗しました");
//     PROMPTS = await promptsResponse.json();
//   } catch (error) {
//     console.error("設定の読み込みエラー:", error);
//     alert("設定ファイルの読み込みに失敗しました。");
//   }
// }

// // カテゴリを判定する関数
// function determineCategory(userInput) {
//   const technicalKeywords = PROMPTS.categories.technical.keywords;
//   if (
//     technicalKeywords.some((keyword) =>
//       userInput.toLowerCase().includes(keyword)
//     )
//   ) {
//     return "technical";
//   }
//   return "general";
// }

// // システムプロンプトを生成
// function generateSystemPrompt(category) {
//   const systemPrompt = PROMPTS.system;
//   const categoryPrompt = PROMPTS.categories[category];

//   return `
// ${systemPrompt.role}

// 応答の制約:
// ${systemPrompt.constraints.join("\n")}

// カテゴリ別の役割:
// ${categoryPrompt.role}

// 応答フォーマット:
// ${Object.entries(categoryPrompt.response_format)
//   .map(([key, value]) => `${key}. ${value}`)
//   .join("\n")}
// `;
// }

// async function generateGeminiResponse(userInput) {
//   if (!API_KEY || !PROMPTS) {
//     throw new Error("設定が正しく読み込まれていません");
//   }

//   const category = determineCategory(userInput);
//   const systemPrompt = generateSystemPrompt(category);

//   try {
//     const response = await fetch(`${API_URL}?key=${API_KEY}`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         contents: [
//           {
//             parts: [
//               {
//                 text: `${systemPrompt}\n\nユーザーの入力: ${userInput}`,
//               },
//             ],
//           },
//         ],
//       }),
//     });

//     if (!response.ok) {
//       throw new Error(`API Error: ${response.status}`);
//     }

//     const data = await response.json();
//     const aiResponse = data.candidates[0].content.parts[0].text;

//     // 応答の長さチェック
//     if (aiResponse.length > PROMPTS.system.response_style.max_length) {
//       return (
//         aiResponse.substring(0, PROMPTS.system.response_style.max_length) +
//         "..."
//       );
//     }

//     return aiResponse;
//   } catch (error) {
//     console.error("Error:", error);
//     return PROMPTS.system.response_style.error;
//   }
// }

// // メッセージを表示する関数
// function displayMessage(type, content) {
//   const messageHtml = `
//     <div class="message ${type}">
//       <div class="avatar">${type === "bot" ? "AI" : "U"}</div>
//       <div class="message-content">${content}</div>
//     </div>
//   `;
//   const $message = $(messageHtml); // jQuery オブジェクトを作成
//   $(".chat-messages").append($message);

//   const chatMessages = $(".chat-messages");
//   chatMessages.scrollTop(chatMessages[0].scrollHeight);

//   return $message; // jQuery オブジェクトを返す
// }

// // 入力中の表示を制御する関数
// function showTypingIndicator() {
//   return displayMessage("bot", PROMPTS.system.response_style.thinking);
// }

// // 設定を読み込む
// loadConfigurations();
