import { useState } from "react";
import { motion } from "framer-motion";
import { Download, FileSpreadsheet, FileJson, Calendar, CheckCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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

  const handleExport = async () => {
    setIsExporting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsExporting(false);
    setExportComplete(true);
    toast.success("Export complete! Your file is ready to download.");
    
    // Reset after showing success
    setTimeout(() => setExportComplete(false), 3000);
  };

  const generateSampleCSV = () => {
    const headers = "Day,Date,Caption,Asset Filename,Asset Type,CTA,Tags";
    const rows = [
      '1,2026-01-15,"Your resume didn\'t reach a human...",resume_comparison.png,image,"Link in comments","engineer,resume"',
      '2,2026-01-16,"Watch Data + Skill highlights...",skills_carousel.pdf,carousel,"Last Slide CTA","engineer,skills"',
      '3,2026-01-17,"Interview prep is everything...",interview_tips.mp4,video,"Follow for more","interview,tips"',
    ];
    return [headers, ...rows].join("\n");
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
                <p className="text-sm text-muted-foreground">28 scheduled posts</p>
              </div>
              <div className="flex items-center gap-2 text-primary">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">30 days</span>
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
