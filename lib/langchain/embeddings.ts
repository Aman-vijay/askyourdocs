import { OpenAIEmbeddings } from "@langchain/openai";
import { env } from "../env";

export const embeddings = new OpenAIEmbeddings({
  openAIApiKey: env.OPENAI_API_KEY,
  modelName: "text-embedding-3-small",
});
