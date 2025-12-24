// Core data types for the Content Composer AI app

export interface Asset {
  id: string;
  name: string;
  type: "image" | "carousel" | "video";
  tags: string[];
  uploadedAt: string;
  preview?: string;
  fileData?: string; // Base64 or IndexedDB reference
  size?: number;
  mimeType?: string;
}

export interface GeneratedPost {
  id: string;
  day: number;
  date: string;
  caption: string;
  hook: string;
  cta: string;
  imagePrompt: string;
  pillar: string;
  format: string;
  assetId?: string; // Reference to asset if using one
  tags?: string[];
}

export interface ContentTheme {
  pillars: string[];
  audience: string;
  format: string;
  tone: string;
  daysToFill: number;
}

export interface ScheduledPost {
  id: string;
  postId: string; // Reference to GeneratedPost
  scheduledDate: string;
  status: "draft" | "scheduled" | "published";
  platform?: string;
}

export interface AppState {
  assets: Asset[];
  generatedPosts: GeneratedPost[];
  scheduledPosts: ScheduledPost[];
  lastTheme?: ContentTheme;
}

// Storage keys
export const STORAGE_KEYS = {
  ASSETS: "content-composer-assets",
  GENERATED_POSTS: "content-composer-generated-posts",
  SCHEDULED_POSTS: "content-composer-scheduled-posts",
  LAST_THEME: "content-composer-last-theme",
  APP_STATE: "content-composer-app-state",
} as const;

// IndexedDB configuration
export const DB_CONFIG = {
  name: "ContentComposerDB",
  version: 1,
  stores: {
    files: "files", // For storing binary file data
  },
} as const;
