/**
 * Reflect Yield Integration Example
 *
 * Demonstrates dual yield generation with Reflect:
 * - USDC+ staking with price appreciation
 * - USDJ delta-neutral strategy
 * - Combined Reflect + Solend yields
 * - Yield breakdown and analytics
 */

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { HaloProtocolClient } from "./halo-client";
import fs from "fs";

async function main() {
  console.log("================================================");
  console.log("💰 REFLECT YIELD INTEGRATION DEMO");
  console.log("================================================\n");

  // Setup connection and provider
  const connection = new anchor.web3.Connection(
    "http://localhost:8899",
    "confirmed"
  );

  const wallet = Keypair.generate();

  // Airdrop SOL for testing
  console.log("Requesting airdrop...");
  const airdropSig = await connection.requestAirdrop(
    wallet.publicKey,
    2 * LAMPORTS_PER_SOL
  );
  await connection.confirmTransaction(airdropSig);
  console.log("✅ Airdrop confirmed\n");

  // Load program
  const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(wallet), {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);

  const idl = JSON.parse(
    fs.readFileSync("./target/idl/halo_protocol.json", "utf8")
  );
  const programId = new anchor.web3.PublicKey(idl.metadata.address);
  const program = new Program(idl, programId, provider) as Program;

  // Initialize client
  const client = new HaloProtocolClient(program);

  // Initialize Reflect service
  console.log("================================================");
  console.log("1. Initializing Reflect Yield Service");
  console.log("================================================");
  await client.initializeReflect();
  const reflectService = client.getReflectService();
  console.log();

  // ============================================================================
  // DEMO 1: Reflect Token APY Comparison
  // ============================================================================
  console.log("================================================");
  console.log("2. Reflect Token APY Comparison");
  console.log("================================================\n");

  const usdcPlusAPY = await reflectService.getUSDCPlusAPY();
  const usdjAPY = await reflectService.getUSDJAPY();

  console.log("Current Reflect APYs:");
  console.log(`  USDC+ (Price Appreciation):  ${reflectService.formatAPY(usdcPlusAPY)}`);
  console.log(`  USDJ (Funding Rate Capture): ${reflectService.formatAPY(usdjAPY)}`);
  console.log();

  console.log("Token Characteristics:");
  console.log("\n  USDC+:");
  console.log("    • Yield-bearing stablecoin");
  console.log("    • Earns through price appreciation");
  console.log("    • Lower risk, stable returns");
  console.log("    • Best for: Conservative investors");
  console.log("\n  USDJ:");
  console.log("    • Delta-neutral strategy token");
  console.log("    • Captures funding rates from perps");
  console.log("    • Higher returns, moderate risk");
  console.log("    • Best for: Growth-focused investors");
  console.log();

  // ============================================================================
  // DEMO 2: Dual Yield Breakdown
  // ============================================================================
  console.log("================================================");
  console.log("3. Dual Yield Breakdown (Reflect + Solend)");
  console.log("================================================\n");

  const depositAmount = 10000; // $10,000

  console.log(`Analyzing yields for $${depositAmount.toLocaleString()} deposit\n`);

  // USDC+ dual yield
  console.log("--- USDC+ Strategy ---");
  const usdcPlusBreakdown = await client.getDualYieldBreakdown(depositAmount, 'USDC+');

  console.log("\nYield Sources:");
  console.log(`  ${usdcPlusBreakdown.reflectYield.name}:`);
  console.log(`    APY: ${reflectService.formatAPY(usdcPlusBreakdown.reflectYield.apy)}`);
  console.log(`    Annual: ${reflectService.formatCurrency(usdcPlusBreakdown.reflectYield.amountEarned)}`);

  console.log(`\n  ${usdcPlusBreakdown.solendYield.name}:`);
  console.log(`    APY: ${reflectService.formatAPY(usdcPlusBreakdown.solendYield.apy)}`);
  console.log(`    Annual: ${reflectService.formatCurrency(usdcPlusBreakdown.solendYield.amountEarned)}`);

  console.log(`\n  Combined Total:`);
  console.log(`    APY: ${reflectService.formatAPY(usdcPlusBreakdown.totalAPY)}`);
  console.log(`    Annual: ${reflectService.formatCurrency(usdcPlusBreakdown.totalEarned)}`);

  console.log("\n");

  // USDJ dual yield
  console.log("--- USDJ Strategy ---");
  const usdjBreakdown = await client.getDualYieldBreakdown(depositAmount, 'USDJ');

  console.log("\nYield Sources:");
  console.log(`  ${usdjBreakdown.reflectYield.name}:`);
  console.log(`    APY: ${reflectService.formatAPY(usdjBreakdown.reflectYield.apy)}`);
  console.log(`    Annual: ${reflectService.formatCurrency(usdjBreakdown.reflectYield.amountEarned)}`);

  console.log(`\n  ${usdjBreakdown.solendYield.name}:`);
  console.log(`    APY: ${reflectService.formatAPY(usdjBreakdown.solendYield.apy)}`);
  console.log(`    Annual: ${reflectService.formatCurrency(usdjBreakdown.solendYield.amountEarned)}`);

  console.log(`\n  Combined Total:`);
  console.log(`    APY: ${reflectService.formatAPY(usdjBreakdown.totalAPY)}`);
  console.log(`    Annual: ${reflectService.formatCurrency(usdjBreakdown.totalEarned)}`);

  console.log("\n");

  // Comparison
  const additionalEarnings = usdjBreakdown.totalEarned - usdcPlusBreakdown.totalEarned;
  console.log("📊 Strategy Comparison:");
  console.log(`  USDJ earns ${reflectService.formatCurrency(additionalEarnings)} more per year`);
  console.log(`  That's ${((additionalEarnings / usdcPlusBreakdown.totalEarned) * 100).toFixed(1)}% higher returns`);
  console.log();

  // ============================================================================
  // DEMO 3: Price Appreciation Tracking
  // ============================================================================
  console.log("================================================");
  console.log("4. Price Appreciation Tracking");
  console.log("================================================\n");

  const periods: Array<'24h' | '7d' | '30d' | '1y'> = ['24h', '7d', '30d', '1y'];

  console.log("USDC+ Price Appreciation:");
  for (const period of periods) {
    const appreciation = await client.getReflectPriceAppreciation('USDC+', period);
    console.log(`  ${period.padEnd(4)}: ${appreciation.percentageChange.toFixed(2)}% ` +
                `(${appreciation.startPrice.toFixed(4)} → ${appreciation.currentPrice.toFixed(4)})`);
  }

  console.log("\nUSDJ Price Appreciation:");
  for (const period of periods) {
    const appreciation = await client.getReflectPriceAppreciation('USDJ', period);
    console.log(`  ${period.padEnd(4)}: ${appreciation.percentageChange.toFixed(2)}% ` +
                `(${appreciation.startPrice.toFixed(4)} → ${appreciation.currentPrice.toFixed(4)})`);
  }
  console.log();

  // ============================================================================
  // DEMO 4: Strategy Recommendations
  // ============================================================================
  console.log("================================================");
  console.log("5. Personalized Strategy Recommendations");
  console.log("================================================\n");

  const userProfiles = [
    {
      name: "Conservative Investor",
      riskTolerance: 'low' as const,
      investmentPeriod: 'long' as const,
      amount: 50000
    },
    {
      name: "Moderate Investor",
      riskTolerance: 'medium' as const,
      investmentPeriod: 'medium' as const,
      amount: 25000
    },
    {
      name: "Aggressive Investor",
      riskTolerance: 'high' as const,
      investmentPeriod: 'short' as const,
      amount: 100000
    }
  ];

  for (const profile of userProfiles) {
    console.log(`--- ${profile.name} ---`);
    console.log(`  Amount: ${reflectService.formatCurrency(profile.amount)}`);
    console.log(`  Risk Tolerance: ${profile.riskTolerance}`);
    console.log(`  Investment Period: ${profile.investmentPeriod}`);

    const recommendation = await client.getRecommendedReflectStrategy(profile);

    console.log(`\n  Recommended: ${recommendation.name}`);
    console.log(`  Description: ${recommendation.description}`);
    console.log(`  Token: ${recommendation.reflectToken}`);
    console.log(`  Expected APY: ${reflectService.formatAPY(recommendation.expectedTotalAPY)}`);
    console.log(`  Projected Annual Return: ${reflectService.formatCurrency(
      profile.amount * (recommendation.expectedTotalAPY / 100)
    )}`);
    console.log(`  Risk Level: ${recommendation.riskLevel}`);
    console.log();
  }

  // ============================================================================
  // DEMO 5: All Available Strategies
  // ============================================================================
  console.log("================================================");
  console.log("6. All Available Dual Yield Strategies");
  console.log("================================================\n");

  const strategies = await client.getReflectStrategies();

  strategies.forEach((strategy, i) => {
    console.log(`${i + 1}. ${strategy.name}`);
    console.log(`   ${strategy.description}`);
    console.log(`   Token: ${strategy.reflectToken}`);
    console.log(`   Reflect APY: ${reflectService.formatAPY(strategy.expectedReflectAPY)}`);
    console.log(`   Solend APY: ${reflectService.formatAPY(strategy.expectedSolendAPY)}`);
    console.log(`   Total APY: ${reflectService.formatAPY(strategy.expectedTotalAPY)}`);
    console.log(`   Risk: ${strategy.riskLevel.toUpperCase()}`);
    console.log();
  });

  // ============================================================================
  // DEMO 6: Time-Based Yield Projections
  // ============================================================================
  console.log("================================================");
  console.log("7. Time-Based Yield Projections");
  console.log("================================================\n");

  const principal = 20000; // $20,000
  const timeframes = [30, 90, 180, 365]; // days

  console.log(`Principal: ${reflectService.formatCurrency(principal)}\n`);

  console.log("USDC+ Projections:");
  for (const days of timeframes) {
    const projected = reflectService.projectYield(principal, usdcPlusAPY, days);
    console.log(`  ${days} days: ${reflectService.formatCurrency(projected)} earned`);
  }

  console.log("\nUSDJ Projections:");
  for (const days of timeframes) {
    const projected = reflectService.projectYield(principal, usdjAPY, days);
    console.log(`  ${days} days: ${reflectService.formatCurrency(projected)} earned`);
  }
  console.log();

  // ============================================================================
  // DEMO 7: Simulated Position Tracking
  // ============================================================================
  console.log("================================================");
  console.log("8. Simulated Position Value Tracking");
  console.log("================================================\n");

  const depositedAmount = 15000;
  const depositTimestamp = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 days ago

  console.log(`Initial Deposit: ${reflectService.formatCurrency(depositedAmount)}`);
  console.log(`Deposit Date: ${new Date(depositTimestamp).toLocaleDateString()}\n`);

  // Simulate USDC+ position
  console.log("USDC+ Position:");
  const usdcPlusPosition = await reflectService.calculatePositionValue(
    depositedAmount,
    'USDC+' as any,
    depositTimestamp,
    depositedAmount * 0.03 * (30 / 365) // Simulated Solend yield for 30 days
  );

  console.log(`  Current Value: ${reflectService.formatCurrency(usdcPlusPosition.currentValue)}`);
  console.log(`  Reflect Yield: ${reflectService.formatCurrency(usdcPlusPosition.reflectYieldEarned)}`);
  console.log(`  Solend Yield: ${reflectService.formatCurrency(usdcPlusPosition.solendYieldEarned)}`);
  console.log(`  Total Yield: ${reflectService.formatCurrency(usdcPlusPosition.totalYieldEarned)}`);
  console.log(`  Gain: ${((usdcPlusPosition.totalYieldEarned / depositedAmount) * 100).toFixed(2)}%`);

  console.log("\nUSDJ Position:");
  const usdjPosition = await reflectService.calculatePositionValue(
    depositedAmount,
    'USDJ' as any,
    depositTimestamp,
    depositedAmount * 0.03 * (30 / 365)
  );

  console.log(`  Current Value: ${reflectService.formatCurrency(usdjPosition.currentValue)}`);
  console.log(`  Reflect Yield: ${reflectService.formatCurrency(usdjPosition.reflectYieldEarned)}`);
  console.log(`  Solend Yield: ${reflectService.formatCurrency(usdjPosition.solendYieldEarned)}`);
  console.log(`  Total Yield: ${reflectService.formatCurrency(usdjPosition.totalYieldEarned)}`);
  console.log(`  Gain: ${((usdjPosition.totalYieldEarned / depositedAmount) * 100).toFixed(2)}%`);
  console.log();

  // ============================================================================
  // DEMO 8: Yield Comparison Table
  // ============================================================================
  console.log("================================================");
  console.log("9. Yield Comparison Table");
  console.log("================================================\n");

  const amounts = [1000, 5000, 10000, 50000, 100000];

  console.log("Annual Earnings Comparison:\n");
  console.log("Amount     | USDC+ Only | Solend Only | USDC++Solend | USDJ+Solend | Advantage");
  console.log("-----------|------------|-------------|--------------|-------------|----------");

  for (const amount of amounts) {
    const usdcPlusOnly = amount * (usdcPlusAPY / 100);
    const solendOnly = amount * 0.032; // 3.2%
    const usdcPlusDual = amount * (usdcPlusBreakdown.totalAPY / 100);
    const usdjDual = amount * (usdjBreakdown.totalAPY / 100);
    const advantage = usdjDual - solendOnly;

    console.log(
      `$${amount.toLocaleString().padEnd(8)} | ` +
      `$${usdcPlusOnly.toFixed(0).padEnd(10)} | ` +
      `$${solendOnly.toFixed(0).padEnd(11)} | ` +
      `$${usdcPlusDual.toFixed(0).padEnd(12)} | ` +
      `$${usdjDual.toFixed(0).padEnd(11)} | ` +
      `+$${advantage.toFixed(0)}`
    );
  }
  console.log();

  // ============================================================================
  // DEMO 9: Token Mint Addresses
  // ============================================================================
  console.log("================================================");
  console.log("10. Reflect Token Information");
  console.log("================================================\n");

  const mints = reflectService.getTokenMints();

  console.log("Reflect Token Mints:");
  console.log(`  USDC+: ${mints.usdcPlus.toBase58()}`);
  console.log(`  USDJ:  ${mints.usdj.toBase58()}`);
  console.log();

  console.log("Integration Status:");
  console.log(`  ✅ Reflect Service: ${reflectService.isInitialized() ? 'Ready' : 'Not Ready'}`);
  console.log(`  ✅ Dual Yield Tracking: Enabled`);
  console.log(`  ✅ APY Calculations: Active`);
  console.log(`  ✅ Position Tracking: Active`);
  console.log();

  // ============================================================================
  // Summary
  // ============================================================================
  console.log("================================================");
  console.log("✅ REFLECT YIELD DEMO COMPLETE");
  console.log("================================================\n");

  console.log("Key Yield Features Demonstrated:");
  console.log("  ✅ USDC+ yield-bearing stablecoin");
  console.log("  ✅ USDJ delta-neutral strategy");
  console.log("  ✅ Dual yield tracking (Reflect + Solend)");
  console.log("  ✅ Price appreciation monitoring");
  console.log("  ✅ Personalized strategy recommendations");
  console.log("  ✅ Time-based yield projections");
  console.log("  ✅ Position value tracking");
  console.log();

  console.log("Yield Benefits:");
  console.log(`  💰 USDC+ APY: ${reflectService.formatAPY(usdcPlusAPY)}`);
  console.log(`  💰 USDJ APY: ${reflectService.formatAPY(usdjAPY)}`);
  console.log(`  💰 Combined with Solend for dual yields`);
  console.log(`  💰 Up to ${reflectService.formatAPY(usdjBreakdown.totalAPY)} total APY`);
  console.log();

  console.log("⚠️  Note: Currently using mock implementation.");
  console.log("   Replace with actual Reflect SDK when available.");
  console.log();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
