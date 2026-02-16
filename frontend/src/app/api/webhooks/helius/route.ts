import { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { invalidateCache } from "@/lib/redis";
import { apiError, apiSuccess } from "@/lib/api-utils";

// Instruction names from the Anchor program
const INSTRUCTION_HANDLERS: Record<
  string,
  (supabase: ReturnType<typeof getServiceClient>, event: WebhookEvent) => Promise<void>
> = {
  initializeCircle: handleInitializeCircle,
  joinCircle: handleJoinCircle,
  contribute: handleContribute,
  distributePot: handleDistributePot,
  claimPayout: handleClaimPayout,
  initializeTrustScore: handleInitializeTrustScore,
  updateTrustScore: handleUpdateTrustScore,
  createProposal: handleCreateProposal,
  castVote: handleCastVote,
  stakeInsurance: handleStakeInsurance,
  leaveCircle: handleLeaveCircle,
};

interface WebhookEvent {
  signature: string;
  type: string;
  description: string;
  accountData: Array<{
    account: string;
    nativeBalanceChange: number;
    tokenBalanceChanges: Array<{
      mint: string;
      rawTokenAmount: { tokenAmount: string; decimals: number };
      userAccount: string;
    }>;
  }>;
  instructions: Array<{
    programId: string;
    accounts: string[];
    data: string;
    innerInstructions: unknown[];
  }>;
  events: Record<string, unknown>;
  timestamp: number;
  nativeTransfers: Array<{
    fromUserAccount: string;
    toUserAccount: string;
    amount: number;
  }>;
  tokenTransfers: Array<{
    fromUserAccount: string;
    toUserAccount: string;
    fromTokenAccount: string;
    toTokenAccount: string;
    tokenAmount: number;
    mint: string;
  }>;
}

// POST /api/webhooks/helius — process Helius enhanced transaction webhooks
export async function POST(req: NextRequest) {
  try {
    // Verify webhook secret — reject if not configured or mismatched
    const secret = process.env.HELIUS_WEBHOOK_SECRET;
    if (!secret) {
      console.error("HELIUS_WEBHOOK_SECRET is not configured");
      return apiError("Webhook not configured", 503);
    }
    const webhookSecret = req.headers.get("authorization");
    if (webhookSecret !== `Bearer ${secret}`) {
      return apiError("Unauthorized", 401);
    }

    const events: WebhookEvent[] = await req.json();
    const supabase = getServiceClient();

    for (const event of events) {
      try {
        // Parse instruction type from the transaction
        const instructionType = parseInstructionType(event);

        if (instructionType && INSTRUCTION_HANDLERS[instructionType]) {
          await INSTRUCTION_HANDLERS[instructionType](supabase, event);
        }

        // Log all events
        await supabase.from("activity_log").insert({
          action: instructionType || "unknown",
          tx_signature: event.signature,
          details: {
            type: event.type,
            description: event.description,
            timestamp: event.timestamp,
          },
        });
      } catch (err) {
        console.error(`Error processing event ${event.signature}:`, err);
      }
    }

    return apiSuccess({ processed: events.length });
  } catch (err) {
    console.error("Webhook error:", err);
    return apiError("Internal server error", 500);
  }
}

// Parse the instruction type from transaction data
function parseInstructionType(event: WebhookEvent): string | null {
  // Helius enhanced transactions include a description that often contains
  // the instruction name. In production, you'd decode the instruction data
  // using the IDL discriminator (first 8 bytes of instruction data).
  if (event.description) {
    for (const name of Object.keys(INSTRUCTION_HANDLERS)) {
      if (
        event.description.toLowerCase().includes(name.toLowerCase())
      ) {
        return name;
      }
    }
  }
  return null;
}

// Create notification helper
async function createNotification(
  supabase: ReturnType<typeof getServiceClient>,
  userId: string,
  type: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
) {
  await supabase.from("notifications").insert({
    user_id: userId,
    type,
    title,
    body,
    data: data || null,
  });
}

// --- Instruction Handlers ---

async function handleInitializeCircle(
  supabase: ReturnType<typeof getServiceClient>,
  event: WebhookEvent
) {
  // Circle was initialized on-chain — update status to confirmed
  const circleAccount = event.accountData?.[0]?.account;
  if (circleAccount) {
    await supabase
      .from("circles")
      .update({ status: "forming" })
      .eq("on_chain_pubkey", circleAccount);

    await invalidateCache("circles:*");
  }
}

async function handleJoinCircle(
  supabase: ReturnType<typeof getServiceClient>,
  event: WebhookEvent
) {
  // Extract member and circle from the accounts
  const accounts = event.instructions?.[0]?.accounts || [];
  if (accounts.length < 2) return;

  const circleAccount = accounts[0];
  const memberWallet = accounts[1];

  // Find user by wallet
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("wallet_address", memberWallet)
    .single();

  // Find circle
  const { data: circle } = await supabase
    .from("circles")
    .select("id, current_members")
    .eq("on_chain_pubkey", circleAccount)
    .single();

  if (user && circle) {
    // Insert member record
    await supabase.from("circle_members").upsert(
      {
        circle_id: circle.id,
        user_id: user.id,
        status: "active",
        joined_at: new Date().toISOString(),
      },
      { onConflict: "circle_id,user_id" }
    );

    // Update circle member count
    await supabase
      .from("circles")
      .update({ current_members: circle.current_members + 1 })
      .eq("id", circle.id);

    // Notify circle members
    await createNotification(
      supabase,
      user.id,
      "member_joined",
      "New Member Joined",
      `A new member has joined your circle.`,
      { circle_id: circle.id }
    );

    await invalidateCache(`circle:${circle.id}`);
    await invalidateCache("circles:*");
  }
}

async function handleContribute(
  supabase: ReturnType<typeof getServiceClient>,
  event: WebhookEvent
) {
  // Extract contribution details from token transfers
  const transfer = event.tokenTransfers?.[0];
  if (!transfer) return;

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("wallet_address", transfer.fromUserAccount)
    .single();

  // Find circle from the escrow account
  const { data: circle } = await supabase
    .from("circles")
    .select("id, current_month")
    .eq("escrow_pubkey", transfer.toTokenAccount)
    .single();

  if (user && circle) {
    await supabase.from("contributions").insert({
      circle_id: circle.id,
      user_id: user.id,
      month: circle.current_month,
      amount: transfer.tokenAmount,
      on_time: true,
      tx_signature: event.signature,
    });

    await createNotification(
      supabase,
      user.id,
      "contribution_received",
      "Contribution Confirmed",
      `Your contribution of ${transfer.tokenAmount} has been confirmed.`,
      { circle_id: circle.id, amount: transfer.tokenAmount }
    );

    await invalidateCache(`circle:${circle.id}`);
  }
}

async function handleDistributePot(
  supabase: ReturnType<typeof getServiceClient>,
  event: WebhookEvent
) {
  const transfer = event.tokenTransfers?.[0];
  if (!transfer) return;

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("wallet_address", transfer.toUserAccount)
    .single();

  if (user) {
    await createNotification(
      supabase,
      user.id,
      "payout_distributed",
      "Payout Received",
      `You received a payout of ${transfer.tokenAmount}.`,
      { amount: transfer.tokenAmount, tx: event.signature }
    );
  }

  await invalidateCache("circles:*");
}

async function handleClaimPayout(
  supabase: ReturnType<typeof getServiceClient>,
  event: WebhookEvent
) {
  const transfer = event.tokenTransfers?.[0];
  if (!transfer) return;

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("wallet_address", transfer.toUserAccount)
    .single();

  const { data: circle } = await supabase
    .from("circles")
    .select("id, current_month")
    .eq("escrow_pubkey", transfer.fromTokenAccount)
    .single();

  if (user && circle) {
    await supabase.from("payouts").insert({
      circle_id: circle.id,
      recipient_id: user.id,
      month: circle.current_month,
      gross_amount: transfer.tokenAmount,
      net_amount: transfer.tokenAmount,
      tx_signature: event.signature,
    });

    // Mark member as having received pot
    await supabase
      .from("circle_members")
      .update({ has_received_pot: true })
      .eq("circle_id", circle.id)
      .eq("user_id", user.id);

    await invalidateCache(`circle:${circle.id}`);
  }
}

async function handleInitializeTrustScore(
  supabase: ReturnType<typeof getServiceClient>,
  event: WebhookEvent
) {
  const accounts = event.instructions?.[0]?.accounts || [];
  const walletAddress = accounts[0];

  if (walletAddress) {
    await supabase
      .from("users")
      .update({
        trust_score: 0,
        trust_tier: "newcomer",
      })
      .eq("wallet_address", walletAddress);

    await invalidateCache(`trust:${walletAddress}`);
  }
}

async function handleUpdateTrustScore(
  supabase: ReturnType<typeof getServiceClient>,
  event: WebhookEvent
) {
  const accounts = event.instructions?.[0]?.accounts || [];
  const walletAddress = accounts[0];

  if (walletAddress) {
    // Re-read the on-chain trust score will happen on next API fetch
    await invalidateCache(`trust:${walletAddress}`);
    await invalidateCache(`user:${walletAddress}`);
  }
}

async function handleCreateProposal(
  supabase: ReturnType<typeof getServiceClient>,
  event: WebhookEvent
) {
  const accounts = event.instructions?.[0]?.accounts || [];
  if (accounts.length >= 2) {
    const circleAccount = accounts[1];
    const { data: circle } = await supabase
      .from("circles")
      .select("id")
      .eq("on_chain_pubkey", circleAccount)
      .single();

    if (circle) {
      // Notify all circle members about new proposal
      const { data: members } = await supabase
        .from("circle_members")
        .select("user_id")
        .eq("circle_id", circle.id);

      if (members) {
        for (const member of members) {
          await createNotification(
            supabase,
            member.user_id,
            "proposal_created",
            "New Proposal",
            "A new governance proposal has been created in your circle.",
            { circle_id: circle.id }
          );
        }
      }
    }
  }
}

async function handleCastVote(
  _supabase: ReturnType<typeof getServiceClient>,
  _event: WebhookEvent
) {
  // Vote processing — proposal vote counts update on-chain
  // The frontend will re-fetch proposal data on next view
}

async function handleStakeInsurance(
  supabase: ReturnType<typeof getServiceClient>,
  event: WebhookEvent
) {
  const transfer = event.tokenTransfers?.[0];
  if (!transfer) return;

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("wallet_address", transfer.fromUserAccount)
    .single();

  if (user) {
    // Update member's insurance stake
    const { data: circle } = await supabase
      .from("circles")
      .select("id")
      .eq("insurance_pool_pubkey", transfer.toTokenAccount)
      .single();

    if (circle) {
      await supabase
        .from("circle_members")
        .update({ insurance_staked: transfer.tokenAmount })
        .eq("circle_id", circle.id)
        .eq("user_id", user.id);

      await invalidateCache(`circle:${circle.id}`);
    }
  }
}

async function handleLeaveCircle(
  supabase: ReturnType<typeof getServiceClient>,
  event: WebhookEvent
) {
  const accounts = event.instructions?.[0]?.accounts || [];
  if (accounts.length < 2) return;

  const circleAccount = accounts[0];
  const walletAddress = accounts[1];

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("wallet_address", walletAddress)
    .single();

  const { data: circle } = await supabase
    .from("circles")
    .select("id, current_members")
    .eq("on_chain_pubkey", circleAccount)
    .single();

  if (user && circle) {
    await supabase
      .from("circle_members")
      .update({ status: "left" })
      .eq("circle_id", circle.id)
      .eq("user_id", user.id);

    await supabase
      .from("circles")
      .update({ current_members: Math.max(0, circle.current_members - 1) })
      .eq("id", circle.id);

    await invalidateCache(`circle:${circle.id}`);
    await invalidateCache("circles:*");
  }
}
