import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Copy, Edit, Sparkles, Clock, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PostEditor } from "./PostEditor";
import { ScheduleDialog } from "../planner/ScheduleDialog";
import { copyToClipboardForLinkedIn } from "@/lib/linkedinFormatter";
import { postsStorage } from "@/lib/storage";
import type { GeneratedPost } from "@/types";

interface GeneratedContentProps {
  content: GeneratedPost[];
  isLoading: boolean;
  onUpdate?: (updatedPosts: GeneratedPost[]) => void;
}

export function GeneratedContent({ content, isLoading, onUpdate }: GeneratedContentProps) {
  const [editingPost, setEditingPost] = useState<GeneratedPost | null>(null);
  const [schedulingPost, setSchedulingPost] = useState<GeneratedPost | null>(null);

  const copyToClipboard = async (text: string) => {
    const success = await copyToClipboardForLinkedIn(text);
    if (success) {
      toast.success("Copied with LinkedIn formatting!");
    } else {
      toast.error("Failed to copy");
    }
  };

  const handlePostUpdate = (updatedPost: GeneratedPost) => {
    const updatedContent = content.map(post =>
      post.id === updatedPost.id ? updatedPost : post
    );
    onUpdate?.(updatedContent);
  };

  const handleAccept = (post: GeneratedPost) => {
    const updated = { ...post, status: "accepted" as const };
    postsStorage.update(post.id, updated);
    handlePostUpdate(updated);
    toast.success("Post accepted!");
  };

  const handleReject = (post: GeneratedPost) => {
    const updated = { ...post, status: "rejected" as const };
    postsStorage.update(post.id, updated);
    handlePostUpdate(updated);
    toast.success("Post rejected");
  };

  const handleScheduled = () => {
    // Trigger a custom event to notify ContentPlanner to refresh
    window.dispatchEvent(new CustomEvent('posts-scheduled'));
    toast.success("Post scheduled! View in Content Planner.");
  };

  if (isLoading) {
    return (
      <div className="glass-card p-8 h-full min-h-[500px] flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary mb-6"
        />
        <p className="text-lg font-display font-semibold text-foreground">Generating your content...</p>
        <p className="text-muted-foreground mt-2">AI is crafting optimized posts for your audience</p>
      </div>
    );
  }

  if (content.length === 0) {
    return (
      <div className="glass-card p-8 h-full min-h-[500px] flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <Sparkles className="w-10 h-10 text-primary" />
        </div>
        <p className="text-lg font-display font-semibold text-foreground">Ready to Generate</p>
        <p className="text-muted-foreground mt-2 text-center max-w-md">
          Configure your content settings on the left and click "Generate" to create AI-powered posts
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-display font-semibold text-foreground">
          Generated Content ({content.length} posts)
        </h3>
        <Button variant="glow" size="sm">
          Export All
        </Button>
      </div>

      <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2 scrollbar-hide">
        <AnimatePresence>
          {content.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="glass-card p-6 space-y-4 hover-lift"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-foreground">Day {item.day}</p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent">
                    {item.pillar}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {item.format}
                  </span>
                </div>
              </div>

              {/* Hook */}
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="text-xs text-muted-foreground mb-1">Hook</p>
                <p className="font-medium text-foreground">{item.hook}</p>
              </div>

              {/* Caption Preview */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Caption</p>
                <p className="text-sm text-foreground whitespace-pre-line line-clamp-4">
                  {item.caption}
                </p>
              </div>

              {/* Image Prompt */}
              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <p className="text-xs text-purple-400 mb-1">Image Prompt</p>
                <p className="text-sm text-foreground">{item.imagePrompt}</p>
              </div>

              {/* CTA */}
              <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <p className="text-xs text-cyan-400 mb-1">CTA</p>
                <p className="text-sm text-foreground">{item.cta}</p>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                {/* Accept/Reject Row */}
                {item.status !== "accepted" && item.status !== "rejected" && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-green-500/50 hover:bg-green-500/10"
                      onClick={() => handleAccept(item)}
                    >
                      <Check className="w-4 h-4 text-green-500" />
                      Accept
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-red-500/50 hover:bg-red-500/10"
                      onClick={() => handleReject(item)}
                    >
                      <X className="w-4 h-4 text-red-500" />
                      Reject
                    </Button>
                  </div>
                )}

                {/* Status Badge */}
                {item.status === "accepted" && (
                  <div className="px-3 py-1 rounded bg-green-500/10 border border-green-500/20 text-center">
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                      ✓ Accepted
                    </span>
                  </div>
                )}
                {item.status === "rejected" && (
                  <div className="px-3 py-1 rounded bg-red-500/10 border border-red-500/20 text-center">
                    <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                      ✗ Rejected
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(item.caption)}
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingPost(item)}
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  {item.status === "accepted" && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setSchedulingPost(item)}
                    >
                      <Clock className="w-4 h-4" />
                      Schedule
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {editingPost && (
        <PostEditor
          post={editingPost}
          open={!!editingPost}
          onOpenChange={(open) => !open && setEditingPost(null)}
          onSave={handlePostUpdate}
        />
      )}

      {schedulingPost && (
        <ScheduleDialog
          post={schedulingPost}
          open={!!schedulingPost}
          onOpenChange={(open) => !open && setSchedulingPost(null)}
          onScheduled={handleScheduled}
        />
      )}
    </div>
  );
}
