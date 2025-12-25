import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Target, Users, Palette, Volume2, Calendar, Zap, Settings, Upload, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneratedContent } from "./GeneratedContent";
import { ExcelUploader } from "./ExcelUploader";
import { themeStorage, postsStorage, assetStorage } from "@/lib/storage";
import { generateContent, isAIConfigured } from "@/lib/aiService";
import type { GeneratedPost } from "@/types";
import { toast } from "sonner";
import { APIKeyDialog } from "./APIKeyDialog";

const contentPillars = [
  { id: "problem", label: "Problem", description: "Pain points & challenges" },
  { id: "data", label: "Data", description: "Stats & research" },
  { id: "education", label: "Education", description: "Tips & how-tos" },
  { id: "social-proof", label: "Social Proof", description: "Results & testimonials" },
  { id: "product", label: "Product", description: "Features & updates" },
];

const audiences = [
  { id: "swe", label: "Software Engineers" },
  { id: "ml", label: "ML/AI Engineers" },
  { id: "ux", label: "UX Designers" },
  { id: "pm", label: "Product Managers" },
  { id: "founders", label: "Founders" },
];

const formats = [
  { id: "image", label: "Single Image" },
  { id: "carousel", label: "Carousel (PDF)" },
  { id: "video", label: "Video" },
  { id: "text", label: "Text Only" },
];

const tones = [
  { id: "casual", label: "Casual", emoji: "😊" },
  { id: "professional", label: "Professional", emoji: "💼" },
  { id: "contrarian", label: "Contrarian", emoji: "🔥" },
  { id: "data-driven", label: "Data-driven", emoji: "📊" },
];

