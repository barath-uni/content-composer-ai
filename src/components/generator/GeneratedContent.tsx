import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Copy, Edit, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ContentItem {
  id: string;
  day: number;
  date: string;
  caption: string;
  hook: string;
  cta: string;
  imagePrompt: string;
  pillar: string;
  format: string;
}

interface GeneratedContentProps {
  content: ContentItem[];
  isLoading: boolean;
}

export function GeneratedContent({ content, isLoading }: GeneratedContentProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
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
              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(item.caption)}
                >
                  <Copy className="w-4 h-4" />
                  Copy Caption
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(item.imagePrompt)}
                >
                  <Copy className="w-4 h-4" />
                  Copy Prompt
                </Button>
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
