// AI-powered LinkedIn formatting using Claude

import Anthropic from "@anthropic-ai/sdk";

const getAnthropicClient = () => {
  const apiKey = localStorage.getItem("anthropic_api_key") || "";
  if (!apiKey) {
    throw new Error("Anthropic API key not configured");
  }
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
};

/**
 * Format text for LinkedIn using AI
 */
export async function aiFormatForLinkedIn(text: string): Promise<string> {
  const client = getAnthropicClient();

  const prompt = `You are a LinkedIn formatting expert. Format this text for optimal LinkedIn readability.

RULES:
1. Add proper line breaks (double \\n\\n between paragraphs)
2. Keep bullets with proper spacing (• followed by space)
3. Use → for bullet points when appropriate
4. Ensure capitalized sentences start on new lines
5. Keep it professional and scannable
6. Do NOT change the content, only formatting
7. Do NOT add hashtags
8. Preserve emoji and special characters

TEXT TO FORMAT:
${text}

OUTPUT ONLY THE FORMATTED TEXT, NO EXPLANATIONS.`;

  try {
    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2048,
      messages: [{
        role: "user",
        content: prompt
      }]
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    return content.text.trim();
  } catch (error) {
    console.error("AI formatting error:", error);
    throw error;
  }
}

/**
 * Batch format multiple posts
 */
export async function batchAIFormat(texts: string[]): Promise<string[]> {
  const formatted: string[] = [];

  for (const text of texts) {
    try {
      const result = await aiFormatForLinkedIn(text);
      formatted.push(result);
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Failed to format text:", error);
      formatted.push(text); // Use original if formatting fails
    }
  }

  return formatted;
}

/**
 * Check if AI formatting is available
 */
export function isAIFormattingAvailable(): boolean {
  return !!localStorage.getItem("anthropic_api_key");
}
