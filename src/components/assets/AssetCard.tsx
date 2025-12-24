import { motion } from "framer-motion";
import { ImageIcon, FileText, Video, MoreVertical, Tag, Trash2, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Asset } from "@/types";

interface AssetCardProps {
  asset: Asset;
  index: number;
  onDelete?: (id: string) => void;
}

const typeConfig = {
  image: { icon: ImageIcon, color: "text-cyan-400", bg: "bg-cyan-400/10", gradient: "from-cyan-500/20 to-cyan-600/10" },
  carousel: { icon: FileText, color: "text-purple-400", bg: "bg-purple-400/10", gradient: "from-purple-500/20 to-purple-600/10" },
  video: { icon: Video, color: "text-pink-400", bg: "bg-pink-400/10", gradient: "from-pink-500/20 to-pink-600/10" },
};

export function AssetCard({ asset, index, onDelete }: AssetCardProps) {
  const config = typeConfig[asset.type];
  const Icon = config.icon;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && confirm(`Delete ${asset.name}?`)) {
      onDelete(asset.id);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="glass-card overflow-hidden hover-lift group"
    >
      {/* Preview Area */}
      <div className={cn(
        "h-40 flex items-center justify-center relative",
        `bg-gradient-to-br ${config.gradient}`
      )}>
        {asset.preview ? (
          <img src={asset.preview} alt={asset.name} className="w-full h-full object-cover" />
        ) : (
          <Icon className={cn("w-16 h-16", config.color)} />
        )}

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary/20 transition-colors">
            <Edit className="w-5 h-5 text-foreground" />
          </button>
          <button
            onClick={handleDelete}
            className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-destructive/20 transition-colors"
          >
            <Trash2 className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">{asset.name}</p>
            <p className="text-xs text-muted-foreground mt-1">{asset.uploadedAt}</p>
          </div>
          <button className="p-1 hover:bg-secondary rounded transition-colors">
            <MoreVertical className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {asset.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground"
            >
              <Tag className="w-3 h-3" />
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
