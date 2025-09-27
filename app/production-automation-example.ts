import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { HaloProtocol } from "../target/types/halo_protocol";
import { HaloProtocolClient } from "./halo-client";

/**
 * Production Switchboard Oracle Integration Example
 * 
 * This example demonstrates how to integrate with real Switchboard oracles
 * for production automation in the Halo Protocol.
 * 
 * Prerequisites:
 * 1. Switchboard Oracle deployed on target network
 * 2. Oracle queue with available oracles
 * 3. Sufficient funds for oracle fees
 */

// Switchboard Oracle Configuration (Devnet)
const SWITCHBOARD_CONFIG = {
    // Devnet Switchboard Program ID
    PROGRAM_ID: "2TfB33aLaneQb5TNVwyDz3jSZXS6jdW2ARw1Dgf84XCG",
    
    // Devnet Queue - replace with actual queue address
    QUEUE: "F8ce7MsckeZAbAGmxjJNetxYXQa9mKr9nnrC3qKubyYy",
    
    // Oracle authority - usually the deployer
    AUTHORITY: "YOUR_ORACLE_AUTHORITY_PUBKEY",
    
    // Crank address for processing oracle updates
    CRANK: "GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR",
};

/**
 * Create a Switchboard job for circle automation
 */
async function createSwitchboardJobConfig(
    circleAccount: anchor.web3.PublicKey,
    programId: anchor.web3.PublicKey
) {
    return {
        name: `Halo Circle ${circleAccount.toString().slice(0, 8)}`,
        metadata: `Automation job for Halo Protocol circle ${circleAccount.toString()}`,
        authority: new anchor.web3.PublicKey(SWITCHBOARD_CONFIG.AUTHORITY),
        
        // Job definition with tasks
        tasks: [
            // Task 1: Get current timestamp from HTTP API
            {
                httpTask: {
                    url: "https://worldtimeapi.org/api/timezone/UTC",
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            },
            
            // Task 2: Extract timestamp from response
            {
                jsonParseTask: {
                    path: "$.unixtime"
                }
            },
            
            // Task 3: Check if automation should execute based on schedule
            {
                conditionalTask: {
                    attempt: [
                        {
                            valueTask: {
                                big: "${jsonParse.result}"
                            }
                        }
                    ],
                    onSuccess: [
                        // Task 4: Fetch circle automation data
                        {
                            anchorFetchTask: {
                                programId: programId.toString(),
                                accountAddress: circleAccount.toString()
                            }
                        }
                    ]
                }
            },
            
            // Task 5: Conditional execution based on schedule
            {
                conditionalTask: {
                    attempt: [
                        {
                            valueTask: {
                                // This would contain the logic to check if current time
                                // matches any scheduled automation times
                                big: "1" // Simplified for example
                            }
                        }
                    ],
                    onSuccess: [
                        // Task 6: Call automation instruction
                        {
                            anchorInstructionTask: {
                                programId: programId.toString(),
                                instructionName: "automated_contribution_collection",
                                accounts: [
                                    {
                                        name: "circle_automation",
                                        isSigner: false,
                                        isWritable: true,
                                        publicKey: "CIRCLE_AUTOMATION_PDA"
                                    },
                                    // Additional required accounts...
                                ]
                            }
                        }
                    ]
                }
            }
        ],
        
        // Execution configuration
        schedule: [
            {
                // Check every hour
                nextAllowedTimestamp: Math.floor(Date.now() / 1000) + 3600,
                expiration: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60) // 1 year
            }
        ]
    };
}

/**
 * Setup production Switchboard automation for a circle
 */
