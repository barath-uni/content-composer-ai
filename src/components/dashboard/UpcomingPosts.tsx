import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ImageIcon, FileText, Video, CalendarX } from "lucide-react";
import { postsStorage, scheduledPostsStorage } from "@/lib/storage";
import type { GeneratedPost, ScheduledPost } from "@/types";

const typeIcons = {
  image: ImageIcon,
  carousel: FileText,
  video: Video,
  text: FileText,
};

const typeColors = {
  image: "text-cyan-400 bg-cyan-400/10",
  carousel: "text-purple-400 bg-purple-400/10",
  video: "text-pink-400 bg-pink-400/10",
  text: "text-amber-400 bg-amber-400/10",
};

export function UpcomingPosts() {
  const [upcomingPosts, setUpcomingPosts] = useState<Array<GeneratedPost & { scheduledDate?: string; status?: string }>>([]);

  useEffect(() => {
    loadUpcomingPosts();
  }, []);

  const loadUpcomingPosts = () => {
    const posts = postsStorage.getAll();
    const scheduled = scheduledPostsStorage.getAll();

    // Combine generated posts with scheduled info
    const upcoming = posts.slice(0, 5).map((post) => {
      const schedInfo = scheduled.find((s) => s.postId === post.id);
      return {
        ...post,
        scheduledDate: schedInfo?.scheduledDate,
        status: schedInfo?.status || "draft",
      };
    });

    setUpcomingPosts(upcoming);
  };

  if (upcomingPosts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-display font-semibold text-foreground mb-6">Generated Posts</h2>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
            <CalendarX className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No posts generated yet</p>
          <p className="text-xs text-muted-foreground mt-1">Use Theme Generator to create content</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="glass-card p-6"
    >
      <h2 className="text-xl font-display font-semibold text-foreground mb-6">Generated Posts</h2>
      <div className="space-y-3">
        {upcomingPosts.map((post, index) => {
          const Icon = typeIcons[post.format as keyof typeof typeIcons] || FileText;
          const colorClass = typeColors[post.format as keyof typeof typeColors] || typeColors.text;

          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass.split(' ')[1]}`}>
                <Icon className={`w-5 h-5 ${colorClass.split(' ')[0]}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{post.hook}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{post.date}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                post.status === 'scheduled'
                  ? 'bg-emerald-400/10 text-emerald-400'
                  : 'bg-amber-400/10 text-amber-400'
              }`}>
                {post.status || 'draft'}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
