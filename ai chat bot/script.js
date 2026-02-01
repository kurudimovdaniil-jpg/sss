const chatMessages = document.getElementById("chatMessages");
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");

const botName = "Проект-Бот";

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
}

function initGreeting() {
  addMessage(
    `Здравствуйте! Я ${botName}. Напишите сообщение, и я отвечу локально без API.`,
    "bot"
  );
}

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = userInput.value.trim();
  if (!text) return;

  addMessage(text, "user");
  userInput.value = "";

  setTimeout(() => botReply(text), 400);
});

initGreeting();
