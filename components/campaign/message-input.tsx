"use client";

import { useState, useRef, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Send, Loader2 } from "lucide-react";
import { uploadCampaignFile } from "@/lib/file-upload";
import { useToast } from "@/hooks/use-toast";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onSendFile: (file: File, url: string) => void;
  campaignId: string;
  userId: string;
  disabled?: boolean;
}

export function MessageInput({
  onSendMessage,
  onSendFile,
  campaignId,
  userId,
  disabled,
}: MessageInputProps) {
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed && !pendingFile) return;

    if (trimmed) {
      onSendMessage(trimmed);
      setText("");
    }

    if (pendingFile) {
      handleFileUpload(pendingFile);
      setPendingFile(null);
    }

    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleFileUpload(file);
    e.target.value = "";
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const { url } = await uploadCampaignFile(file, campaignId, userId);
      onSendFile(file, url);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      toast({
        title: "Upload failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border-t bg-card p-3">
      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,video/*,.pdf,.doc,.docx"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 h-9 w-9"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Paperclip className="h-4 w-4" />
          )}
        </Button>
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="min-h-[40px] max-h-[120px] resize-none text-sm"
          rows={1}
          disabled={disabled || uploading}
        />
        <Button
          type="button"
          size="icon"
          className="shrink-0 h-9 w-9"
          onClick={handleSend}
          disabled={disabled || uploading || (!text.trim() && !pendingFile)}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
