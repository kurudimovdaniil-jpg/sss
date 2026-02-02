const chatMessages = document.getElementById("chatMessages");
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const useApi = document.getElementById("useApi");
const apiStatus = document.getElementById("apiStatus");
const chatStatus = document.getElementById("chatStatus");

const botName = "Проект-Бот";
const history = [];
const historyLimit = 8;

const replies = [
  {
    keywords: ["привет", "здравствуй", "добрый"],
    text: "Здравствуйте! Рад помочь с вашим проектом. Спросите, что вас интересует.",
  },
  {
    keywords: ["как дела", "как ты"],
    text: "Спасибо, у меня всё отлично. Я работаю локально и всегда готов к диалогу.",
  },
  {
    keywords: ["что умеешь", "возможности", "функции"],
    text: "Я отвечаю по заранее заданным правилам. Можно добавить больше сценариев в script.js.",
  },
  {
    keywords: ["верцел", "vercel", "хостинг"],
    text: "Проект размещается на Vercel бесплатно как статический сайт. Сервер не требуется.",
  },
  {
    keywords: ["гитхаб", "github", "репозиторий"],
    text: "Код хранится в публичном репозитории GitHub. Это удобно для контроля версий.",
  },
  {
    keywords: ["проект", "школа", "индивидуальный"],
    text: "Этот сайт отлично подходит для школьного проекта: простая логика и наглядный результат.",
  },
  {
    keywords: ["спасибо", "благодар"],
    text: "Пожалуйста! Если нужно, могу подсказать, как улучшить дизайн или диалоги.",
  },
];

const fallbackReplies = [
  "Интересный вопрос! Я могу ответить в рамках заранее заданных правил.",
  "Давайте уточним: вы хотите узнать про код, размещение или возможности бота?",
  "Я пока работаю по простым сценариям, но меня легко расширить.",
];

function addMessage(text, sender) {
  const message = document.createElement("div");
  message.classList.add("message", sender);
  message.textContent = text;
  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  requestAnimationFrame(() => message.classList.add("appear"));
}

function findReply(message) {
  const lower = message.toLowerCase();

  for (const rule of replies) {
    if (rule.keywords.some((word) => lower.includes(word))) {
      return rule.text;
    }
  }

  const index = Math.floor(Math.random() * fallbackReplies.length);
  return fallbackReplies[index];
}

function botReply(userMessage) {
  const response = findReply(userMessage);
  addMessage(response, "bot");
  history.push({ role: "assistant", content: response });
}

function initGreeting() {
  addMessage(
    `Здравствуйте! Я ${botName}. Локальный режим работает сразу, а OpenAI можно подключить отдельно.`,
    "bot"
  );
}

function updateModeStatus() {
  if (useApi.checked) {
    chatStatus.textContent = "Онлайн • пробуем OpenAI";
  } else {
    chatStatus.textContent = "Онлайн • отвечает локально";
  }
}

async function getApiReply(userMessage) {
  const payload = {
    message: userMessage,
    history: history.slice(-historyLimit),
  };

  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const reason = errorData.error || "Ошибка API";
    throw new Error(reason);
  }

  const data = await response.json();
  return data.reply || "Извините, я не получил ответ от API.";
}

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = userInput.value.trim();
  if (!text) return;

  addMessage(text, "user");
  history.push({ role: "user", content: text });
  userInput.value = "";

  if (useApi.checked) {
    try {
      const reply = await getApiReply(text);
      addMessage(reply, "bot");
      history.push({ role: "assistant", content: reply });
      apiStatus.textContent = "API: подключено";
    } catch (error) {
      apiStatus.textContent = "API: ошибка";
      addMessage("OpenAI недоступен. Переключаюсь на локальный режим.", "bot");
      setTimeout(() => botReply(text), 200);
    }
  } else {
    setTimeout(() => botReply(text), 400);
  }
});

initGreeting();
updateModeStatus();
useApi.addEventListener("change", updateModeStatus);
