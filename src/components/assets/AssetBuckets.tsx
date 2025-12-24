import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon, FileText, Video, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AssetUploader } from "./AssetUploader";
import { AssetCard } from "./AssetCard";
import { assetStorage } from "@/lib/storage";
import { fileStorage } from "@/lib/fileStorage";
import type { Asset } from "@/types";
import { toast } from "sonner";

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
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load assets from storage on mount
  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      const storedAssets = assetStorage.getAll();

      // Load preview URLs for images
      const assetsWithPreviews = await Promise.all(
        storedAssets.map(async (asset) => {
          if (asset.type === "image" && !asset.preview) {
            const preview = await fileStorage.getFilePreview(asset.id);
            return { ...asset, preview: preview || undefined };
          }
          return asset;
        })
      );

      setAssets(assetsWithPreviews);
    } catch (error) {
      console.error("Error loading assets:", error);
      toast.error("Failed to load assets");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesType = activeType === "all" || asset.type === activeType;
    const matchesSearch = 
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const handleUpload = async (files: File[], type: string, tags: string[]) => {
    try {
      const newAssets: Asset[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const assetId = `asset-${Date.now()}-${i}`;

        // Save file to IndexedDB
        await fileStorage.saveFile(assetId, file);

        // Get preview for images
        let preview: string | undefined;
        if (type === "image") {
          preview = await fileStorage.getFilePreview(assetId) || undefined;
        }

        // Create asset metadata
        const asset: Asset = {
          id: assetId,
          name: file.name,
          type: type as "image" | "carousel" | "video",
          tags,
          uploadedAt: new Date().toLocaleString(),
          size: file.size,
          mimeType: file.type,
          preview,
        };

        // Save to localStorage
        assetStorage.add(asset);
        newAssets.push(asset);
      }

      // Update UI
      setAssets([...newAssets, ...assets]);
      setShowUploader(false);
      toast.success(`Successfully uploaded ${files.length} file(s)`);
    } catch (error) {
      console.error("Error uploading assets:", error);
      toast.error("Failed to upload some files");
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    try {
      // Delete from IndexedDB
      await fileStorage.deleteFile(assetId);

      // Delete from localStorage
      assetStorage.delete(assetId);

      // Update UI
      setAssets(assets.filter((a) => a.id !== assetId));
      toast.success("Asset deleted successfully");
    } catch (error) {
      console.error("Error deleting asset:", error);
      toast.error("Failed to delete asset");
    }
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
            <AssetCard
              key={asset.id}
              asset={asset}
              index={index}
              onDelete={handleDeleteAsset}
            />
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
