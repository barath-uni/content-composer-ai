import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { scheduledPostsStorage } from "@/lib/storage";
import type { GeneratedPost, ScheduledPost } from "@/types";
import { toast } from "sonner";
import { Calendar, Clock } from "lucide-react";

interface ScheduleDialogProps {
  post: GeneratedPost;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScheduled?: () => void;
}

export function ScheduleDialog({ post, open, onOpenChange, onScheduled }: ScheduleDialogProps) {
  const [scheduleDate, setScheduleDate] = useState(
    new Date(post.date || Date.now()).toISOString().split('T')[0]
  );
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [platform, setPlatform] = useState("linkedin");

  const handleSchedule = () => {
    console.log('=== SCHEDULE BUTTON CLICKED ===');
    console.log('Post being scheduled:', post);
    console.log('Schedule Date:', scheduleDate);
    console.log('Schedule Time:', scheduleTime);

    const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
    console.log('Scheduled DateTime:', scheduledDateTime);

    const scheduledPost: ScheduledPost = {
      id: `scheduled-${Date.now()}`,
      postId: post.id,
      scheduledDate: scheduledDateTime.toISOString(),
      status: "scheduled",
      platform,
    };

    console.log('Scheduled Post Object:', scheduledPost);
    console.log('About to call scheduledPostsStorage.add()...');

    scheduledPostsStorage.add(scheduledPost);

    console.log('After scheduledPostsStorage.add() - checking localStorage...');
    const savedData = localStorage.getItem('content-composer-scheduled-posts');
    console.log('Raw localStorage data:', savedData);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      console.log('Parsed scheduled posts:', parsed);
      console.log('Total scheduled posts in storage:', parsed.length);
    }

    toast.success(`Post scheduled for ${scheduledDateTime.toLocaleString()}!`);

    console.log('Calling onScheduled callback...');
    onScheduled?.();

    console.log('Closing dialog...');
    onOpenChange(false);
    console.log('=== SCHEDULE COMPLETE ===');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Schedule Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Post Preview */}
          <div className="p-4 rounded-lg bg-secondary/50 border border-border">
            <p className="font-semibold text-foreground mb-2">{post.hook}</p>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {post.caption}
            </p>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="schedule-date" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Schedule Date
            </Label>
            <Input
              id="schedule-date"
              type="date"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Time */}
          <div className="space-y-2">
            <Label htmlFor="schedule-time" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Schedule Time
            </Label>
            <Input
              id="schedule-time"
              type="time"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Optimal times for LinkedIn: 9-11 AM, 12-1 PM, or 5-6 PM on weekdays
            </p>
          </div>

          {/* Platform */}
          <div className="space-y-2">
            <Label htmlFor="platform">Platform</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger id="platform">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="buffer">Buffer (LinkedIn)</SelectItem>
                <SelectItem value="hootsuite">Hootsuite (LinkedIn)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Info Notice */}
          <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <p className="text-xs text-cyan-600 dark:text-cyan-400">
              📅 This will mark the post as scheduled in your content calendar.
              Use the Export panel to download the schedule or connect your preferred scheduler.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSchedule}>
              Schedule Post
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
