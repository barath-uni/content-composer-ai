import { motion } from "framer-motion";
import { ImageIcon, FileText, Video } from "lucide-react";

const upcomingPosts = [
  {
    id: 1,
    title: "Resume tips for SWE",
    date: "Jan 15, 2026",
    type: "image",
    status: "scheduled",
  },
  {
    id: 2,
    title: "ATS optimization guide",
    date: "Jan 16, 2026",
    type: "carousel",
    status: "scheduled",
  },
  {
    id: 3,
    title: "Interview prep video",
    date: "Jan 17, 2026",
    type: "video",
    status: "draft",
  },
  {
    id: 4,
    title: "Skills showcase",
    date: "Jan 18, 2026",
    type: "image",
    status: "scheduled",
  },
];

const typeIcons = {
  image: ImageIcon,
  carousel: FileText,
  video: Video,
};

const typeColors = {
  image: "text-cyan-400 bg-cyan-400/10",
  carousel: "text-purple-400 bg-purple-400/10",
  video: "text-pink-400 bg-pink-400/10",
};

export function UpcomingPosts() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="glass-card p-6"
    >
      <h2 className="text-xl font-display font-semibold text-foreground mb-6">Upcoming Posts</h2>
      <div className="space-y-3">
        {upcomingPosts.map((post, index) => {
          const Icon = typeIcons[post.type as keyof typeof typeIcons];
          const colorClass = typeColors[post.type as keyof typeof typeColors];
          
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
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{post.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{post.date}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                post.status === 'scheduled' 
                  ? 'bg-emerald-400/10 text-emerald-400' 
                  : 'bg-amber-400/10 text-amber-400'
              }`}>
                {post.status}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
