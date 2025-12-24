import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, FileSpreadsheet, FileJson, Calendar, CheckCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { postsStorage, assetStorage } from "@/lib/storage";
import type { GeneratedPost, Asset } from "@/types";

const exportFormats = [
  {
    id: "csv",
    label: "CSV / Excel",
    description: "Compatible with spreadsheet apps and most schedulers",
    icon: FileSpreadsheet,
    color: "text-emerald-400",
  },
  {
    id: "json",
    label: "JSON",
    description: "For developers and API integrations",
    icon: FileJson,
    color: "text-amber-400",
  },
];

const schedulerIntegrations = [
  { id: "buffer", name: "Buffer", connected: false },
  { id: "hootsuite", name: "Hootsuite", connected: false },
  { id: "later", name: "Later", connected: false },
  { id: "linkedin", name: "LinkedIn Native", connected: true },
];

export function ExportPanel() {
  const [selectedFormat, setSelectedFormat] = useState("csv");
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);

  // Load posts and assets on mount
  useEffect(() => {
    setPosts(postsStorage.getAll());
    setAssets(assetStorage.getAll());
  }, []);

  const escapeCSV = (str: string): string => {
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const generateCSV = (): string => {
    const headers = "Day,Date,Caption,Hook,CTA,Image Prompt,Pillar,Format,Tags";
    const rows = posts.map((post) =>
      [
        post.day,
        post.date,
        escapeCSV(post.caption.substring(0, 100) + "..."), // Truncate for preview
        escapeCSV(post.hook),
        escapeCSV(post.cta),
        escapeCSV(post.imagePrompt),
        post.pillar,
        post.format,
        escapeCSV((post.tags || []).join(", ")),
      ].join(",")
    );
    return [headers, ...rows].join("\n");
  };

  const generateJSON = (): string => {
    return JSON.stringify(
      {
        exportDate: new Date().toISOString(),
        totalPosts: posts.length,
        posts: posts,
        assets: assets.map((a) => ({
          id: a.id,
          name: a.name,
          type: a.type,
          tags: a.tags,
        })),
      },
      null,
      2
    );
  };

  const downloadFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);

      if (posts.length === 0) {
        toast.error("No content to export. Generate some posts first!");
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 500));

      const timestamp = new Date().toISOString().split("T")[0];

      if (selectedFormat === "csv") {
        const csv = generateCSV();
        downloadFile(csv, `content-schedule-${timestamp}.csv`, "text/csv");
      } else if (selectedFormat === "json") {
        const json = generateJSON();
        downloadFile(json, `content-schedule-${timestamp}.json`, "application/json");
      }

      setExportComplete(true);
      toast.success("Export complete! Your file has been downloaded.");

      // Reset after showing success
      setTimeout(() => setExportComplete(false), 3000);
    } catch (error) {
      console.error("Error exporting:", error);
      toast.error("Failed to export content");
    } finally {
      setIsExporting(false);
    }
  };

  const generateSampleCSV = () => {
    if (posts.length === 0) {
      return "Day,Date,Caption,Hook,CTA,Image Prompt,Pillar,Format,Tags\nNo content generated yet. Use the Theme Generator to create posts.";
    }
    return generateCSV()
      .split("\n")
      .slice(0, 4)
      .join("\n");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-display font-bold text-foreground">Export</h1>
        <p className="text-muted-foreground mt-2">Download your content schedule or connect to schedulers</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Export Options */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-card p-6 space-y-6"
        >
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            <h3 className="font-display font-semibold text-foreground">Export Format</h3>
          </div>

          <div className="space-y-3">
            {exportFormats.map((format) => (
              <button
                key={format.id}
                onClick={() => setSelectedFormat(format.id)}
                className={`w-full flex items-start gap-4 p-4 rounded-xl border transition-all ${
                  selectedFormat === format.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className={`w-12 h-12 rounded-lg bg-secondary flex items-center justify-center`}>
                  <format.icon className={`w-6 h-6 ${format.color}`} />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">{format.label}</p>
                  <p className="text-sm text-muted-foreground">{format.description}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-medium text-foreground">Content to Export</p>
                <p className="text-sm text-muted-foreground">
                  {posts.length === 0 ? "No posts yet" : `${posts.length} generated post${posts.length !== 1 ? "s" : ""}`}
                </p>
              </div>
              <div className="flex items-center gap-2 text-primary">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">{posts.length} days</span>
              </div>
            </div>

            <Button
              variant="gradient"
              size="lg"
              className="w-full"
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Generating...
                </>
              ) : exportComplete ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Download Ready
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Export {selectedFormat.toUpperCase()}
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Scheduler Integrations */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-card p-6 space-y-6"
        >
          <div className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-primary" />
            <h3 className="font-display font-semibold text-foreground">Scheduler Integrations</h3>
          </div>

          <div className="space-y-3">
            {schedulerIntegrations.map((scheduler) => (
              <div
                key={scheduler.id}
                className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <span className="text-lg font-bold text-foreground">
                      {scheduler.name[0]}
                    </span>
                  </div>
                  <span className="font-medium text-foreground">{scheduler.name}</span>
                </div>
                {scheduler.connected ? (
                  <span className="flex items-center gap-1 text-sm text-emerald-400">
                    <CheckCircle className="w-4 h-4" />
                    Connected
                  </span>
                ) : (
                  <Button variant="outline" size="sm">
                    Connect
                  </Button>
                )}
              </div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground">
            Connect your scheduling tools to automatically sync posts
          </p>
        </motion.div>
      </div>

      {/* Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="glass-card p-6"
      >
        <h3 className="font-display font-semibold text-foreground mb-4">CSV Preview</h3>
        <div className="overflow-x-auto">
          <pre className="text-xs text-muted-foreground bg-secondary/50 p-4 rounded-lg font-mono whitespace-pre">
            {generateSampleCSV()}
          </pre>
        </div>
      </motion.div>
    </div>
  );
}
