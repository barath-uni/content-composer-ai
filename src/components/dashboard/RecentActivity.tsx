import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, Sparkles, Download, FileX } from "lucide-react";
import { assetStorage, postsStorage } from "@/lib/storage";

interface Activity {
  id: string;
  action: string;
  item: string;
  time: string;
  icon: any;
  color: string;
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = () => {
    const recentActivities: Activity[] = [];
    const assets = assetStorage.getAll();
    const posts = postsStorage.getAll();

    // Get last 3 uploaded assets
    assets.slice(0, 3).forEach((asset, idx) => {
      recentActivities.push({
        id: `asset-${asset.id}-${idx}`,
        action: "Uploaded",
        item: asset.name,
        time: asset.uploadedAt,
        icon: Upload,
        color: "text-cyan-400",
      });
    });

    // Check if posts were generated
    if (posts.length > 0) {
      recentActivities.push({
        id: "posts-generated",
        action: "Generated",
        item: `${posts.length} post${posts.length !== 1 ? "s" : ""}`,
        time: "Recently",
        icon: Sparkles,
        color: "text-purple-400",
      });
    }

    setActivities(recentActivities.slice(0, 5));
  };

  if (activities.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-display font-semibold text-foreground mb-6">Recent Activity</h2>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
            <FileX className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No activity yet</p>
          <p className="text-xs text-muted-foreground mt-1">Start by uploading assets or generating content</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card p-6"
    >
      <h2 className="text-xl font-display font-semibold text-foreground mb-6">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
          >
            <div className={`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center`}>
              <activity.icon className={`w-5 h-5 ${activity.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">
                <span className="font-medium">{activity.action}</span>{" "}
                <span className="text-muted-foreground truncate">{activity.item}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
