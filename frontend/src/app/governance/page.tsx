"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import ProposalCard from "@/components/governance/ProposalCard";

const mockProposals = [
  {
    id: "1",
    title: "Increase contribution period to 45 days",
    description: "Proposal to extend the contribution window from 30 days to 45 days.",
    proposer: "7xKX...9fGh",
    status: "active" as const,
    votesFor: 8,
    votesAgainst: 3,
    totalVoters: 11,
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    circleId: "circle-1",
  },
  {
    id: "2",
    title: "Add insurance requirement for new members",
    description: "Require all new members to stake at least 15% as insurance.",
    proposer: "3mNP...2kLz",
    status: "passed" as const,
    votesFor: 12,
    votesAgainst: 2,
    totalVoters: 14,
    endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    circleId: "circle-1",
  },
];

export default function GovernancePage() {
  const [tab, setTab] = useState("active");
  const activeProposals = mockProposals.filter((p) => p.status === "active");
  const pastProposals = mockProposals.filter((p) => p.status !== "active");

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-center">
        <p className="text-amber-300 text-sm font-medium">
          Governance is coming soon. Below is a preview of planned features.
        </p>
      </div>

      <div className="opacity-60 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-sans text-3xl font-bold">Governance</h1>
              <p className="text-white/50 mt-1">
                Vote on proposals and shape your circles
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card className="border-white/5 bg-white/[0.03]">
              <CardContent className="p-4 text-center">
                <div className="font-sans text-2xl font-bold text-white">
                  {activeProposals.length}
                </div>
                <p className="text-xs text-white/40">Active Proposals</p>
              </CardContent>
            </Card>
            <Card className="border-white/5 bg-white/[0.03]">
              <CardContent className="p-4 text-center">
                <div className="font-sans text-2xl font-bold text-white">
                  {pastProposals.length}
                </div>
                <p className="text-xs text-white/40">Passed</p>
              </CardContent>
            </Card>
            <Card className="border-white/5 bg-white/[0.03]">
              <CardContent className="p-4 text-center">
                <Vote className="w-6 h-6 inline text-neutral-300" />
                <p className="text-xs text-white/40 mt-1">Quadratic Voting</p>
              </CardContent>
            </Card>
          </div>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="w-full mb-6">
              <TabsTrigger value="active" className="flex-1">
                Active ({activeProposals.length})
              </TabsTrigger>
              <TabsTrigger value="past" className="flex-1">
                Past ({pastProposals.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="active">
              <div className="space-y-4">
                {activeProposals.map((proposal) => (
                  <ProposalCard key={proposal.id} proposal={proposal} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="past">
              <div className="space-y-4">
                {pastProposals.map((proposal) => (
                  <ProposalCard key={proposal.id} proposal={proposal} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