async function setupProductionAutomation(
    client: HaloProtocolClient,
    circleAccount: anchor.web3.PublicKey,
    authority: anchor.web3.Keypair,
    program: Program<HaloProtocol>
): Promise<void> {
    console.log("🔧 Setting up production Switchboard automation...");
    
    try {
        // Step 1: Initialize global automation state if not exists
        const switchboardQueue = new anchor.web3.PublicKey(SWITCHBOARD_CONFIG.QUEUE);
        
        let automationState;
        try {
            automationState = await client.getAutomationState();
            console.log("✅ Automation state already exists");
        } catch (error) {
            console.log("🚀 Initializing automation state...");
            const result = await client.initializeAutomationState(
                authority,
                switchboardQueue,
                3600 // 1 hour minimum interval
            );
            automationState = await client.getAutomationState();
            console.log("✅ Automation state initialized:", result.automationStateAccount.toString());
        }
        
        // Step 2: Create Switchboard job configuration
        const jobConfig = await createSwitchboardJobConfig(circleAccount, program.programId);
        console.log("📋 Job configuration created");
        
        // Step 3: Setup circle automation (using mock job for now)
        // In production, you would create the actual Switchboard job here
        const mockSwitchboardJob = anchor.web3.Keypair.generate();
        console.log("⚠️  Using mock Switchboard job for demonstration");
        console.log("🔑 Mock job account:", mockSwitchboardJob.publicKey.toString());
        
        const { circleAutomationAccount } = await client.setupCircleAutomation(
            circleAccount,
            authority,
            mockSwitchboardJob.publicKey,
            true, // enable contribution collection
            true, // enable payout distribution
            true  // enable penalty enforcement
        );
        
        console.log("✅ Circle automation setup complete");
        console.log("🤖 Circle automation account:", circleAutomationAccount.toString());
        
        // Step 4: Verify automation configuration
        const circleAutomation = await client.getCircleAutomation(circleAccount);
        
        console.log("\n📊 Automation Configuration:");
        console.log("- Auto collect enabled:", circleAutomation.autoCollectEnabled);
        console.log("- Auto distribute enabled:", circleAutomation.autoDistributeEnabled);
        console.log("- Auto penalty enabled:", circleAutomation.autoPenaltyEnabled);
        console.log("- Contribution schedule entries:", circleAutomation.contributionSchedule.length);
        console.log("- Distribution schedule entries:", circleAutomation.distributionSchedule.length);
        console.log("- Penalty schedule entries:", circleAutomation.penaltySchedule.length);
        
        // Step 5: Display schedule preview
        console.log("\n📅 Schedule Preview:");
        const now = Math.floor(Date.now() / 1000);
        
        circleAutomation.contributionSchedule.forEach((timestamp: any, index: number) => {
            const date = new Date(timestamp.toNumber() * 1000);
            const isPast = timestamp.toNumber() < now;
            console.log(`  Contribution ${index + 1}: ${date.toISOString()} ${isPast ? '(past)' : '(future)'}`);
        });
        
        console.log("\n✅ Production automation setup complete!");
        console.log("\n📝 Next steps:");
        console.log("1. Create actual Switchboard job with the configuration above");
        console.log("2. Fund the oracle job with sufficient SOL for execution");
        console.log("3. Monitor automation events and job execution");
        console.log("4. Set up alerts for failed automation attempts");
        
    } catch (error) {
        console.error("❌ Failed to setup production automation:", error);
        throw error;
    }
}

/**
 * Monitor automation execution
 */
