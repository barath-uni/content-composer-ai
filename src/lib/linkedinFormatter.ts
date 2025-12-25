// LinkedIn Text Formatting Utilities

/**
 * Unicode bold characters for LinkedIn
 * LinkedIn doesn't support markdown, but accepts Unicode bold
 */
const BOLD_MAP: Record<string, string> = {
  'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚', 'H': '𝗛',
  'I': '𝗜', 'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡', 'O': '𝗢', 'P': '𝗣',
  'Q': '𝗤', 'R': '𝗥', 'S': '𝗦', 'T': '𝗧', 'U': '𝗨', 'V': '𝗩', 'W': '𝗪', 'X': '𝗫',
  'Y': '𝗬', 'Z': '𝗭',
  'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴', 'h': '𝗵',
  'i': '𝗶', 'j': '𝗷', 'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻', 'o': '𝗼', 'p': '𝗽',
  'q': '𝗾', 'r': '𝗿', 's': '𝘀', 't': '𝘁', 'u': '𝘂', 'v': '𝘃', 'w': '𝘄', 'x': '𝘅',
  'y': '𝘆', 'z': '𝘇',
  '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰', '5': '𝟱', '6': '𝟲', '7': '𝟳',
  '8': '𝟴', '9': '𝟵',
};

/**
 * Convert **text** to Unicode bold for LinkedIn
 */
export function convertToBold(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, (_, content) => {
    return content.split('').map((char: string) => BOLD_MAP[char] || char).join('');
  });
}

/**
 * Format text for LinkedIn with proper spacing and bullets
 */
export function formatForLinkedIn(text: string): string {
  let formatted = text;

  // Convert markdown bold to Unicode bold
  formatted = convertToBold(formatted);

  // Ensure double line breaks between paragraphs
  formatted = formatted.replace(/\n\n+/g, '\n\n');

  // Convert common bullet formats to LinkedIn-friendly ones
  formatted = formatted.replace(/^[-*]\s/gm, '→ ');
  formatted = formatted.replace(/^•\s/gm, '→ ');

  return formatted.trim();
}

/**
 * Preview how text will look on LinkedIn
 * Converts formatting to visual representation
 */
export function previewLinkedInPost(caption: string): string {
  return formatForLinkedIn(caption);
}

/**
 * Copy to clipboard with formatting preserved
 * This ensures line breaks are maintained when pasting to LinkedIn
 */
export async function copyToClipboardForLinkedIn(text: string): Promise<boolean> {
  const formatted = formatForLinkedIn(text);

  try {
    // Use Clipboard API which preserves formatting better
    await navigator.clipboard.writeText(formatted);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    // Fallback to older method
    const textArea = document.createElement("textarea");
    textArea.value = formatted;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textArea);
    return success;
  }
}

/**
 * Validate LinkedIn post constraints
 */
export function validateLinkedInPost(caption: string): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // LinkedIn character limit
  if (caption.length > 3000) {
    errors.push("Post exceeds LinkedIn's 3000 character limit");
  }

  // Optimal length
  if (caption.length < 50) {
    warnings.push("Post is very short. Consider adding more value.");
  }

  if (caption.length > 1300) {
    warnings.push("Posts over 1300 characters get truncated in feed. Users must click 'see more'.");
  }

  // Check for hashtags in body (best practice is to put them in comments)
  const hashtagsInBody = (caption.match(/#\w+/g) || []).length;
  if (hashtagsInBody > 0) {
    warnings.push(`Found ${hashtagsInBody} hashtag(s) in body. Consider moving to comments for better engagement.`);
  }

  // Check for excessive line breaks
  const consecutiveBreaks = caption.match(/\n{4,}/g);
  if (consecutiveBreaks) {
    warnings.push("Excessive line breaks detected. LinkedIn may collapse them.");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Generate bullet points with LinkedIn-friendly symbols
 */
export function generateBulletList(items: string[], style: 'arrow' | 'check' | 'dot' = 'arrow'): string {
  const symbols = {
    arrow: '→',
    check: '✓',
    dot: '•',
  };

  const symbol = symbols[style];
  return items.map(item => `${symbol} ${item}`).join('\n');
}

/**
 * Add proper spacing for LinkedIn readability
 */
export function improveReadability(text: string): string {
  // Split into paragraphs
  const paragraphs = text.split('\n\n').filter(p => p.trim());

  // Ensure each paragraph is well-spaced
  return paragraphs.join('\n\n');
}
