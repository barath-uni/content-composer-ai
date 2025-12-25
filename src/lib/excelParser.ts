// Excel/CSV Parser for Content Plan Upload

import type { GeneratedPost, Asset } from "@/types";

export interface ExcelRow {
  Day: string;
  "Content Pillar": string;
  Topic: string;
  "LinkedIn Post (Formatted)": string;
  "Creative Type": string;
  CTA: string;
}

/**
 * Detect delimiter (comma or tab)
 */
function detectDelimiter(line: string): string {
  const commaCount = (line.match(/,/g) || []).length;
  const tabCount = (line.match(/\t/g) || []).length;

  // If we have tabs, use tabs (TSV format)
  // Otherwise use comma (CSV format)
  return tabCount > 0 ? '\t' : ',';
}

/**
 * Parse CSV/TSV line handling quoted fields
 */
function parseCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      // Field separator
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Add last field
  result.push(current.trim());

  return result;
}

/**
 * Parse CSV content into structured data
 */
export function parseCSV(csvContent: string): ExcelRow[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error("CSV file is empty or has no data rows");
  }

  // Detect delimiter from first line
  const delimiter = detectDelimiter(lines[0]);
  console.log(`Detected delimiter: ${delimiter === ',' ? 'comma' : 'tab'}`);

  // Parse header
  const headers = parseCSVLine(lines[0], delimiter);
  console.log('Parsed headers:', headers);

  // Validate headers
  const requiredHeaders = ["Day", "Content Pillar", "Topic", "LinkedIn Post (Formatted)", "Creative Type", "CTA"];
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
  if (missingHeaders.length > 0) {
    console.error('Missing headers:', missingHeaders);
    console.error('Found headers:', headers);
    throw new Error(`Missing required columns: ${missingHeaders.join(", ")}. Found: ${headers.join(", ")}`);
  }

  // Parse data rows
  const rows: ExcelRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i], delimiter);
    const row: any = {};

    headers.forEach((header, index) => {
      row[header] = values[index]?.trim() || "";
    });

    // Only add rows with valid day numbers
    if (row.Day && !isNaN(parseInt(row.Day))) {
      rows.push(row as ExcelRow);
    }
  }

  console.log(`Parsed ${rows.length} rows`);
  return rows;
}

/**
 * Map Creative Type from Excel to our format
 */
export function mapCreativeType(creativeType: string): "image" | "carousel" | "video" | "text" {
  const type = creativeType.toLowerCase();

  // Carousel/PDF detection
  if (type.includes("carousel") || type.includes("pdf") || type.includes("slide")) {
    return "carousel";
  }

  // Video detection
  if (type.includes("video") || type.includes("reel")) {
    return "video";
  }

  // Image detection
  if (type.includes("graphic") || type.includes("image") || type.includes("visual") || type.includes("stat")) {
    return "image";
  }

  // Default to text if nothing matches
  return "text";
}

/**
 * Match posts to available assets by tags, with fallback to random selection
 */
export function matchPostsToAssets(
  posts: GeneratedPost[],
  assets: Asset[]
): GeneratedPost[] {
  const assetsByType = {
    image: assets.filter(a => a.type === "image"),
    carousel: assets.filter(a => a.type === "carousel"),
    video: assets.filter(a => a.type === "video"),
  };

  const usedAssets = new Set<string>();

  return posts.map(post => {
    const availableAssets = assetsByType[post.format as keyof typeof assetsByType] || [];

    if (availableAssets.length === 0) {
      return post; // No assets available for this format
    }

    // Try to match by tags first
    let matchedAsset = availableAssets.find(asset => {
      if (usedAssets.has(asset.id)) return false;

      // Check if post tags match asset tags
      const postTags = post.tags?.map(t => t.toLowerCase()) || [];
      const assetTags = asset.tags.map(t => t.toLowerCase());

      return postTags.some(pt => assetTags.some(at => at.includes(pt) || pt.includes(at)));
    });

    // Fallback: pick first unused asset in the same format
    if (!matchedAsset) {
      matchedAsset = availableAssets.find(asset => !usedAssets.has(asset.id));
    }

    // Mark asset as used
    if (matchedAsset) {
      usedAssets.add(matchedAsset.id);
      return { ...post, assetId: matchedAsset.id };
    }

    return post;
  });
}