async function monitorAutomation(
    client: HaloProtocolClient,
    circleAccount: anchor.web3.PublicKey,
    program: Program<HaloProtocol>
): Promise<void> {
    console.log("📊 Monitoring automation for circle:", circleAccount.toString());
    
    try {
        // Get current automation state
        const automationState = await client.getAutomationState();
        const circleAutomation = await client.getCircleAutomation(circleAccount);
        
        console.log("\n🔍 Current State:");
        console.log("- Global automation enabled:", automationState.enabled);
        console.log("- Active automation jobs:", automationState.activeJobs);
        console.log("- Minimum check interval:", automationState.minInterval.toString(), "seconds");
        console.log("- Last global check:", new Date(automationState.lastCheck.toNumber() * 1000).toISOString());
        
        // Check what automation should execute
        const nextEvents = await client.getNextAutomationEvents(circleAccount);
        const currentTime = Math.floor(Date.now() / 1000);
        
        console.log("\n⏰ Upcoming Events:");
        if (nextEvents.nextContribution) {
            const contributionDate = new Date(nextEvents.nextContribution * 1000);
            const timeUntil = nextEvents.nextContribution - currentTime;
            console.log(`- Next contribution: ${contributionDate.toISOString()} (in ${Math.round(timeUntil / 3600)} hours)`);
        }
        
        if (nextEvents.nextDistribution) {
            const distributionDate = new Date(nextEvents.nextDistribution * 1000);
            const timeUntil = nextEvents.nextDistribution - currentTime;
            console.log(`- Next distribution: ${distributionDate.toISOString()} (in ${Math.round(timeUntil / 3600)} hours)`);
        }
        
        if (nextEvents.nextPenalty) {
            const penaltyDate = new Date(nextEvents.nextPenalty * 1000);
            const timeUntil = nextEvents.nextPenalty - currentTime;
            console.log(`- Next penalty check: ${penaltyDate.toISOString()} (in ${Math.round(timeUntil / 3600)} hours)`);
        }
        
        // Check if any automation is due now
        const dueTasks = [];
        
        if (await client.isTimeForContributionCollection(circleAccount)) {
            dueTasks.push("Contribution Collection");
        }
        
        if (await client.isTimeForPayoutDistribution(circleAccount)) {
            dueTasks.push("Payout Distribution");
        }
        
        if (await client.isTimeForPenaltyEnforcement(circleAccount)) {
            dueTasks.push("Penalty Enforcement");
        }
        
        if (dueTasks.length > 0) {
            console.log("\n🚨 Tasks Due Now:");
            dueTasks.forEach(task => console.log(`- ${task}`));
        } else {
            console.log("\n✅ No automation tasks currently due");
        }
        
        // Get recent automation events
        console.log("\n📋 Recent Automation Events:");
        try {
            const events = await program.account.automationEvent.all([
                {
                    memcmp: {
                        offset: 8, // Skip discriminator
                        bytes: circleAccount.toBase58()
                    }
                }
            ]);
            
            if (events.length > 0) {
                const recentEvents = events
                    .sort((a: any, b: any) => b.account.timestamp.toNumber() - a.account.timestamp.toNumber())
                    .slice(0, 5);
                
                recentEvents.forEach((event: any) => {
                    const date = new Date(event.account.timestamp.toNumber() * 1000);
                    const success = event.account.success ? "✅" : "❌";
                    console.log(`  ${success} ${event.account.eventType} at ${date.toISOString()}`);
                });
            } else {
                console.log("  No automation events found");
            }
        } catch (error) {
            console.log("  Unable to fetch automation events");
        }
        
    } catch (error) {
        console.error("❌ Failed to monitor automation:", error);
        throw error;
    }
}

/**
 * Main function to demonstrate production integration
 */
async function runProductionIntegration() {
    console.log("🌟 Halo Protocol - Production Switchboard Integration");
    console.log("================================================");
    
    // Initialize provider and program
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.HaloProtocol as Program<HaloProtocol>;
    const client = new HaloProtocolClient(program);
    
    // For demonstration, we'll use a mock circle
    // In production, you would use an actual circle account
    const mockCircleAccount = anchor.web3.Keypair.generate();
    const authority = anchor.web3.Keypair.generate();
    
    console.log("🔑 Mock Circle Account:", mockCircleAccount.publicKey.toString());
    console.log("🔑 Authority:", authority.publicKey.toString());
    
    try {
        // This would typically be called when creating a new circle
        console.log("\n1️⃣ Setting up production automation...");
        // await setupProductionAutomation(client, mockCircleAccount.publicKey, authority, program);
        
        // This would be run periodically to monitor automation
        console.log("\n2️⃣ Monitoring automation status...");
        // await monitorAutomation(client, mockCircleAccount.publicKey, program);
        
        console.log("\n🎯 Production Integration Guide:");
        console.log("=====================================");
        console.log("1. Deploy to target network (devnet/mainnet)");
        console.log("2. Fund automation authority with SOL");
        console.log("3. Create Switchboard job with real oracle queue");
        console.log("4. Set up monitoring and alerting");
        console.log("5. Test automation with small amounts first");
        console.log("6. Scale up to production volumes");
        
        console.log("\n📚 Additional Resources:");
        console.log("- Switchboard Documentation: https://docs.switchboard.xyz/");
        console.log("- Oracle Job Examples: https://github.com/switchboard-xyz/sbv2-core");
        console.log("- Halo Protocol Automation Docs: ./AUTOMATION_INTEGRATION.md");
        
    } catch (error) {
        console.error("❌ Production integration failed:", error);
    }
}

// Export functions for use in other scripts
export {
    setupProductionAutomation,
    monitorAutomation,
    createSwitchboardJobConfig,
    SWITCHBOARD_CONFIG
};

// Run if called directly
if (require.main === module) {
    runProductionIntegration().catch(console.error);
}