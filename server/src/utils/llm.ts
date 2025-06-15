import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import dotenv from 'dotenv';
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { SerpAPILoader } from "@langchain/community/document_loaders/web/serpapi";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import puppeteer from 'puppeteer';
import {HumanMessage} from '@langchain/core/messages';
import { tool } from "@langchain/core/tools";

dotenv.config();

// Initialize the model
const model = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o-mini",
    temperature: 0.5
  });

  const embeddings = new OpenAIEmbeddings();


  const tools = [
    tool(
      searchAndProcess,
      {
        name: "searchAndProcess",
        description: "Use this when a user asks a question that requires real-time information from the web. This tool takes the user's full message and a search phrase (a concise web-friendly keyword version of the message) and returns an answer.",
        schema: {
          type: "object",
          properties: {
          message: { type: "string", description: "The message from the user to be used to search the web" },
          searchPhrase: { type: "string", description: "A concise search phrase to query real-time web data.The searchPhrase should avoid pronouns and focus on the key search terms from the message. IMPORTANT: The web search api only takes the phrase in the form with + sign between words. For example, if the message is 'I want to visit the Eiffel Tower', the searchPhrase should be 'I+want+to+visit+the+Eiffel+Tower'." },
          },
          required: ["message", "searchPhrase"],
        }
      }
    )
  ];

  const agent = model.bindTools(tools);

  ////////////////////////
  ////////////////////////
  ////////////////////////
  ////////////////////////

export async function webSearch(query: string) {
    try {
      const loader = new SerpAPILoader({
        q: query,
        apiKey: process.env.SERPAPI_API_KEY
      });
      
      const docs = await loader.load();
  
      const links = docs.map(doc => {
        const content = doc.pageContent;
        const match = content.match(/https?:\/\/[^\s"']+/g);
        return match ? match[0] : null;
      })
      .filter(link => link && !link.includes('youtube.com') && !link.includes('youtu.be') && !link.includes('tripadvisor.com'))
      .filter(Boolean)
      .slice(0, 4);
  
      const browser = await puppeteer.launch({ headless: true });
      const allDocs: {pageContent: string, metadata: {link: string}}[] = [];
  
      for (const link of links) {
        try {
          const page = await browser.newPage();
          await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
          await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });
          await page.goto(link as string, { waitUntil: 'domcontentloaded', timeout: 30000 });
  
          // Extract only the visible text from the <body>
          let content = await page.evaluate(() => {
                return document.body.innerText;
          });
          // Limit to 1000 characters
          if (content.length > 1000) {
            content = content.slice(500, 2000);
          }
          if (content && content.trim().length > 0) {
            console.log(content);
            allDocs.push({
              pageContent: content as string,
              metadata: { link: link as string }
            });
          }
          await page.close();
        } catch (err) {
          console.warn(`Failed to load ${link}:`, err);
        }
      }
  
      await browser.close();
      return allDocs;
    } catch (err) {
      return [];
    }
  }


  ////////////////////////
  ////////////////////////
  ////////////////////////
  ////////////////////////

export async function searchAndProcess(input: unknown) {
  const { message, searchPhrase } = input as { message: string, searchPhrase: string };

  //this function takes the search phrase and the message from the user and returns the answer to the user's question
  const searchResults = await webSearch(searchPhrase);
  console.log(searchResults);
  const vectorStore = await MemoryVectorStore.fromDocuments(searchResults, embeddings);

  const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are a helpful travel assistant. You are being fed with real time information from another api call. Because of that you have access to real time information. The search results are: {context}. The search result may contains information that is not relevant to the user's question. So you need to be careful and only use the information that is relevant to the user's question."],
      ["user", "{input}"]
  ]);

  const combineDocsCHain = await createStuffDocumentsChain({
      llm: model, 
      prompt: prompt,
  });

  const chain = await createRetrievalChain({
    retriever: vectorStore.asRetriever(),
    combineDocsChain: combineDocsCHain
  });
  const response = await chain.invoke({input: message});    
  return response;
}


  ////////////////////////
  ////////////////////////
  ////////////////////////
  ////////////////////////
    


export async function llmHead(planId: string, message: string) {
  const response = await agent.invoke([new HumanMessage(message)]);

  // Check if a tool call was requested
  if (response.tool_calls && response.tool_calls.length > 0) {
    for (const toolCall of response.tool_calls) {
      if (toolCall.name === "searchAndProcess") {
        // Actually call your function with the args
        const toolResult = await searchAndProcess(toolCall.args);
        // Optionally, you can now send this result back to the LLM for a final answer
        return toolResult;
      }
    }
  }
  return {
    answer: "I cannot answer that question. Please try again."
  };
}

export default model;