import Groq from "groq-sdk";

const groq = new Groq();

const prompts = [
  {
    type: "category",
    message: `
      Analise o texto abaixo e extraia as seguintes informações de forma estruturada:

      1. **categories**: uma lista de áreas temáticas amplas relacionadas ao conteúdo em português do Brasil (ex: finanças, tecnologia, saúde, AI, educação, redes sociais). Evite termos muito específicos como "direitos digitais" ou "verificação". Use apenas palavras que seriam úteis para agrupar esse conteúdo com outros textos similares como é feito para posts de um blog.

      2. **entities**: uma lista de nomes próprios relevantes em português do Brasil (pessoas, empresas, organizações, cidades, países etc). Ignore valores genéricos como preços, datas, horários, porcentagens, cores.

      3. **sponsored**: um valor booleano (true ou false) que indica se o texto parece ser patrocinado (ex: menção explícita a publicidade, promoção de marca, linguagem publicitária etc).

      Retorne **apenas o JSON bruto**, sem explicações, comentários, pensamentos ou marcações. **A resposta deve começar diretamente com { e terminar com }**.

      Retorne um objeto JSON com esta estrutura:
      {
        "categories": string[],
        "entities": string[],
        "sponsored": boolean
      }

      Texto: `,
  },
];

export const getGroqCategory = async ({
  text,
  model = "deepseek-r1-distill-llama-70b",
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

  const response = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `${prompt?.message}${text}`,
      },
    ],
    model,
  });

  const content = response.choices[0].message.content?.trim();
  const jsonMatch = content?.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error("JSON not found");
  }

  try {
    const jsonObject = JSON.parse(jsonMatch[0]);

    if (
      !jsonObject.categories ||
      !Array.isArray(jsonObject.categories) ||
      !jsonObject.entities ||
      !Array.isArray(jsonObject.entities) ||
      typeof jsonObject.sponsored !== "boolean"
    ) {
      throw new Error("Invalid JSON structure");
    }

    return {
      categories: jsonObject.categories,
      entities: jsonObject.entities,
      sponsored: jsonObject.sponsored,
    };
  } catch (error) {
    throw new Error("Invalid JSON" + error);
  }
};
