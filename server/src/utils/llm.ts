import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import dotenv from 'dotenv';
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { SerpAPILoader } from "@langchain/community/document_loaders/web/serpapi";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import puppeteer from 'puppeteer-core';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { ChatMessageHistory } from "langchain/stores/message/in_memory";
import { tool } from "@langchain/core/tools";

import { addMessageToPlan, getPlanMessageHistory, getPlan, getUserIdFromPlan } from '../models/plan.model.js';
import { getUserById } from '../models/user.model.js';
import { createCalendarEvents, CalendarEvent } from '../services/calendarService.js';

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
        description: "Use this tool to find information about places, activities, recommendations, or any other information not present in the current travel plan. It's the best tool for answering questions like 'what are some good restaurants in Kyoto?' or 'what's the weather like in Tokyo?'.",
        schema: {
          type: "object",
          properties: {
          message: { type: "string", description: "The message from the user to be used to search the web" },
          searchPhrase: { type: "string", description: "A concise search phrase to query real-time web data. This search phrase should consider my travel plan and the message from the user. My travel plan is: {planContent}. The searchPhrase should avoid pronouns and focus on the key search terms from the message. IMPORTANT: The web search api only takes the phrase in the form with + sign between words. For example, if the message is 'I want to visit the Eiffel Tower', the searchPhrase should be 'I+want+to+visit+the+Eiffel+Tower'." },
          },
          required: ["message", "searchPhrase"],
        }
      }),
      tool(
        calendarToolWrapper,
        {
            name: "create_calendar_events",
            description: "Use this tool to create one or more events in the user's Google Calendar. From the user's request, extract event details like title, description, a precise start time, and a precise end time. The current year is 2025 unless otherwise specified.",
            schema: {
                type: "object",
                properties: {
                    events: {
                        type: "array",
                        description: "An array of one or more event objects to be created.",
                        items: {
                            type: "object",
                            properties: {
                                title: { type: "string", description: "The title of the calendar event." },
                                description: { type: "string", description: "A detailed description for the event, based on the conversation." },
                                startTime: { type: "string", description: "The event start time in ISO 8601 format (e.g., '2025-07-04T09:00:00-07:00')." },
                                endTime: { type: "string", description: "The event end time in ISO 8601 format (e.g., '2025-07-04T17:00:00-07:00')." }
                            },
                            required: ["title", "description", "startTime", "endTime"]
                        }
                    }
                },
                required: ["events"]
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
      console.log("Got into webSearch");
      const loader = new SerpAPILoader({
        q: query,
        apiKey: process.env.SERPAPI_API_KEY
      });
      console.log("Loaded the loader");
      const docs = await loader.load();
      console.log("Loaded the docs");
      const links = docs.map(doc => {
        const content = doc.pageContent;
        const match = content.match(/https?:\/\/[^\s"']+/g);
        return match ? match[0] : null;
      })
      .filter(link => link && !link.includes('youtube.com') && !link.includes('youtu.be') && !link.includes('tripadvisor.com'))
      .filter(Boolean)
      .slice(0, 4);
      console.log("Got the links:", links);
      
      // If no links found, return empty array
      if (links.length === 0) {
        console.log("No valid links found, returning empty results");
        return [];
      }

      let browser;
      try {
        console.log("Attempting to launch browser...");
        
        browser = await puppeteer.launch({ 
          headless: true,
          executablePath: '/usr/bin/google-chrome-stable',
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--disable-extensions',
            '--disable-plugins',
            '--disable-images',
            '--disable-javascript',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding'
          ],
          timeout: 30000,
          protocolTimeout: 30000
        });
        console.log("Successfully launched the browser");
      } catch (browserError) {
        console.error("Failed to launch browser:", browserError);
        // Try alternative Chrome path
        try {
          console.log("Trying alternative Chrome path...");
          browser = await puppeteer.launch({ 
            headless: true,
            executablePath: '/usr/bin/chromium-browser',
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-gpu'
            ]
          });
          console.log("Successfully launched browser with chromium");
        } catch (altError) {
          console.error("Alternative browser launch also failed:", altError);
          // Fallback: return the raw search results without scraping
          console.log("Falling back to raw search results");
          return docs.map(doc => ({
            pageContent: doc.pageContent.slice(0, 2000), // Limit to 2000 characters to avoid token limits
            metadata: { link: 'search_result' }
          }));
        }
      }

      const allDocs: {pageContent: string, metadata: {link: string}}[] = [];
      console.log("Created the allDocs array");
      
      for (const link of links) {
        try {
          console.log(`Processing link: ${link}`);
          const page = await browser.newPage();
          
          // Set timeouts for the page
          page.setDefaultTimeout(30000);
          page.setDefaultNavigationTimeout(30000);
          
          await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
          await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });
          
          // Block unnecessary resources to speed up loading
          await page.setRequestInterception(true);
          page.on('request', (req) => {
            if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
              req.abort();
            } else {
              req.continue();
            }
          });
          
          await page.goto(link as string, { 
            waitUntil: 'domcontentloaded', 
            timeout: 30000 
          });
          console.log("Navigated to the link");
          
          // Wait a bit for content to load
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Extract only the visible text from the <body>
          let content = await page.evaluate(() => {
                return document.body.innerText;
          });
          console.log("Extracted the content");
          
          // Limit to 1000 characters
          if (content.length > 1000) {
            content = content.slice(500, 2000);
          }
          console.log("Limited the content");
          
          if (content && content.trim().length > 0) {
            console.log("first 1000 characters of the content:")
            console.log(content);
            allDocs.push({
              pageContent: content as string,
              metadata: { link: link as string }
            });
            console.log("Added the content to the allDocs array");
          }
          
          await page.close();
          console.log("Closed the page");
        } catch (err) {
          console.warn(`Failed to load ${link}:`, err);
        }
      }
      
      console.log("Closing the browser");
      await browser.close();
      console.log("Closed the browser");
      
      // If we couldn't scrape any content, fall back to raw search results
      if (allDocs.length === 0) {
        console.log("No content scraped, falling back to raw search results");
        return docs.map(doc => ({
          pageContent: doc.pageContent.slice(0, 2000), // Limit to 2000 characters to avoid token limits
          metadata: { link: 'search_result' }
        }));
      }
      
      return allDocs;
    } catch (err) {
      console.error("Error in webSearch:", err);
      return [];
    }
  }

  ////////////////////////
  ////////////////////////
  ////////////////////////
  ////////////////////////




  export async function searchAndProcess(input: unknown) {
    const { message, searchPhrase } = input as { message: string, searchPhrase: string };

    // This function takes the search phrase and the message from the user and returns the answer to the user's question
    const searchResults = await webSearch(searchPhrase);
    
    // Filter and limit search results to prevent token limit issues
    const limitedResults = searchResults.slice(0, 3).map(doc => ({
      ...doc,
      pageContent: doc.pageContent.slice(0, 1500) // Further limit to 1500 characters per document
    }));
    
    const vectorStore = await MemoryVectorStore.fromDocuments(limitedResults, embeddings);

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are a helpful and conversational research assistant. Your task is to answer the user's question in a natural and engaging way, based *only* on the provided context. \n\n- Synthesize the information from the context into a clear and easy-to-read answer.\n- Do not just list facts; present the information as if you are having a conversation.\n- If the context does not contain the answer, simply state that you couldn't find much information on that topic.\n\nContext:\n{context}"],
      ["user", "{input}"],
    ]);

    const combineDocsChain = await createStuffDocumentsChain({
      llm: model,
      prompt: prompt,
    });

    const chain = await createRetrievalChain({
      retriever: vectorStore.asRetriever(),
      combineDocsChain: combineDocsChain,
    });

    const response = await chain.invoke({ input: message });
    
    // The 'answer' is the key part of the response from the retrieval chain
    const finalAnswer = response.answer || "I was unable to find specific information regarding your question from the search results.";

    return { answer: finalAnswer };
  }




  ////////////////////////
  ////////////////////////
  ////////////////////////
  ////////////////////////


  async function calendarToolWrapper(input: unknown): Promise<string> {
    const { events, planId } = input as { events: CalendarEvent[], planId: string };
    if (!events || !planId) {
        return "Tool was called incorrectly. The 'events' array and 'planId' are required.";
    }
    try {
      const userId = await getUserIdFromPlan(planId);
      if (!userId) {
        return "Failed to find user for this plan. Cannot create event.";
      }
      const user = await getUserById(userId);
      if (!user) {
        return "User not found.";
      }

       if (!user.refreshToken) {
            return "User has not granted calendar permissions. Please log out and log back in to authorize.";
        }
      const result = await createCalendarEvents(user, events);
      return result.message;
    } catch (error: any) {
      console.error("Error in calendar tool wrapper:", error);
      return `Failed to create calendar event: ${error.message}`;
    }
  }
    


