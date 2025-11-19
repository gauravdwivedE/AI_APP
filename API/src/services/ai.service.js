const Groq  = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main(chatHistory) {
  const chatCompletion = await getGroqChatCompletion(chatHistory);
  // return the completion returned by the LLM.
  return chatCompletion.choices[0]?.message?.content || "";
}

async function getGroqChatCompletion(chatHistory) {
  return groq.chat.completions.create({
    messages: chatHistory,
    model: "openai/gpt-oss-20b",
  });
}

module.exports = {
    main,
    getGroqChatCompletion
}