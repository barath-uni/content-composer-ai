import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Target, Users, Palette, Volume2, Calendar, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GeneratedContent } from "./GeneratedContent";
import { themeStorage, postsStorage } from "@/lib/storage";
import type { GeneratedPost } from "@/types";
import { toast } from "sonner";

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
      themeStorage.save({
        pillars: selectedPillars,
        audience: selectedAudience,
        format: selectedFormat,
        tone: selectedTone,
        daysToFill,
      });

      // Simulate AI generation (in real implementation, this would call an AI API)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockContent: GeneratedPost[] = Array.from({ length: daysToFill }, (_, i) => ({
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

      // Clear previous posts and save new ones
      postsStorage.clear();
      postsStorage.addBatch(mockContent);

      setGeneratedContent(mockContent);
      toast.success(`Successfully generated ${daysToFill} posts!`);
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error("Failed to generate content");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-display font-bold text-foreground">Theme Generator</h1>
        <p className="text-muted-foreground mt-2">Configure your content strategy and generate AI-powered posts</p>
      </motion.div>

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
          <GeneratedContent content={generatedContent} isLoading={isGenerating} />
        </div>
      </div>
    </div>
  );
}
