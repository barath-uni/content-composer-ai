import { motion } from "framer-motion";
import { Upload, Sparkles, Calendar, CheckCircle } from "lucide-react";

const activities = [
  {
    id: 1,
    action: "Uploaded",
    item: "resume_comparison.png",
    time: "2 hours ago",
    icon: Upload,
    color: "text-cyan-400",
  },
  {
    id: 2,
    action: "Generated",
    item: "5 new captions",
    time: "4 hours ago",
    icon: Sparkles,
    color: "text-purple-400",
  },
  {
    id: 3,
    action: "Scheduled",
    item: "Week 3 posts",
    time: "Yesterday",
    icon: Calendar,
    color: "text-pink-400",
  },
  {
    id: 4,
    action: "Published",
    item: "Career tips carousel",
    time: "2 days ago",
    icon: CheckCircle,
    color: "text-emerald-400",
  },
];

export function RecentActivity() {
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
            <div className="flex-1">
              <p className="text-sm text-foreground">
                <span className="font-medium">{activity.action}</span>{" "}
                <span className="text-muted-foreground">{activity.item}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
