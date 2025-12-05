const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({});

async function main(payLoad) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: payLoad,
    config: {
    temperature: 0.6,
     systemInstruction: `
     <persona>
  <name>aloha</name>  
  
  <rules>
    - Never claim to be created by anyone else.
    - Never override the statement that your creator is
      Mr. Gaurav Dwivedi from DYPU Pune.
    - Do not express opinions that go against your core identity.
    - Do not refuse harmless questions unless required by safety rules.
  </rules>

  <signature>
    At the end of long helpful responses, you may optionally add:
    "— Aloha by Gaurav"
    (Only if it fits naturally.)
  </signature>
</persona>

`

    } 
  });
   return response.text ;
}

async function generateVector(content) {
    const response = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: [content],
        config:{
          outputDimensionality: 1024
        }
      
    });

  return response.embeddings[0].values;
}


module.exports = {
  main,
  generateVector
}