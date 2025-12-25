import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ImageIcon,
  FileText,
  Video,
  Calendar,
  Zap
} from "lucide-react";
import { StatsCard } from "./StatsCard";
import { RecentActivity } from "./RecentActivity";
import { UpcomingPosts } from "./UpcomingPosts";
import { ContentStatus } from "./ContentStatus";
import { assetStorage, postsStorage, scheduledPostsStorage } from "@/lib/storage";

export function Dashboard() {
  const [stats, setStats] = useState({
    totalAssets: 0,
    images: 0,
    carousels: 0,
    videos: 0,
    generatedPosts: 0,
    scheduledPosts: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    const assets = assetStorage.getAll();
    const posts = postsStorage.getAll();
    const scheduled = scheduledPostsStorage.getAll();

    setStats({
      totalAssets: assets.length,
      images: assets.filter(a => a.type === "image").length,
      carousels: assets.filter(a => a.type === "carousel").length,
      videos: assets.filter(a => a.type === "video").length,
      generatedPosts: posts.length,
      scheduledPosts: scheduled.filter(s => s.status === "scheduled").length,
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome back! Here's your content overview.</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Assets"
          value={stats.totalAssets}
          change={stats.totalAssets === 0 ? "Upload your first asset" : `${stats.images + stats.carousels + stats.videos} total`}
          changeType={stats.totalAssets > 0 ? "positive" : "neutral"}
          icon={ImageIcon}
          delay={0.1}
        />
        <StatsCard
          title="Generated Posts"
          value={stats.generatedPosts}
          change={stats.generatedPosts === 0 ? "Generate content to start" : "Ready to export"}
          changeType={stats.generatedPosts > 0 ? "positive" : "neutral"}
          icon={Zap}
          delay={0.2}
        />
        <StatsCard
          title="Scheduled Posts"
          value={stats.scheduledPosts}
          change={stats.scheduledPosts === 0 ? "No scheduled posts" : "Coming up"}
          changeType={stats.scheduledPosts > 0 ? "positive" : "neutral"}
          icon={Calendar}
          delay={0.3}
        />
        <StatsCard
          title="Asset Types"
          value={stats.images + stats.carousels + stats.videos > 0 ? "3" : "0"}
          change={`${stats.images}/${stats.carousels}/${stats.videos} split`}
          changeType="neutral"
          icon={FileText}
          delay={0.4}
        />
      </div>

      {/* Asset Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-display font-semibold text-foreground mb-6">Asset Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AssetTypeCard
            icon={ImageIcon}
            type="Images"
            count={stats.images}
            color="text-cyan-400"
            bgColor="bg-cyan-400/10"
          />
          <AssetTypeCard
            icon={FileText}
            type="Carousels"
            count={stats.carousels}
            color="text-purple-400"
            bgColor="bg-purple-400/10"
          />
          <AssetTypeCard
            icon={Video}
            type="Videos"
            count={stats.videos}
            color="text-pink-400"
            bgColor="bg-pink-400/10"
          />
        </div>
      </motion.div>

      {/* Content Status */}
      <ContentStatus />

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <UpcomingPosts />
      </div>
    </div>
  );
}

interface AssetTypeCardProps {
  icon: React.ElementType;
  type: string;
  count: number;
  color: string;
  bgColor: string;
}

function AssetTypeCard({ icon: Icon, type, count, color, bgColor }: AssetTypeCardProps) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
      <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className="text-2xl font-display font-bold text-foreground">{count}</p>
        <p className="text-sm text-muted-foreground">{type}</p>
      </div>
    </div>
  );
}
