import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { processExcelFile, matchPostsToAssets, getPostsWithAssets } from "@/lib/excelParser";
import { postsStorage, assetStorage } from "@/lib/storage";
import { toast } from "sonner";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react";
import type { GeneratedPost } from "@/types";

interface ExcelUploaderProps {
  onUploadComplete: (posts: GeneratedPost[]) => void;
}

export function ExcelUploader({ onUploadComplete }: ExcelUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    await processFile(file);
  };

  const processFile = async (file: File) => {
    try {
      setIsProcessing(true);

      // Parse Excel/CSV
      const { posts, errors } = await processExcelFile(file);

      if (errors.length > 0) {
        toast.error(errors[0]);
        setIsProcessing(false);
        return;
      }

      if (posts.length === 0) {
        toast.error("No valid posts found in file");
        setIsProcessing(false);
        return;
      }

      // Get available assets
      const assets = assetStorage.getAll();

      // Match posts to assets
      const matchedPosts = matchPostsToAssets(posts, assets);

      // Get status
      const { ready, waiting } = getPostsWithAssets(matchedPosts, assets);

      // Clear previous posts and save new ones
      postsStorage.clear();
      postsStorage.addBatch(matchedPosts);

      // Notify parent
      onUploadComplete(matchedPosts);

      // Show success message
      toast.success(
        `Uploaded ${posts.length} posts! ${ready.length} ready to schedule, ${waiting.length} waiting for assets.`
      );
    } catch (error: any) {
      console.error("Error processing file:", error);
      toast.error(error.message || "Failed to process file");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <FileSpreadsheet className="w-8 h-8 text-primary" />
          </div>

          <div className="text-center">
            <h3 className="font-display font-semibold text-foreground mb-1">
              Upload Content Plan
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Excel or CSV file with your content plan
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls,.tsv"
            onChange={handleFileSelect}
            className="hidden"
          />

          <Button
            variant="gradient"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Choose File
              </>
            )}
          </Button>

          {uploadedFile && !isProcessing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-green-500" />
              {uploadedFile.name}
            </div>
          )}
        </div>
      </div>

      {/* Format Guide */}
      <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
        <h4 className="text-sm font-medium text-cyan-600 dark:text-cyan-400 mb-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Required Format
        </h4>
        <p className="text-xs text-muted-foreground mb-2">
          Your CSV/Excel must have these column headers:
        </p>
        <div className="bg-secondary/50 p-2 rounded font-mono text-xs overflow-x-auto">
          Day, Content Pillar, Topic, LinkedIn Post (Formatted), Creative Type, CTA
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          ✅ Supports both <strong>comma-separated (CSV)</strong> and <strong>tab-separated (TSV)</strong>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          <strong>Creative Type examples:</strong> "Text + bold hook graphic" → image, "PDF/Carousel" → carousel
        </p>
      </div>
    </div>
  );
}
