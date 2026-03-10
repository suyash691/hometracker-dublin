export interface GeneratedEstimate {
  item: string;
  estimatedCostLow: number;
  estimatedCostHigh: number;
  notes: string;
}

interface HouseContext {
  address: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  propertyType?: string | null;
  squareMetres?: number | null;
  ber?: string | null;
  notes?: string | null;
  pros?: string | null;
  cons?: string | null;
}

export async function generateRenovationEstimates(house: HouseContext): Promise<GeneratedEstimate[]> {
  const pros = house.pros ? JSON.parse(house.pros) : [];
  const cons = house.cons ? JSON.parse(house.cons) : [];

  const prompt = `You are a Dublin-based renovation cost estimator with deep knowledge of current 2026 Irish market rates for building work.

Given this property, identify all renovation/repair items and estimate costs in EUR.

Property details:
- Address: ${house.address}
- Type: ${house.propertyType || "unknown"}
- Size: ${house.squareMetres ? house.squareMetres + "m²" : "unknown"}
- Bedrooms: ${house.bedrooms || "unknown"}, Bathrooms: ${house.bathrooms || "unknown"}
- BER: ${house.ber || "unknown"}
- Notes: ${house.notes || "none"}
- Pros: ${pros.join(", ") || "none"}
- Cons: ${cons.join(", ") || "none"}

For each renovation item, provide a JSON object with: item (description), estimatedCostLow (EUR), estimatedCostHigh (EUR), notes (brief explanation).

If BER is C or below, include energy upgrade estimates (insulation, windows, heat pump) with SEAI grant deductions noted.

Respond with ONLY a JSON array, no markdown fences or other text. Example:
[{"item":"Kitchen refit","estimatedCostLow":8000,"estimatedCostHigh":15000,"notes":"Based on standard 3-bed semi kitchen"}]`;

  // Try Ollama first (local), fall back to Claude
  const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  let responseText: string;

  try {
    responseText = await callOllama(ollamaUrl, prompt);
  } catch {
    if (anthropicKey) {
      responseText = await callClaude(anthropicKey, prompt);
    } else {
      throw new Error("No AI backend available. Set OLLAMA_URL or ANTHROPIC_API_KEY.");
    }
  }

  // Parse JSON from response — handle markdown fences if present
  const cleaned = responseText.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
  const parsed = JSON.parse(cleaned);

  if (!Array.isArray(parsed)) throw new Error("AI response was not an array");

  return parsed.map((e: Record<string, unknown>) => ({
    item: String(e.item || ""),
    estimatedCostLow: Number(e.estimatedCostLow) || 0,
    estimatedCostHigh: Number(e.estimatedCostHigh) || 0,
    notes: String(e.notes || ""),
  }));
}

async function callOllama(baseUrl: string, prompt: string): Promise<string> {
  const model = process.env.OLLAMA_MODEL || "llama3";
  const res = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt, stream: false }),
  });
  if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
  const data = await res.json();
  return data.response;
}

async function callClaude(apiKey: string, prompt: string): Promise<string> {
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Claude error: ${res.status}`);
  const data = await res.json();
  return data.content[0].text;
}
