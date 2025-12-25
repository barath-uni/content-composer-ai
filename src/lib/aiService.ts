// AI Content Generation Service
import Anthropic from "@anthropic-ai/sdk";
import type { ContentTheme, GeneratedPost, Asset } from "@/types";

// Initialize Anthropic client (API key should be from environment or user settings)
const getAnthropicClient = () => {
  const apiKey = localStorage.getItem("anthropic_api_key") || "";
  if (!apiKey) {
    throw new Error("Anthropic API key not configured. Please add your API key in settings.");
  }
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
};

interface ContentGenerationParams {
  theme: ContentTheme;
  availableAssets: Asset[];
  startDate: Date;
}

/**
 * Generate LinkedIn content using Claude AI
 */
export async function generateContent(params: ContentGenerationParams): Promise<GeneratedPost[]> {
  const { theme, availableAssets, startDate } = params;
  const client = getAnthropicClient();

  // Analyze available assets by type
  const assetsByType = {
    image: availableAssets.filter(a => a.type === "image"),
    carousel: availableAssets.filter(a => a.type === "carousel"),
    video: availableAssets.filter(a => a.type === "video"),
  };

  // Build the prompt
  const prompt = buildContentPrompt(theme, assetsByType, startDate);

  try {
    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4096,
      messages: [{
        role: "user",
        content: prompt
      }]
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from AI");
    }

    // Parse the AI response
    const posts = parseAIResponse(content.text, theme, assetsByType, startDate);
    return posts;
  } catch (error) {
    console.error("AI generation error:", error);
    throw error;
  }
}

/**
 * Build the prompt for content generation
 */
function buildContentPrompt(
  theme: ContentTheme,
  assetsByType: Record<string, Asset[]>,
  startDate: Date
): string {
  const assetSummary = `
Available Assets:
- Images: ${assetsByType.image.length} (${assetsByType.image.map(a => a.name).join(", ") || "none"})
- Carousels (PDFs): ${assetsByType.carousel.length} (${assetsByType.carousel.map(a => a.name).join(", ") || "none"})
- Videos: ${assetsByType.video.length} (${assetsByType.video.map(a => a.name).join(", ") || "none"})
`;

  return `You are a LinkedIn content strategist. Generate ${theme.daysToFill} days of LinkedIn posts based on this strategy:

**Content Pillars**: ${theme.pillars.join(", ")}
**Target Audience**: ${theme.audience}
**Preferred Format**: ${theme.format}
**Tone**: ${theme.tone}
**Start Date**: ${startDate.toLocaleDateString()}

${assetSummary}

**IMPORTANT RULES**:
1. Only assign image posts when images are available. If no images, use "text" format.
2. Only assign carousel posts when PDFs are available. If no PDFs, use "text" format.
3. Only assign video posts when videos are available. If no videos, use "text" format.
4. Distribute content pillars evenly across the ${theme.daysToFill} days.
5. Each post must have: hook (attention-grabbing first line), caption (90-150 words), CTA, and image prompt (if visual).
6. Use LinkedIn best practices: short paragraphs, line breaks for readability, no hashtags in body.
7. Hooks should be punchy, 5-10 words max.

**OUTPUT FORMAT** (JSON array):
[
  {
    "day": 1,
    "hook": "Your hook here",
    "caption": "Full caption with line breaks\\n\\nParagraph 2\\n\\nParagraph 3",
    "cta": "Call to action",
    "imagePrompt": "Description for image generation (if applicable)",
    "pillar": "one of the pillars",
    "format": "image|carousel|video|text",
    "assetName": "name of asset to use (if applicable)"
  }
]

Generate the posts now as a valid JSON array:`;
}

/**
 * Parse AI response into GeneratedPost objects
 */
function parseAIResponse(
  responseText: string,
  theme: ContentTheme,
  assetsByType: Record<string, Asset[]>,
  startDate: Date
): GeneratedPost[] {
  // Extract JSON from response (AI might wrap it in markdown code blocks)
  const jsonMatch = responseText.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Could not parse AI response as JSON array");
  }

  const rawPosts = JSON.parse(jsonMatch[0]);

  return rawPosts.map((post: any, index: number) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + index);

    // Try to match asset by name if specified
    let assetId: string | undefined;
    if (post.assetName && post.format !== "text") {
      const assets = assetsByType[post.format as keyof typeof assetsByType] || [];
      const matchedAsset = assets.find(a =>
        a.name.toLowerCase().includes(post.assetName.toLowerCase())
      );
      assetId = matchedAsset?.id;
    }

    return {
      id: `post-${Date.now()}-${index}`,
      day: post.day || index + 1,
      date: date.toLocaleDateString(),
      caption: post.caption,
      hook: post.hook,
      cta: post.cta,
      imagePrompt: post.imagePrompt || "",
      pillar: post.pillar,
      format: post.format,
      assetId,
      tags: theme.pillars,
    };
  });
}

/**
 * Check if API key is configured
 */
export function isAIConfigured(): boolean {
  return !!localStorage.getItem("anthropic_api_key");
}

/**
 * Save API key to localStorage
 */
export function saveAPIKey(apiKey: string): void {
  localStorage.setItem("anthropic_api_key", apiKey);
}

/**
 * Clear API key from localStorage
 */
export function clearAPIKey(): void {
  localStorage.removeItem("anthropic_api_key");
}