/**
 * Preserve LinkedIn formatting from CSV text
 */
function preserveLinkedInFormatting(text: string): string {
  console.log('Original text:', text);
  console.log('Has actual newlines:', text.includes('\n'));
  console.log('Has escaped newlines:', text.includes('\\n'));

  let formatted = text;

  // Handle both cases:
  // 1. CSV has literal "\n" strings (Excel export sometimes does this)
  if (text.includes('\\n') && !text.includes('\n')) {
    console.log('Converting literal \\n to newlines');
    formatted = text.replace(/\\n/g, '\n');
  }

  // 2. CSV already has actual newlines (most common)
  // Just use as-is

  // Ensure bullets have space after them
  formatted = formatted.replace(/•(\S)/g, '• $1');
  formatted = formatted.replace(/→(\S)/g, '→ $1');

  // Add line break before bullets if missing
  formatted = formatted.replace(/([^\n])•/g, '$1\n•');
  formatted = formatted.replace(/([^\n])→/g, '$1\n→');

  console.log('Formatted text:', formatted);

  return formatted;
}

/**
 * Convert Excel rows to GeneratedPost objects
 */
export function convertExcelToGeneratedPosts(
  rows: ExcelRow[],
  startDate: Date = new Date()
): GeneratedPost[] {
  return rows.map(row => {
    const day = parseInt(row.Day) || 1;
    const date = new Date(startDate);
    date.setDate(date.getDate() + (day - 1));

    const format = mapCreativeType(row["Creative Type"]);

    // Preserve LinkedIn formatting from CSV
    const rawCaption = row["LinkedIn Post (Formatted)"];
    const caption = preserveLinkedInFormatting(rawCaption);

    // Extract hook from the first line of LinkedIn Post
    const hook = caption.split('\n')[0] || row.Topic;

    // Extract tags from content pillar and topic
    const tags = [
      row["Content Pillar"].toLowerCase(),
      ...row.Topic.toLowerCase().split(' ').slice(0, 2) // First 2 words of topic
    ];

    return {
      id: `excel-post-${Date.now()}-${day}`,
      day,
      date: date.toLocaleDateString(),
      caption,
      hook,
      cta: row.CTA,
      imagePrompt: `Visual for: ${row.Topic}`, // Generate basic image prompt
      pillar: row["Content Pillar"],
      format,
      tags,
    };
  });
}

/**
 * Process uploaded Excel/CSV file
 */
export async function processExcelFile(file: File): Promise<{
  posts: GeneratedPost[];
  errors: string[];
}> {
  const errors: string[] = [];

  try {
    const text = await file.text();

    // Parse CSV
    const rows = parseCSV(text);

    if (rows.length === 0) {
      errors.push("No valid data rows found in file");
      return { posts: [], errors };
    }

    // Convert to posts
    const posts = convertExcelToGeneratedPosts(rows);

    return { posts, errors };
  } catch (error: any) {
    errors.push(error.message || "Failed to parse file");
    return { posts: [], errors };
  }
}

/**
 * Get posts that have matching assets available
 */
export function getPostsWithAssets(posts: GeneratedPost[], assets: Asset[]): {
  ready: GeneratedPost[];
  waiting: GeneratedPost[];
  readyByType: {
    image: number;
    carousel: number;
    video: number;
    text: number;
  };
} {
  const assetCounts = {
    image: assets.filter(a => a.type === "image").length,
    carousel: assets.filter(a => a.type === "carousel").length,
    video: assets.filter(a => a.type === "video").length,
  };

  const ready: GeneratedPost[] = [];
  const waiting: GeneratedPost[] = [];
  const readyByType = { image: 0, carousel: 0, video: 0, text: 0 };

  posts.forEach(post => {
    const format = post.format as keyof typeof assetCounts;

    if (format === "text" || (assetCounts[format] && assetCounts[format] > 0)) {
      ready.push(post);
      readyByType[format === "text" ? "text" : format]++;
    } else {
      waiting.push(post);
    }
  });

  return { ready, waiting, readyByType };
}
