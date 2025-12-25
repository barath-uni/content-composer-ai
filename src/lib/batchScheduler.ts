// Batch Scheduling Utilities

import type { GeneratedPost, ScheduledPost } from "@/types";
import { scheduledPostsStorage } from "./storage";

export interface SchedulingConfig {
  startDate: Date;
  postTime: string; // "09:00" format
  interval: "daily" | "custom";
  customInterval?: number; // days between posts
  postsPerDay?: number; // 1, 2, or 3
  skipWeekends?: boolean;
}

/**
 * Generate scheduled dates based on config
 */
export function generateScheduleDates(
  numberOfPosts: number,
  config: SchedulingConfig
): Date[] {
  const dates: Date[] = [];
  const { startDate, postTime, interval, customInterval, postsPerDay = 1, skipWeekends = false } = config;

  const [hours, minutes] = postTime.split(':').map(Number);
  let currentDate = new Date(startDate);
  currentDate.setHours(hours, minutes, 0, 0);

  let postsScheduled = 0;
  let currentDayPostCount = 0;

  while (postsScheduled < numberOfPosts) {
    // Skip weekends if configured
    if (skipWeekends && (currentDate.getDay() === 0 || currentDate.getDay() === 6)) {
      currentDate.setDate(currentDate.getDate() + 1);
      currentDayPostCount = 0;
      continue;
    }

    // Add time slots for posts per day
    if (currentDayPostCount < postsPerDay) {
      const postDate = new Date(currentDate);

      // If multiple posts per day, space them out
      if (postsPerDay > 1) {
        const hourOffset = currentDayPostCount * 4; // 4 hours apart
        postDate.setHours(hours + hourOffset);
      }

      dates.push(postDate);
      postsScheduled++;
      currentDayPostCount++;
    }

    // Move to next day if we've scheduled all posts for current day
    if (currentDayPostCount >= postsPerDay) {
      if (interval === "daily") {
        currentDate.setDate(currentDate.getDate() + 1);
      } else {
        currentDate.setDate(currentDate.getDate() + (customInterval || 1));
      }
      currentDayPostCount = 0;
    }
  }

  return dates;
}

/**
 * Batch schedule posts
 */
export function batchSchedulePosts(
  posts: GeneratedPost[],
  config: SchedulingConfig,
  platform: string = "linkedin"
): ScheduledPost[] {
  const scheduleDates = generateScheduleDates(posts.length, config);

  const scheduledPosts: ScheduledPost[] = posts.map((post, index) => ({
    id: `scheduled-${Date.now()}-${index}`,
    postId: post.id,
    scheduledDate: scheduleDates[index].toISOString(),
    status: "scheduled" as const,
    platform,
  }));

  // Save all to storage
  scheduledPosts.forEach(sp => {
    scheduledPostsStorage.add(sp);
  });

  return scheduledPosts;
}

/**
 * Get scheduling summary
 */
export function getSchedulingSummary(
  posts: GeneratedPost[],
  config: SchedulingConfig
): {
  dates: Date[];
  preview: Array<{
    post: GeneratedPost;
    scheduledDate: Date;
  }>;
} {
  const dates = generateScheduleDates(posts.length, config);

  const preview = posts.map((post, index) => ({
    post,
    scheduledDate: dates[index],
  }));

  return { dates, preview };
}

/**
 * Get default scheduling config
 */
export function getDefaultSchedulingConfig(): SchedulingConfig {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  return {
    startDate: tomorrow,
    postTime: "09:00",
    interval: "daily",
    postsPerDay: 1,
    skipWeekends: false,
  };
}

/**
 * Validate scheduling config
 */
export function validateSchedulingConfig(config: SchedulingConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check start date is not in the past
  const now = new Date();
  if (config.startDate < now) {
    errors.push("Start date cannot be in the past");
  }

  // Validate time format
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(config.postTime)) {
    errors.push("Invalid time format. Use HH:MM format (e.g., 09:00)");
  }

  // Validate custom interval
  if (config.interval === "custom") {
    if (!config.customInterval || config.customInterval < 1) {
      errors.push("Custom interval must be at least 1 day");
    }
  }

  // Validate posts per day
  if (config.postsPerDay && (config.postsPerDay < 1 || config.postsPerDay > 3)) {
    errors.push("Posts per day must be between 1 and 3");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