export async function llmHead(planId: string, message: string) {
  try {
    // Get the user's travel plan content for context
    const planContent = await getPlan(planId);
    if (!planContent) {
      // This should ideally not happen if a plan exists, but it's a safe check
      return { answer: "I could not find the details of your travel plan. Please ensure one is selected." };
    }

    // Get all previous messages
    const previousMessages = await getPlanMessageHistory(planId);

    // Create the system message with the travel plan as context
    const systemMessage = `You are a helpful and highly personalized travel assistant. 
    Your primary goal is to help the user with their current travel plan: "${planContent}".
    
    Always use the travel plan as your main source of context for answering questions.
    However, if the user asks about something that is not in their plan (like a different city, new activities, or general questions), you should use the available tools to find an answer for them. Be proactive and helpful.`;

    // Add the new human message to the array
    const messagesForLLM = [
        new AIMessage({ content: systemMessage }), // Prepend the context as a system message
        ...previousMessages, 
        new HumanMessage(message)
    ];

    // Send the full history and context to the agent
    const response = await agent.invoke(messagesForLLM);

    // Now store the new human message in the database history
    await addMessageToPlan(planId, 'human', message);

    // Check if a tool call was requested
    if (response.tool_calls && response.tool_calls.length > 0) {
      let toolResults = [];
      for (const toolCall of response.tool_calls) {
        console.log("LLM wants to call tool:", toolCall.name, "with args:", toolCall.args);
        
        let toolResult;
        switch (toolCall.name) {
          case "searchAndProcess":
            toolResult = await searchAndProcess(toolCall.args);
            await addMessageToPlan(planId, 'ai', toolResult.answer);
            break;
          case "create_calendar_events":
            toolResult = await calendarToolWrapper({ ...toolCall.args, planId });
            await addMessageToPlan(planId, 'ai', toolResult);
            break;
          default:
            console.warn(`Unknown tool call: ${toolCall.name}`);
            continue;
        }
        toolResults.push(toolResult);
      }
      if (toolResults.length > 0) {
        return { answers: toolResults };
      }
    }
    
    // Handle direct responses when no tool is called
    const directResponse = response.content || "I cannot answer that question. Please try again.";
    await addMessageToPlan(planId, 'ai', directResponse as string);
    
    return {
      answer: directResponse
    };
  } catch (error) {
    console.error('Error in llmHead:', error);
    return {
      answer: "Sorry, I encountered an error. Please try again."
    };
  }
}

// Function to get message history for a plan





export default model;

// Tool Wrapper for Calendar

