# Switchboard Oracle Automation - Halo Protocol

This document describes the Switchboard Oracle integration for automating recurring circle events in the Halo Protocol. The automation system provides cron-like scheduling capabilities for contribution collection, payout disbursements, and penalty enforcement.

## Overview

The Halo Protocol automation system leverages Switchboard oracles to create time-based triggers that execute circle operations automatically without manual intervention. This ensures consistent, predictable execution of recurring circle events while maintaining deterministic outcomes across multiple circles running in parallel.

## Key Features

### ⏰ Automated Event Types
- **Monthly Contribution Collection**: Automatically triggers contribution collection from members
- **Payout Distribution**: Automatically distributes monthly payouts to designated recipients  
- **Penalty Enforcement**: Automatically applies penalties for missed contributions

### 📅 Cron-like Scheduling
- Deterministic schedule generation based on circle creation time
- Configurable intervals and timing offsets
- Parallel execution support for multiple circles

### 🔄 Deterministic Outcomes
- Consistent execution timing across all circles
- Predictable scheduling based on circle parameters
- Reliable automation state management

## Architecture

### Core Components

#### 1. AutomationState (Global)
Global configuration and state management for the automation system.

```rust
pub struct AutomationState {
    pub authority: Pubkey,           // Automation admin
    pub switchboard_queue: Pubkey,   // Switchboard queue for jobs
    pub enabled: bool,               // Global automation toggle
    pub active_jobs: u32,            // Number of active automation jobs
    pub min_interval: i64,           // Minimum time between checks
    pub last_check: i64,            // Last automation check timestamp
    pub bump: u8,                   // PDA bump seed
}
```

#### 2. CircleAutomation (Per-Circle)
Circle-specific automation configuration and schedules.

```rust
pub struct CircleAutomation {
    pub circle: Pubkey,                     // Associated circle
    pub job_account: Pubkey,                // Switchboard job account
    pub auto_collect_enabled: bool,         // Enable contribution collection
    pub auto_distribute_enabled: bool,      // Enable payout distribution
    pub auto_penalty_enabled: bool,         // Enable penalty enforcement
    pub contribution_schedule: Vec<i64>,    // Contribution timestamps
    pub distribution_schedule: Vec<i64>,    // Distribution timestamps
    pub penalty_schedule: Vec<i64>,         // Penalty check timestamps
    pub last_contribution_check: i64,       // Last contribution check
    pub last_distribution_check: i64,       // Last distribution check
    pub last_penalty_check: i64,           // Last penalty check
    pub circle_created_at: i64,            // Circle creation time
    pub bump: u8,                          // PDA bump seed
}
```

#### 3. AutomationEvent (Event Log)
Event logging for automation actions and debugging.

```rust
pub struct AutomationEvent {
    pub circle: Pubkey,                     // Associated circle
    pub event_type: AutomationEventType,   // Type of automation event
    pub timestamp: i64,                     // Event timestamp
    pub data: Vec<u8>,                     // Event-specific data
    pub success: bool,                     // Execution success flag
    pub error_message: Option<String>,     // Error details if failed
    pub bump: u8,                          // PDA bump seed
}
```

## Schedule Generation

### Contribution Schedule
Monthly contribution collection timing:
- **Offset**: 0 days from start of each month
- **Frequency**: Once per month for circle duration
- **Formula**: `circle_created_at + (month * 30 * 24 * 60 * 60)`

### Distribution Schedule  
Monthly payout distribution timing:
- **Offset**: 25 days from start of each month
- **Purpose**: Allow time for contribution collection
- **Formula**: `circle_created_at + (month * 30 * 24 * 60 * 60) + (25 * 24 * 60 * 60)`

### Penalty Schedule
Penalty enforcement timing:
- **Offset**: 27 days from start of each month  
- **Purpose**: Grace period after distribution
- **Formula**: `circle_created_at + (month * 30 * 24 * 60 * 60) + (27 * 24 * 60 * 60)`

## Smart Contract Instructions

### Setup Instructions

#### Initialize Automation State
```rust
pub fn initialize_automation_state(
    ctx: Context<InitializeAutomationState>,
    min_interval: i64,
) -> Result<()>
```
Sets up global automation configuration with minimum check intervals.

#### Setup Circle Automation
```rust
pub fn setup_circle_automation(
    ctx: Context<SetupCircleAutomation>,
    auto_collect: bool,
    auto_distribute: bool,
    auto_penalty: bool,
) -> Result<()>
```
Configures automation for a specific circle with feature toggles.

### Automation Triggers

