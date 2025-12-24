import { motion } from "framer-motion";
import { 
  ImageIcon, 
  FileText, 
  Video, 
  Calendar,
  TrendingUp,
  Eye,
  MousePointer
} from "lucide-react";
import { StatsCard } from "./StatsCard";
import { RecentActivity } from "./RecentActivity";
import { UpcomingPosts } from "./UpcomingPosts";

export function Dashboard() {
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
          value={47}
          change="+12 this week"
          changeType="positive"
          icon={ImageIcon}
          delay={0.1}
        />
        <StatsCard
          title="Scheduled Posts"
          value={28}
          change="Next 30 days"
          changeType="neutral"
          icon={Calendar}
          delay={0.2}
        />
        <StatsCard
          title="Avg. Impressions"
          value="12.4K"
          change="+18% vs last month"
          changeType="positive"
          icon={Eye}
          delay={0.3}
        />
        <StatsCard
          title="Avg. CTR"
          value="3.2%"
          change="+0.4% vs last month"
          changeType="positive"
          icon={MousePointer}
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
            count={24} 
            color="text-cyan-400"
            bgColor="bg-cyan-400/10"
          />
          <AssetTypeCard 
            icon={FileText} 
            type="Carousels" 
            count={15} 
            color="text-purple-400"
            bgColor="bg-purple-400/10"
          />
          <AssetTypeCard 
            icon={Video} 
            type="Videos" 
            count={8} 
            color="text-pink-400"
            bgColor="bg-pink-400/10"
          />
        </div>
      </motion.div>

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
