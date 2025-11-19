const Groq  = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main(payload) {
  const chatCompletion = await getGroqChatCompletion(payload);
  // return the completion returned by the LLM.
  return chatCompletion.choices[0]?.message?.content || "";
}

async function getGroqChatCompletion(payload) {
  return groq.chat.completions.create({
    messages: [
     {
      role: payload.role,
      content: payload.content
     }

    ],
    model: "openai/gpt-oss-20b",
  });
}

module.exports = {
    main,
    getGroqChatCompletion
}