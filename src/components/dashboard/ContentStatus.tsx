import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Clock, Calendar, Image, FileText, Video, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { postsStorage, assetStorage, scheduledPostsStorage } from "@/lib/storage";
import { getPostsWithAssets } from "@/lib/excelParser";
import { BatchScheduler } from "../planner/BatchScheduler";
import type { GeneratedPost } from "@/types";

export function ContentStatus() {
  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [readyPosts, setReadyPosts] = useState<GeneratedPost[]>([]);
  const [waitingPosts, setWaitingPosts] = useState<GeneratedPost[]>([]);
  const [scheduledCount, setScheduledCount] = useState(0);
  const [publishedCount] = useState(0); // TODO: Track published posts
  const [showBatchScheduler, setShowBatchScheduler] = useState(false);
  const [readyByType, setReadyByType] = useState({ image: 0, carousel: 0, video: 0, text: 0 });

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = () => {
    const allPosts = postsStorage.getAll();
    const assets = assetStorage.getAll();
    const scheduled = scheduledPostsStorage.getAll();

    const { ready, waiting, readyByType: counts } = getPostsWithAssets(allPosts, assets);

    setPosts(allPosts);
    setReadyPosts(ready);
    setWaitingPosts(waiting);
    setScheduledCount(scheduled.length);
    setReadyByType(counts);
  };

  const handleBatchSchedule = () => {
    if (readyPosts.length === 0) {
      return;
    }
    setShowBatchScheduler(true);
  };

  const handleScheduled = () => {
    loadStatus();
    setShowBatchScheduler(false);
  };

  if (posts.length === 0) {
    return null; // Don't show if no posts
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-6 space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-display font-semibold text-foreground">Content Status</h3>
            <p className="text-muted-foreground text-sm mt-1">
              {posts.length} total posts loaded
            </p>
          </div>
          {readyPosts.length > 0 && (
            <Button variant="gradient" onClick={handleBatchSchedule}>
              <Zap className="w-4 h-4" />
              Schedule {readyPosts.length} Ready Posts
            </Button>
          )}
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Ready to Schedule */}
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                Ready
              </span>
            </div>
            <p className="text-2xl font-display font-bold text-foreground">
              {readyPosts.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Have assets</p>
          </div>

          {/* Waiting for Assets */}
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                Waiting
              </span>
            </div>
            <p className="text-2xl font-display font-bold text-foreground">
              {waitingPosts.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Need assets</p>
          </div>

          {/* Scheduled */}
          <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-cyan-500" />
              <span className="text-sm font-medium text-cyan-600 dark:text-cyan-400">
                Scheduled
              </span>
            </div>
            <p className="text-2xl font-display font-bold text-foreground">
              {scheduledCount}
            </p>
            <p className="text-xs text-muted-foreground mt-1">In queue</p>
          </div>

          {/* Published */}
          <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                Published
              </span>
            </div>
            <p className="text-2xl font-display font-bold text-foreground">
              {publishedCount}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Live on LinkedIn</p>
          </div>
        </div>

        {/* Ready Posts Breakdown */}
        {readyPosts.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-foreground text-sm">Ready to Schedule:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {readyByType.image > 0 && (
                <div className="flex items-center gap-2 p-2 rounded bg-secondary/50">
                  <Image className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-foreground">{readyByType.image} Images</span>
                </div>
              )}
              {readyByType.carousel > 0 && (
                <div className="flex items-center gap-2 p-2 rounded bg-secondary/50">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-foreground">{readyByType.carousel} Carousels</span>
                </div>
              )}
              {readyByType.video > 0 && (
                <div className="flex items-center gap-2 p-2 rounded bg-secondary/50">
                  <Video className="w-4 h-4 text-pink-400" />
                  <span className="text-sm text-foreground">{readyByType.video} Videos</span>
                </div>
              )}
              {readyByType.text > 0 && (
                <div className="flex items-center gap-2 p-2 rounded bg-secondary/50">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-foreground">{readyByType.text} Text</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Waiting Posts Info */}
        {waitingPosts.length > 0 && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-sm text-amber-600 dark:text-amber-400">
              💡 <strong>{waitingPosts.length} posts</strong> are waiting for you to upload assets.
              Upload images, PDFs, or videos to make them ready for scheduling.
            </p>
          </div>
        )}
      </motion.div>

      {/* Batch Scheduler Dialog */}
      <BatchScheduler
        posts={readyPosts}
        open={showBatchScheduler}
        onOpenChange={setShowBatchScheduler}
        onScheduled={handleScheduled}
      />
    </>
  );
}
