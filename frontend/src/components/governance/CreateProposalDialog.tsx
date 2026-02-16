"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText } from "lucide-react";

export default function CreateProposalDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (title: string, description: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  function handleSubmit() {
    if (!title.trim() || !description.trim()) return;
    onSubmit(title, description);
    setTitle("");
    setDescription("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-white" />
            Create Proposal
          </DialogTitle>
          <DialogDescription>
            Submit a governance proposal for your circle members to vote on.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Title</label>
            <Input
              placeholder="e.g., Increase contribution period to 60 days"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Description</label>
            <textarea
              className="flex w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 min-h-[100px] resize-none"
              placeholder="Describe your proposal in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!title.trim() || !description.trim()}
            >
              Submit Proposal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
