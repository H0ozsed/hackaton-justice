// Builds the IRIS index ahead of time (embeddings of the site content), so the
// first question does not wait for it. Optional: the app also builds it on the
// first question. Needs Ollama running (see README, "IRIS chatbot").
import { buildChunks } from '@/server/domains/chatbot/chunks'
import { getKnowledgeIndex } from '@/server/domains/chatbot/knowledge'
import { ollamaConfig, OllamaUnavailableError } from '@/server/domains/chatbot/ollama'

/* eslint-disable no-console -- CLI output */
async function main() {
  const config = ollamaConfig()
  const started = Date.now()
  try {
    const index = await getKnowledgeIndex(config)
    console.log(
      `IRIS index ready: ${index.chunks.length} chunks (model ${config.embedModel}, ` +
        `key ${index.key}) in ${Date.now() - started} ms`,
    )
  } catch (error) {
    if (!(error instanceof OllamaUnavailableError)) throw error
    console.error(
      `${error.message}\nStart it with \`docker compose up -d ollama ollama-models\` ` +
        `(${buildChunks().length} chunks to index).`,
    )
    process.exitCode = 1
  }
}

void main()