export function ThemeGenerator() {
  const [selectedPillars, setSelectedPillars] = useState<string[]>(["education"]);
  const [selectedAudience, setSelectedAudience] = useState("swe");
  const [selectedFormat, setSelectedFormat] = useState("image");
  const [selectedTone, setSelectedTone] = useState("professional");
  const [daysToFill, setDaysToFill] = useState(7);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedPost[]>([]);
  const [showAPIKeyDialog, setShowAPIKeyDialog] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const [generationMode, setGenerationMode] = useState<"ai" | "excel">("excel");

  // Load saved theme settings on mount
  useEffect(() => {
    const savedTheme = themeStorage.get();
    if (savedTheme) {
      setSelectedPillars(savedTheme.pillars);
      setSelectedAudience(savedTheme.audience);
      setSelectedFormat(savedTheme.format);
      setSelectedTone(savedTheme.tone);
      setDaysToFill(savedTheme.daysToFill);
    }

    // Load previously generated content
    const savedPosts = postsStorage.getAll();
    setGeneratedContent(savedPosts);

    // Check if AI is configured
    setUseAI(isAIConfigured());
  }, []);

  const togglePillar = (id: string) => {
    setSelectedPillars((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);

      // Save theme settings
      const theme = {
        pillars: selectedPillars,
        audience: selectedAudience,
        format: selectedFormat,
        tone: selectedTone,
        daysToFill,
      };
      themeStorage.save(theme);

      let newContent: GeneratedPost[];

      if (useAI && isAIConfigured()) {
        // Use real AI generation
        try {
          const assets = assetStorage.getAll();
          newContent = await generateContent({
            theme,
            availableAssets: assets,
            startDate: new Date(),
          });
          toast.success(`AI generated ${daysToFill} posts!`);
        } catch (error: any) {
          console.error("AI generation error:", error);
          if (error.message?.includes("API key")) {
            toast.error("API key not configured. Using mock data.");
            newContent = generateMockContent();
          } else {
            throw error;
          }
        }
      } else {
        // Use mock generation
        await new Promise((resolve) => setTimeout(resolve, 1000));
        newContent = generateMockContent();
        toast.success(`Generated ${daysToFill} mock posts!`);
      }

      // Clear previous posts and save new ones
      postsStorage.clear();
      postsStorage.addBatch(newContent);

      setGeneratedContent(newContent);
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error("Failed to generate content");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockContent = (): GeneratedPost[] => {
    return Array.from({ length: daysToFill }, (_, i) => ({
      id: `post-${Date.now()}-${i}`,
      day: i + 1,
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString(),
      caption: `Your resume didn't reach a human.\n\nHere's why 70% of resumes never make it past the ATS.\n\nMost applicants don't realize that:\n→ Keywords matter more than you think\n→ Formatting can break parsing\n→ Simple changes can double your callbacks\n\nI've reviewed 1,000+ resumes.\nHere's what actually works:\n\n[Thread continues...]`,
      hook: "Your resume didn't reach a human.",
      cta: "Follow for more resume tips!",
      imagePrompt: "Split-screen comparison showing a rejected resume on left (red X) vs an optimized resume on right (green check), modern minimal design",
      pillar: contentPillars[i % contentPillars.length].label,
      format: selectedFormat,
      tags: selectedPillars,
    }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Theme Generator</h1>
          <p className="text-muted-foreground mt-2">Configure your content strategy and generate AI-powered posts</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAPIKeyDialog(true)}
          >
            <Settings className="w-4 h-4" />
            {useAI ? "AI Configured" : "Configure AI"}
          </Button>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary">
            <Sparkles className={`w-4 h-4 ${useAI ? "text-primary" : "text-muted-foreground"}`} />
            <label className="text-sm font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={useAI}
                onChange={(e) => setUseAI(e.target.checked)}
                className="mr-2"
                disabled={!isAIConfigured()}
              />
              Use AI
            </label>
          </div>
        </div>
      </motion.div>

      <APIKeyDialog
        open={showAPIKeyDialog}
        onOpenChange={setShowAPIKeyDialog}
        onSave={() => setUseAI(isAIConfigured())}
      />

      {/* Generation Mode Tabs */}
      <Tabs value={generationMode} onValueChange={(v) => setGenerationMode(v as "ai" | "excel")}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="excel" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload from Excel
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Wand2 className="w-4 h-4" />
            Generate with AI
          </TabsTrigger>
        </TabsList>

        {/* Excel Upload Tab */}
        <TabsContent value="excel" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <ExcelUploader onUploadComplete={setGeneratedContent} />
            </div>
            <div className="lg:col-span-2">
              <GeneratedContent
                content={generatedContent}
                isLoading={false}
                onUpdate={setGeneratedContent}
              />
            </div>
          </div>
        </TabsContent>

        {/* AI Generation Tab */}
        <TabsContent value="ai" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Configuration Panel */}
            <div className="lg:col-span-1 space-y-6">
          {/* Content Pillars */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-card p-6 space-y-4"
          >
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="font-display font-semibold text-foreground">Content Pillars</h3>
            </div>
            <div className="space-y-2">
              {contentPillars.map((pillar) => (
                <button
                  key={pillar.id}
                  onClick={() => togglePillar(pillar.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedPillars.includes(pillar.id)
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <p className="font-medium text-foreground">{pillar.label}</p>
                  <p className="text-xs text-muted-foreground">{pillar.description}</p>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Target Audience */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card p-6 space-y-4"
          >
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="font-display font-semibold text-foreground">Target Audience</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {audiences.map((audience) => (
                <button
                  key={audience.id}
                  onClick={() => setSelectedAudience(audience.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedAudience === audience.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {audience.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Format */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-card p-6 space-y-4"
          >
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              <h3 className="font-display font-semibold text-foreground">Format</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {formats.map((format) => (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    selectedFormat === format.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {format.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Tone */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-card p-6 space-y-4"
          >
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-primary" />
              <h3 className="font-display font-semibold text-foreground">Tone</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {tones.map((tone) => (
                <button
                  key={tone.id}
                  onClick={() => setSelectedTone(tone.id)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    selectedTone === tone.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tone.emoji} {tone.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Days to Fill */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="glass-card p-6 space-y-4"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="font-display font-semibold text-foreground">Days to Fill</h3>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="30"
                value={daysToFill}
                onChange={(e) => setDaysToFill(Number(e.target.value))}
                className="flex-1 accent-primary"
              />
              <span className="text-2xl font-display font-bold text-primary w-12 text-right">
                {daysToFill}
              </span>
            </div>
          </motion.div>

          {/* Generate Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Button
              variant="gradient"
              size="xl"
              className="w-full"
              onClick={handleGenerate}
              disabled={isGenerating || selectedPillars.length === 0}
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Generate {daysToFill} Posts
                </>
              )}
            </Button>
          </motion.div>
        </div>

            {/* Generated Content Preview */}
            <div className="lg:col-span-2">
              <GeneratedContent
                content={generatedContent}
                isLoading={isGenerating}
                onUpdate={setGeneratedContent}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
