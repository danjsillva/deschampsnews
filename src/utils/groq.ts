import Groq from "groq-sdk";

const groq = new Groq();

const models = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "gemma2-9b-it",
];

const prompts = [
  {
    type: "category",
    message: `Você deve analisar o texto e retornar um objeto JSON com a seguinte estrutura:
{
  "categories": ["categoria1", "categoria2"],
  "entities": ["entidade1", "entidade2"],
  "sponsored": false
}

Regras OBRIGATÓRIAS:
- categories: lista de temas amplos em português (MÍNIMO 1, máximo 3).
- entities: nomes próprios relevantes (pessoas, empresas, lugares) (MÍNIMO 1). Se não houver entidades específicas, extraia o autor, fonte ou plataforma mencionada.
- sponsored: true se o texto parece publicitário, false caso contrário
- NUNCA retorne arrays vazios - sempre inclua pelo menos um item em categories e entities

Exemplos válidos:
{"categories":["tecnologia","educação"],"entities":["Google","Brasil"],"sponsored":false}
{"categories":["geral"],"entities":["Newsletter"],"sponsored":false}

Texto para análise: `,
  },
];

const extractDelayFromError = (errorMessage: string): number => {
  const match = errorMessage.match(/try again in (\d+)m(\d+(?:\.\d+)?)s/i);
  if (match) {
    const minutes = parseInt(match[1]);
    const seconds = parseFloat(match[2]);

    return (minutes * 60 + seconds) * 1000;
  }

  return 60000;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getGroqCategory = async ({
  text,
  model,
}: {
  text: string;
  model?: string;
}): Promise<{
  categories: string[];
  entities: string[];
  sponsored: boolean;
}> => {
  if (!text) {
    throw new Error("Content is required");
  }

  const prompt = prompts.find((prompt) => prompt.type === "category");
  if (!prompt) {
    throw new Error("Prompt not found");
  }

  const modelsToTry = model
    ? [model, ...models.filter((m) => m !== model)]
    : models;

  for (const currentModel of modelsToTry) {
    console.log(`[GROQ] Trying model: ${currentModel}`);

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`[GROQ] Attempt ${attempt}/3 with ${currentModel}`);

        const response = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content:
                "Você é um assistente que retorna APENAS objetos JSON válidos, sem texto adicional.",
            },
            {
              role: "user",
              content: `${prompt.message}${text}`,
            },
          ],
          model: currentModel,
          temperature: 0.1,
          max_tokens: 500,
          response_format: { type: "json_object" },
        });

        const content = response.choices[0].message.content?.trim();

        console.log("[GROQ] Raw response:", content);

        try {
          const jsonObject = JSON.parse(content || "{}");

          if (
            !jsonObject.categories ||
            !Array.isArray(jsonObject.categories) ||
            !jsonObject.entities ||
            !Array.isArray(jsonObject.entities) ||
            typeof jsonObject.sponsored !== "boolean"
          ) {
            throw new Error("Invalid JSON structure");
          }

          console.log(`[GROQ] Success with ${currentModel}`);
          return {
            categories: jsonObject.categories,
            entities: jsonObject.entities,
            sponsored: jsonObject.sponsored,
          };
        } catch (parseError) {
          console.error("[GROQ] JSON parse error:", parseError);
          console.error("[GROQ] Content:", content);

          if (attempt === 3) {
            throw parseError;
          }
        }
      } catch (error: any) {
        console.error(`[GROQ] Error on attempt ${attempt}:`, error.message);

        if (error.status === 429) {
          const errorMessage = error.error?.message || error.message || "";
          const delay = extractDelayFromError(errorMessage);

          console.log(`[GROQ] Rate limit hit. Waiting ${delay / 1000}s...`);

          await sleep(delay);

          continue;
        }

        if (attempt === 3) {
          console.log(
            `[GROQ] Failed all attempts with ${currentModel}, trying next model...`,
          );
          break;
        }

        await sleep(2000);
      }
    }
  }

  console.error("[GROQ] All models failed. Returning fallback values.");

  return {
    categories: [],
    entities: [],
    sponsored: false,
  };
};
