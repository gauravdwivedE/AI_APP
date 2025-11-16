const Groq  = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {
  const chatCompletion = await getGroqChatCompletion();
  // Print the completion returned by the LLM.
  console.log(chatCompletion.choices[0]?.message?.content || "");
}

async function getGroqChatCompletion() {
  return groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: "what is ai",
      },
    ],
    model: "openai/gpt-oss-20b",
  });
}

module.exports = {
    main,
    getGroqChatCompletion
}