import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveAPIKey, clearAPIKey, isAIConfigured } from "@/lib/aiService";
import { toast } from "sonner";
import { Eye, EyeOff, Key } from "lucide-react";

interface APIKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: () => void;
}

export function APIKeyDialog({ open, onOpenChange, onSave }: APIKeyDialogProps) {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isConfigured, setIsConfigured] = useState(isAIConfigured());

  const handleSave = () => {
    if (!apiKey.trim()) {
      toast.error("Please enter an API key");
      return;
    }

    if (!apiKey.startsWith("sk-ant-")) {
      toast.error("Invalid Anthropic API key format. Should start with 'sk-ant-'");
      return;
    }

    saveAPIKey(apiKey.trim());
    setIsConfigured(true);
    toast.success("API key saved successfully!");
    setApiKey("");
    onSave?.();
    onOpenChange(false);
  };

  const handleClear = () => {
    clearAPIKey();
    setIsConfigured(false);
    setApiKey("");
    toast.success("API key cleared");
    onSave?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            Configure AI API Key
          </DialogTitle>
          <DialogDescription>
            Add your Anthropic API key to enable AI-powered content generation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {isConfigured && (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                ✓ API key is configured
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="api-key">Anthropic API Key</Label>
            <div className="relative">
              <Input
                id="api-key"
                type={showKey ? "text" : "password"}
                placeholder="sk-ant-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Get your API key from{" "}
              <a
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Anthropic Console
              </a>
            </p>
          </div>

          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <h4 className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-2">
              ⚠️ Security Notice
            </h4>
            <p className="text-xs text-muted-foreground">
              Your API key is stored locally in your browser and never sent to any server except Anthropic's API.
              Keep your API key secure and never share it publicly.
            </p>
          </div>

          <div className="flex justify-between gap-3 pt-2">
            {isConfigured && (
              <Button variant="destructive" onClick={handleClear}>
                Clear API Key
              </Button>
            )}
            <div className="flex gap-3 ml-auto">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!apiKey.trim()}>
                Save API Key
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