#### Automated Contribution Collection
```rust
pub fn automated_contribution_collection(
    ctx: Context<AutomatedContributionCollection>,
) -> Result<()>
```
Triggers contribution collection when scheduled time is reached.

#### Automated Payout Distribution
```rust
pub fn automated_payout_distribution(
    ctx: Context<AutomatedPayoutDistribution>,
    recipient: Pubkey,
) -> Result<()>
```
Triggers payout distribution to specified recipient when due.

#### Automated Penalty Enforcement
```rust
pub fn automated_penalty_enforcement(
    ctx: Context<AutomatedPenaltyEnforcement>,
) -> Result<()>
```
Triggers penalty application for missed contributions.

### Management Instructions

#### Update Automation Settings
```rust
pub fn update_automation_settings(
    ctx: Context<UpdateAutomationSettings>,
    enabled: bool,
    min_interval: Option<i64>,
) -> Result<()>
```
Updates global automation configuration.

#### Switchboard Callback
```rust
pub fn switchboard_automation_callback(
    ctx: Context<SwitchboardAutomationCallback>,
) -> Result<()>
```
Handles callbacks from Switchboard oracles for time-based triggers.

## TypeScript Client Usage

### Basic Setup

```typescript
import { HaloProtocolClient } from './halo-client';

const client = new HaloProtocolClient(program);

// Initialize global automation state
const { automationStateAccount } = await client.initializeAutomationState(
    authority,
    switchboardQueue,
    3600 // 1 hour minimum interval
);

// Setup circle automation
const { circleAutomationAccount } = await client.setupCircleAutomation(
    circleAccount,
    authority,
    switchboardJob,
    true, // auto collect contributions
    true, // auto distribute payouts
    true  // auto enforce penalties
);
```

### Monitoring Automation

```typescript
// Check automation state
const automationState = await client.getAutomationState();
console.log('Automation enabled:', automationState.enabled);
console.log('Active jobs:', automationState.activeJobs);

// Check circle automation
const circleAutomation = await client.getCircleAutomation(circleAccount);
console.log('Next contribution:', circleAutomation.contributionSchedule[0]);

// Get next scheduled events
const nextEvents = await client.getNextAutomationEvents(circleAccount);
console.log('Next contribution:', new Date(nextEvents.nextContribution * 1000));
console.log('Next distribution:', new Date(nextEvents.nextDistribution * 1000));
```

### Triggering Automation

```typescript
// Check if automation should execute
const timeForContribution = await client.isTimeForContributionCollection(circleAccount);
if (timeForContribution) {
    // Trigger contribution collection
    const { tx } = await client.triggerAutomatedContributionCollection(
        circleAccount,
        payer
    );
    console.log('Contribution collection triggered:', tx);
}

// Check for payout distribution
const timeForDistribution = await client.isTimeForPayoutDistribution(circleAccount);
if (timeForDistribution) {
    // Trigger payout distribution
    const { tx } = await client.triggerAutomatedPayoutDistribution(
        circleAccount,
        recipient,
        distributePotAccounts,
        payer
    );
    console.log('Payout distribution triggered:', tx);
}
```

## Switchboard Integration

### Oracle Configuration

The automation system integrates with Switchboard oracles for time-based triggers:

1. **Switchboard Queue**: Manages automation job scheduling
2. **Switchboard Job**: Individual job configuration per circle
3. **Aggregator Feed**: Provides timestamp data for triggers

### Production Setup

For production deployment with real Switchboard oracles:

```typescript
// Initialize with real Switchboard queue
const switchboardQueue = new PublicKey('SWITCHBOARD_QUEUE_ADDRESS');
await client.initializeAutomationState(authority, switchboardQueue, 3600);

// Create Switchboard job for circle
const switchboardJob = await createSwitchboardJob({
    queue: switchboardQueue,
    name: `halo-circle-${circleAccount.toString().slice(0, 8)}`,
    metadata: `Automation for Halo Circle ${circleAccount.toString()}`,
    authority: authority.publicKey,
    jobDefinition: {
        tasks: [
            {
                httpTask: {
                    url: `https://api.your-service.com/automation/check/${circleAccount.toString()}`,
                    method: "GET"
                }
            },
            {
                conditionalTask: {
                    attempt: [
                        {
                            valueTask: {
                                big: "${http_response.should_execute}"
                            }
                        }
                    ],
                    onSuccess: [
                        {
                            anchorFetchTask: {
                                programId: program.programId.toString(),
                                accountAddress: circleAccount.toString()
                            }
                        }
                    ]
                }
            }
        ]
    }
});

await client.setupCircleAutomation(
    circleAccount,
    authority,
    switchboardJob.publicKey,
    true, true, true
);
```

## Testing

### Running Automation Tests

```bash
# Run automation-specific tests
npm run test:automation

