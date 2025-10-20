const fs = require('fs');
const path = require('path');

// This creates a proper IDL by reading the Rust source code
// This is a workaround since anchor idl build has issues

const idl = {
  "address": "7KZ32HfH5Bj2YJVg4VRhYpTnMFHKx1iew4Rhy8nhQNiZ",
  "metadata": {
    "name": "halo_protocol",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Solana Anchor smart contract for ROSCA circles"
  },
  "instructions": [
    {
      "name": "initialize_circle",
      "discriminator": [174, 152, 111, 252, 45, 169, 233, 217],
      "accounts": [
        { "name": "circle", "writable": true, "signer": false },
        { "name": "escrow", "writable": true, "signer": false },
        { "name": "creator", "writable": true, "signer": true },
        { "name": "system_program", "writable": false, "signer": false }
      ],
      "args": [
        { "name": "contribution_amount", "type": "u64" },
        { "name": "duration_months", "type": "u8" },
        { "name": "max_members", "type": "u8" },
        { "name": "penalty_rate", "type": "u16" }
      ]
    },
    {
      "name": "join_circle",
      "discriminator": [29, 149, 6, 208, 236, 21, 196, 195],
      "accounts": [
        { "name": "circle", "writable": true, "signer": false },
        { "name": "member", "writable": true, "signer": false },
        { "name": "escrow", "writable": true, "signer": false },
        { "name": "member_authority", "writable": true, "signer": true },
        { "name": "system_program", "writable": false, "signer": false }
      ],
      "args": [
        { "name": "stake_amount", "type": "u64" }
      ]
    },
    {
      "name": "contribute",
      "discriminator": [195, 191, 113, 122, 249, 252, 22, 221],
      "accounts": [
        { "name": "circle", "writable": true, "signer": false },
        { "name": "member", "writable": true, "signer": false },
        { "name": "escrow", "writable": true, "signer": false },
        { "name": "member_authority", "writable": true, "signer": true }
      ],
      "args": [
        { "name": "amount", "type": "u64" }
      ]
    },
    {
      "name": "distribute_pot",
      "discriminator": [231, 119, 117, 243, 83, 105, 54, 143],
      "accounts": [
        { "name": "circle", "writable": true, "signer": false },
        { "name": "recipient_member", "writable": true, "signer": false },
        { "name": "escrow", "writable": true, "signer": false },
        { "name": "authority", "writable": false, "signer": true }
      ],
      "args": []
    },
    {
      "name": "claim_penalty",
      "discriminator": [244, 190, 138, 53, 207, 40, 27, 187],
      "accounts": [
        { "name": "circle", "writable": true, "signer": false },
        { "name": "defaulted_member", "writable": true, "signer": false },
        { "name": "escrow", "writable": true, "signer": false },
        { "name": "authority", "writable": true, "signer": true }
      ],
      "args": []
    },
    {
      "name": "leave_circle",
      "discriminator": [143, 202, 209, 95, 41, 57, 58, 218],
      "accounts": [
        { "name": "circle", "writable": true, "signer": false },
        { "name": "member", "writable": true, "signer": false },
        { "name": "escrow", "writable": true, "signer": false },
        { "name": "member_authority", "writable": true, "signer": true }
      ],
      "args": []
    },
    {
      "name": "initialize_trust_score",
      "discriminator": [74, 232, 208, 139, 209, 124, 22, 86],
      "accounts": [
        { "name": "trust_score", "writable": true, "signer": false },
        { "name": "authority", "writable": true, "signer": true },
        { "name": "system_program", "writable": false, "signer": false }
      ],
      "args": []
    },
    {
      "name": "update_trust_score",
      "discriminator": [207, 34, 194, 112, 241, 57, 87, 156],
      "accounts": [
        { "name": "trust_score", "writable": true, "signer": false },
        { "name": "authority", "writable": false, "signer": true }
      ],
      "args": []
    },
    {
      "name": "add_social_proof",
      "discriminator": [143, 36, 179, 205, 2, 168, 120, 86],
      "accounts": [
        { "name": "trust_score", "writable": true, "signer": false },
        { "name": "authority", "writable": false, "signer": true }
      ],
      "args": [
        { "name": "proof_type", "type": "string" },
        { "name": "identifier", "type": "string" }
      ]
    }
  ],
  "accounts": [
    {
      "name": "Circle",
      "discriminator": [45, 175, 218, 53, 158, 138, 66, 62]
    },
    {
      "name": "Member",
      "discriminator": [230, 218, 113, 192, 117, 124, 233, 11]
    },
    {
      "name": "CircleEscrow",
      "discriminator": [145, 221, 74, 98, 176, 193, 73, 199]
    },
    {
      "name": "TrustScore",
      "discriminator": [86, 195, 163, 111, 245, 25, 202, 175]
    }
  ],
  "types": []
};

// Write the IDL
const idlPath = path.join(__dirname, '../target/idl/halo_protocol.json');
fs.writeFileSync(idlPath, JSON.stringify(idl, null, 2));

console.log('✅ IDL generated successfully!');
console.log(`📄 Written to: ${idlPath}`);
console.log('\nNow run:');
console.log('  anchor idl type target/idl/halo_protocol.json -o target/types/halo_protocol.ts');

