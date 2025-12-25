import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatForLinkedIn, validateLinkedInPost, copyToClipboardForLinkedIn } from "@/lib/linkedinFormatter";
import { postsStorage, assetStorage } from "@/lib/storage";
import type { GeneratedPost, Asset } from "@/types";
import { toast } from "sonner";
import { Calendar, Copy, Check, AlertTriangle } from "lucide-react";

interface PostEditorProps {
  post: GeneratedPost;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedPost: GeneratedPost) => void;
}

export function PostEditor({ post, open, onOpenChange, onSave }: PostEditorProps) {
  const [editedPost, setEditedPost] = useState(post);
  const [showPreview, setShowPreview] = useState(false);
  const [assets] = useState<Asset[]>(assetStorage.getAll());

  const validation = validateLinkedInPost(editedPost.caption);
  const previewText = formatForLinkedIn(editedPost.caption);

  const handleSave = () => {
    postsStorage.update(editedPost.id, editedPost);
    onSave(editedPost);
    toast.success("Post updated successfully!");
    onOpenChange(false);
  };

  const handleCopy = async () => {
    const success = await copyToClipboardForLinkedIn(editedPost.caption);
    if (success) {
      toast.success("Copied to clipboard with LinkedIn formatting!");
    } else {
      toast.error("Failed to copy");
    }
  };

  const availableAssets = assets.filter(a => a.type === editedPost.format);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Post - Day {post.day}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Side */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hook">Hook</Label>
              <Input
                id="hook"
                value={editedPost.hook}
                onChange={(e) => setEditedPost({ ...editedPost, hook: e.target.value })}
                placeholder="Attention-grabbing first line"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="caption">Caption</Label>
              <Textarea
                id="caption"
                value={editedPost.caption}
                onChange={(e) => setEditedPost({ ...editedPost, caption: e.target.value })}
                rows={12}
                className="font-mono text-sm"
                placeholder="Write your LinkedIn post..."
              />
              <div className="flex items-center justify-between text-xs">
                <span className={editedPost.caption.length > 3000 ? "text-red-500" : "text-muted-foreground"}>
                  {editedPost.caption.length} / 3000 characters
                </span>
                {editedPost.caption.length > 1300 && (
                  <span className="text-amber-500">Will show "see more" in feed</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cta">Call to Action</Label>
              <Input
                id="cta"
                value={editedPost.cta}
                onChange={(e) => setEditedPost({ ...editedPost, cta: e.target.value })}
                placeholder="What should readers do next?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imagePrompt">Image Prompt</Label>
              <Textarea
                id="imagePrompt"
                value={editedPost.imagePrompt}
                onChange={(e) => setEditedPost({ ...editedPost, imagePrompt: e.target.value })}
                rows={3}
                placeholder="Describe the visual for this post"
              />
            </div>

            {availableAssets.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="asset">Linked Asset</Label>
                <Select
                  value={editedPost.assetId || "none"}
                  onValueChange={(value) =>
                    setEditedPost({ ...editedPost, assetId: value === "none" ? undefined : value })
                  }
                >
                  <SelectTrigger id="asset">
                    <SelectValue placeholder="Select an asset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No asset</SelectItem>
                    {availableAssets.map((asset) => (
                      <SelectItem key={asset.id} value={asset.id}>
                        {asset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="date">Scheduled Date</Label>
              <Input
                id="date"
                type="date"
                value={editedPost.date ? new Date(editedPost.date).toISOString().split('T')[0] : ''}
                onChange={(e) => setEditedPost({ ...editedPost, date: e.target.value })}
              />
            </div>
          </div>

          {/* Preview Side */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>LinkedIn Preview</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? "Show Raw" : "Show Preview"}
              </Button>
            </div>

            <div className="p-4 rounded-lg bg-card border border-border min-h-[300px]">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="font-semibold text-foreground mb-2">{editedPost.hook}</p>
                <div className="whitespace-pre-wrap text-sm text-foreground">
                  {showPreview ? previewText : editedPost.caption}
                </div>
              </div>
            </div>

            {/* Validation */}
            {validation.errors.length > 0 && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Errors
                </p>
                <ul className="text-xs text-red-600/80 dark:text-red-400/80 space-y-1">
                  {validation.errors.map((error, i) => (
                    <li key={i}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {validation.warnings.length > 0 && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Suggestions
                </p>
                <ul className="text-xs text-amber-600/80 dark:text-amber-400/80 space-y-1">
                  {validation.warnings.map((warning, i) => (
                    <li key={i}>• {warning}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-2">
              <Button variant="outline" className="w-full" onClick={handleCopy}>
                <Copy className="w-4 h-4" />
                Copy with LinkedIn Formatting
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Preserves line breaks and formatting when pasted
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!validation.valid}>
            <Check className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
