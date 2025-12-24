import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon, FileText, Video, Plus, Search, Filter, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AssetUploader } from "./AssetUploader";
import { AssetCard } from "./AssetCard";

interface Asset {
  id: string;
  name: string;
  type: "image" | "carousel" | "video";
  tags: string[];
  uploadedAt: string;
  preview?: string;
}

const mockAssets: Asset[] = [
  { id: "1", name: "resume_comparison.png", type: "image", tags: ["engineer", "resume"], uploadedAt: "2 hours ago" },
  { id: "2", name: "skills_carousel.pdf", type: "carousel", tags: ["skills", "ux"], uploadedAt: "1 day ago" },
  { id: "3", name: "interview_tips.mp4", type: "video", tags: ["interview", "engineer"], uploadedAt: "3 days ago" },
  { id: "4", name: "ats_breakdown.png", type: "image", tags: ["ATS", "resume"], uploadedAt: "5 days ago" },
  { id: "5", name: "portfolio_showcase.pdf", type: "carousel", tags: ["portfolio", "ux"], uploadedAt: "1 week ago" },
  { id: "6", name: "coding_demo.mp4", type: "video", tags: ["coding", "engineer"], uploadedAt: "2 weeks ago" },
];

const bucketTypes = [
  { id: "all", label: "All Assets", icon: null },
  { id: "image", label: "Images", icon: ImageIcon, color: "text-cyan-400" },
  { id: "carousel", label: "Carousels", icon: FileText, color: "text-purple-400" },
  { id: "video", label: "Videos", icon: Video, color: "text-pink-400" },
];

export function AssetBuckets() {
  const [activeType, setActiveType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploader, setShowUploader] = useState(false);
  const [assets, setAssets] = useState<Asset[]>(mockAssets);

  const filteredAssets = assets.filter((asset) => {
    const matchesType = activeType === "all" || asset.type === activeType;
    const matchesSearch = 
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const handleUpload = (files: File[], type: string, tags: string[]) => {
    const newAssets: Asset[] = files.map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      name: file.name,
      type: type as "image" | "carousel" | "video",
      tags,
      uploadedAt: "Just now",
    }));
    setAssets([...newAssets, ...assets]);
    setShowUploader(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Asset Buckets</h1>
          <p className="text-muted-foreground mt-2">Organize and manage your content assets</p>
        </div>
        <Button variant="gradient" size="lg" onClick={() => setShowUploader(true)}>
          <Plus className="w-5 h-5" />
          Upload Assets
        </Button>
      </motion.div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploader && (
          <AssetUploader onClose={() => setShowUploader(false)} onUpload={handleUpload} />
        )}
      </AnimatePresence>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col md:flex-row gap-4"
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search assets or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary border-border"
          />
        </div>

        {/* Type Filters */}
        <div className="flex gap-2 flex-wrap">
          {bucketTypes.map((bucket) => (
            <Button
              key={bucket.id}
              variant={activeType === bucket.id ? "glow" : "outline"}
              size="sm"
              onClick={() => setActiveType(bucket.id)}
              className="gap-2"
            >
              {bucket.icon && <bucket.icon className={`w-4 h-4 ${bucket.color}`} />}
              {bucket.label}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Asset Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {filteredAssets.map((asset, index) => (
            <AssetCard key={asset.id} asset={asset} index={index} />
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredAssets.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No assets found</p>
          <Button variant="glow" size="sm" className="mt-4" onClick={() => setShowUploader(true)}>
            Upload your first asset
          </Button>
        </motion.div>
      )}
    </div>
  );
}
