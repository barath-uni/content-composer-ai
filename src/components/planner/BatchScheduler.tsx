import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { batchSchedulePosts, getDefaultSchedulingConfig, getSchedulingSummary, validateSchedulingConfig } from "@/lib/batchScheduler";
import type { GeneratedPost, ScheduledPost } from "@/types";
import type { SchedulingConfig } from "@/lib/batchScheduler";
import { toast } from "sonner";
import { Calendar, Clock, Zap, AlertTriangle } from "lucide-react";

interface BatchSchedulerProps {
  posts: GeneratedPost[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScheduled?: (scheduled: ScheduledPost[]) => void;
}

export function BatchScheduler({ posts, open, onOpenChange, onScheduled }: BatchSchedulerProps) {
  const [config, setConfig] = useState<SchedulingConfig>(getDefaultSchedulingConfig());
  const [preview, setPreview] = useState<Array<{ post: GeneratedPost; scheduledDate: Date }>>([]);

  useEffect(() => {
    if (open && posts.length > 0) {
      updatePreview();
    }
  }, [open, posts, config]);

  const updatePreview = () => {
    const { preview: newPreview } = getSchedulingSummary(posts, config);
    setPreview(newPreview.slice(0, 5)); // Show first 5
  };

  const handleSchedule = () => {
    const validation = validateSchedulingConfig(config);

    if (!validation.valid) {
      toast.error(validation.errors[0]);
      return;
    }

    const scheduled = batchSchedulePosts(posts, config);
    toast.success(`Scheduled ${scheduled.length} posts!`);
    onScheduled?.(scheduled);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Batch Schedule {posts.length} Posts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Configuration */}
          <div className="space-y-4">
            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="start-date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Start Date
              </Label>
              <Input
                id="start-date"
                type="date"
                value={config.startDate.toISOString().split('T')[0]}
                onChange={(e) => setConfig({
                  ...config,
                  startDate: new Date(e.target.value + 'T' + config.postTime)
                })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Post Time */}
            <div className="space-y-2">
              <Label htmlFor="post-time" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Default Post Time
              </Label>
              <Input
                id="post-time"
                type="time"
                value={config.postTime}
                onChange={(e) => setConfig({ ...config, postTime: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Best times: 9-11 AM, 12-1 PM, 5-6 PM (weekdays)
              </p>
            </div>

            {/* Posts Per Day */}
            <div className="space-y-2">
              <Label htmlFor="posts-per-day">Posts Per Day</Label>
              <Select
                value={config.postsPerDay?.toString() || "1"}
                onValueChange={(value) => setConfig({ ...config, postsPerDay: parseInt(value) })}
              >
                <SelectTrigger id="posts-per-day">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 post per day</SelectItem>
                  <SelectItem value="2">2 posts per day</SelectItem>
                  <SelectItem value="3">3 posts per day</SelectItem>
                </SelectContent>
              </Select>
              {config.postsPerDay && config.postsPerDay > 1 && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Posts will be spaced 4 hours apart
                </p>
              )}
            </div>

            {/* Interval */}
            <div className="space-y-2">
              <Label htmlFor="interval">Scheduling Interval</Label>
              <Select
                value={config.interval}
                onValueChange={(value) => setConfig({ ...config, interval: value as "daily" | "custom" })}
              >
                <SelectTrigger id="interval">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily (1 post every day)</SelectItem>
                  <SelectItem value="custom">Custom interval</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {config.interval === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="custom-interval">Days Between Posts</Label>
                <Input
                  id="custom-interval"
                  type="number"
                  min="1"
                  max="7"
                  value={config.customInterval || 1}
                  onChange={(e) => setConfig({ ...config, customInterval: parseInt(e.target.value) })}
                />
              </div>
            )}

            {/* Skip Weekends */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="skip-weekends"
                checked={config.skipWeekends || false}
                onChange={(e) => setConfig({ ...config, skipWeekends: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="skip-weekends" className="cursor-pointer">
                Skip weekends (post only on weekdays)
              </Label>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Schedule Preview</h4>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {preview.map((item, index) => (
                <div
                  key={item.post.id}
                  className="flex items-start justify-between p-3 rounded-lg bg-secondary/50 border border-border"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      Day {item.post.day}: {item.post.hook}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.post.pillar} • {item.post.format}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary">
                      {item.scheduledDate.toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.scheduledDate.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {posts.length > 5 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{posts.length - 5} more posts...
                </p>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <p className="text-sm text-cyan-600 dark:text-cyan-400">
              📅 Will schedule <strong>{posts.length} posts</strong> from{' '}
              <strong>{config.startDate.toLocaleDateString()}</strong> at{' '}
              <strong>{config.postTime}</strong>
              {config.postsPerDay && config.postsPerDay > 1 && (
                <> ({config.postsPerDay} posts per day)</>
              )}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSchedule}>
              <Zap className="w-4 h-4" />
              Schedule All Posts
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
