"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Clock, ThumbsUp, ThumbsDown, Users } from "lucide-react";

type Proposal = {
  id: string;
  title: string;
  description: string;
  proposer: string;
  status: "active" | "passed" | "rejected" | "executed";
  votesFor: number;
  votesAgainst: number;
  totalVoters: number;
  endTime: string;
  circleId: string;
};

function getStatusVariant(status: Proposal["status"]) {
  switch (status) {
    case "active": return "default";
    case "passed": return "success";
    case "rejected": return "destructive";
    case "executed": return "secondary";
  }
}

function timeRemaining(endTime: string): string {
  const diff = new Date(endTime).getTime() - Date.now();
  if (diff <= 0) return "Ended";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h left`;
  return `${hours}h left`;
}

export default function ProposalCard({
  proposal,
  onVote,
}: {
  proposal: Proposal;
  onVote?: (proposalId: string, support: boolean) => void;
}) {
  const totalVotes = proposal.votesFor + proposal.votesAgainst;
  const forPercent = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 50;

  return (
    <Card className="border-white/5 bg-white/[0.03] backdrop-blur-xl hover:bg-white/[0.06] transition-all">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-sans text-lg font-semibold text-white truncate">
              {proposal.title}
            </h3>
            <p className="text-sm text-white/40 mt-1">
              by {proposal.proposer.slice(0, 4)}...{proposal.proposer.slice(-4)}
            </p>
          </div>
          <Badge variant={getStatusVariant(proposal.status)}>
            {proposal.status}
          </Badge>
        </div>

        <p className="text-sm text-white/60 mb-4 line-clamp-2">
          {proposal.description}
        </p>

        {/* Vote bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-white/50 mb-1">
            <span className="text-white">For: {proposal.votesFor}</span>
            <span className="text-neutral-400">Against: {proposal.votesAgainst}</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden flex">
            <div
              className="h-full bg-white transition-all"
              style={{ width: `${forPercent}%` }}
            />
            <div
              className="h-full bg-neutral-600 transition-all"
              style={{ width: `${100 - forPercent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-white/40">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {proposal.totalVoters} voters
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {timeRemaining(proposal.endTime)}
            </span>
          </div>

          {proposal.status === "active" && onVote && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="gap-1 text-white border-white/20 hover:bg-white/5"
                onClick={() => onVote(proposal.id, true)}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                For
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1 text-neutral-400 border-white/10 hover:bg-white/5"
                onClick={() => onVote(proposal.id, false)}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                Against
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