# Run example automation script
npm run example:automation
```

### Test Structure

The test suite covers:

- **Automation State Initialization**: Global configuration setup
- **Circle Automation Setup**: Per-circle automation configuration
- **Schedule Generation**: Deterministic timing validation
- **Trigger Logic**: Time-based execution validation
- **Parallel Processing**: Multiple circles running simultaneously
- **Event Logging**: Automation event tracking

### Example Test Scenarios

```typescript
describe("Automation Deterministic Outcomes", () => {
    it("ensures consistent schedules for multiple circles", async () => {
        // Create two circles at different times
        const circle1 = await createCircle(creator1, timestamp1);
        const circle2 = await createCircle(creator2, timestamp2);
        
        // Setup automation for both
        await setupAutomation(circle1);
        await setupAutomation(circle2);
        
        // Verify schedules are deterministic
        const automation1 = await getCircleAutomation(circle1);
        const automation2 = await getCircleAutomation(circle2);
        
        // Time differences should be consistent
        const schedule1Diff = automation1.contributionSchedule[1] - automation1.contributionSchedule[0];
        const schedule2Diff = automation2.contributionSchedule[1] - automation2.contributionSchedule[0];
        
        expect(schedule1Diff).to.equal(schedule2Diff); // 30 days
    });
});
```

## Error Handling

### Automation Errors

The system includes specific error types for automation failures:

```rust
#[error_code]
pub enum HaloError {
    #[msg("Automation is disabled")]
    AutomationDisabled,
    #[msg("Automation not scheduled at this time")]
    AutomationNotScheduled,
    #[msg("Automation check too frequent")]
    AutomationTooFrequent,
    #[msg("Automation job not found")]
    AutomationJobNotFound,
    #[msg("Invalid automation configuration")]
    InvalidAutomationConfig,
}
```

### Error Recovery

```typescript
try {
    await client.triggerAutomatedContributionCollection(circleAccount, payer);
} catch (error) {
    if (error.message.includes("AutomationNotScheduled")) {
        console.log("Automation not due yet - this is expected");
    } else if (error.message.includes("AutomationDisabled")) {
        console.log("Automation is disabled globally");
        // Enable automation if needed
        await client.updateAutomationSettings(authority, true);
    } else {
        console.error("Unexpected automation error:", error);
        // Log for debugging and retry later
    }
}
```

## Security Considerations

### Access Control
- Only designated authorities can modify automation settings
- Circle creators control automation for their circles
- Switchboard oracles provide secure time-based triggers

### Timing Security
- Minimum intervals prevent spam and abuse
- Deterministic scheduling prevents manipulation
- Event logging provides audit trail

### Economic Security
- Automation fees are predictable and minimal
- Failed automation doesn't affect circle integrity
- Manual override capabilities for emergency situations

## Performance Considerations

### Gas Optimization
- Batch processing where possible
- Efficient account storage layout
- Minimal on-chain computation

### Scalability
- Parallel processing support
- Independent circle automation
- Configurable check intervals

### Monitoring
- Comprehensive event logging
- Health check capabilities
- Performance metrics tracking

## Future Enhancements

### Advanced Scheduling
- Custom time zones support
- Holiday/weekend handling
- Dynamic scheduling based on participation

### Integration Improvements
- Multiple oracle provider support
- Backup trigger mechanisms
- Enhanced error recovery

### User Experience
- Dashboard for automation monitoring
- Notification system for events
- Mobile app integration

## Troubleshooting

### Common Issues

1. **Automation Not Triggering**
   - Check if global automation is enabled
   - Verify circle automation configuration
   - Confirm Switchboard oracle connectivity

2. **Schedule Timing Issues**
   - Validate circle creation timestamp
   - Check schedule generation logic
   - Verify timezone considerations

3. **Permission Errors**
   - Ensure proper authority setup
   - Check PDA derivations
   - Validate signer permissions

### Debug Commands

```typescript
// Check automation state
const state = await client.getAutomationState();
console.log('Debug:', JSON.stringify(state, null, 2));

// Check specific circle automation
const automation = await client.getCircleAutomation(circleAccount);
console.log('Circle automation:', JSON.stringify(automation, null, 2));

// Check recent events
const events = await program.account.automationEvent.all([
    {
        memcmp: {
            offset: 8, // Skip discriminator
            bytes: circleAccount.toBase58()
        }
    }
]);
console.log('Recent events:', events);
```

This automation system provides a robust, scalable foundation for time-based operations in the Halo Protocol, ensuring reliable execution of recurring circle events while maintaining security and determinism.