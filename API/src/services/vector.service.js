// Import the Pinecone library
const { Pinecone } = require('@pinecone-database/pinecone')

// Initialize a Pinecone client with your API key
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

const aiAiIndex =  pc.index('ai-app');


async function createMemory({vectors, metadata, messageId}) {
     await aiAiIndex.upsert([{
        id: messageId,
        values: vectors,
        metadata
    }])
}

async function queryMemory({queryVectors, limit = 5,  metadata}) {
    const data = await aiAiIndex.query({
        vector: queryVectors,
        topK: limit,
        filter: metadata ? {metadata} : undefined,
        includeMetadata: true
    })

    console.log(
        data.matches
    );
}

module.exports = {
    queryMemory,
    createMemory
}