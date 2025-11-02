const fs = require("fs");
const path = require("path");

function generateTypesFromIdl() {
  // Read the IDL
  const idl = JSON.parse(fs.readFileSync("target/idl/halo_protocol.json", "utf8"));
  
  // Generate TypeScript types
  let typesContent = `// Generated TypeScript types for Halo Protocol
// Program ID: ${idl.address}
import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

export type ProgramId = "${idl.address}";

// Account Types
`;

  // Generate account types
  if (idl.accounts) {
    idl.accounts.forEach(account => {
      // Skip if this is just a discriminator entry (no type definition)
      if (!account.type || !account.type.fields) {
        return;
      }
      typesContent += `export type ${account.name} = {\n`;
      account.type.fields.forEach(field => {
        typesContent += `  ${field.name}: ${getTypeScriptType(field.type)};\n`;
      });
      typesContent += `};\n\n`;
    });
  }

  // Add Anchor Program type
  typesContent += `// Anchor Program Type\n`;
  typesContent += `export interface HaloProtocolProgram {\n`;
  typesContent += `  address: "${idl.address}";\n`;
  typesContent += `  metadata: any;\n`;
  typesContent += `  instructions: any[];\n`;
  typesContent += `  accounts: any[];\n`;
  typesContent += `  types: any[];\n`;
  typesContent += `}\n\n`;

  // Generate instruction types
  typesContent += `// Instruction Types\n`;
  idl.instructions.forEach(instruction => {
    typesContent += `export type ${instruction.name}Instruction = {\n`;
    if (instruction.accounts) {
      typesContent += `  accounts: {\n`;
      instruction.accounts.forEach(account => {
        typesContent += `    ${account.name}: ${account.isSigner ? 'PublicKey' : 'PublicKey'};\n`;
      });
      typesContent += `  };\n`;
    }
    if (instruction.args) {
      typesContent += `  args: {\n`;
      instruction.args.forEach(arg => {
        typesContent += `    ${arg.name}: ${getTypeScriptType(arg.type)};\n`;
      });
      typesContent += `  };\n`;
    }
    typesContent += `};\n\n`;
  });

  // Generate error types
  if (idl.errors) {
    typesContent += `// Error Types\n`;
    idl.errors.forEach(error => {
      typesContent += `export type ${error.name} = {\n`;
      typesContent += `  code: ${error.code};\n`;
      typesContent += `  name: "${error.name}";\n`;
      typesContent += `  msg: "${error.msg}";\n`;
      typesContent += `};\n\n`;
    });
  }

  // Ensure the types directory exists
  const typesDir = path.join(process.cwd(), "target", "types");
  if (!fs.existsSync(typesDir)) {
    fs.mkdirSync(typesDir, { recursive: true });
  }

  // Write the types file
  const typesPath = path.join(typesDir, "halo_protocol.ts");
  fs.writeFileSync(typesPath, typesContent);
  console.log("TypeScript types generated successfully at:", typesPath);
}

function getTypeScriptType(anchorType) {
  if (typeof anchorType === 'string') {
    switch (anchorType) {
      case 'u8': return 'number';
      case 'u16': return 'number';
      case 'u32': return 'number';
      case 'u64': return 'BN';
      case 'i8': return 'number';
      case 'i16': return 'number';
      case 'i32': return 'number';
      case 'i64': return 'BN';
      case 'bool': return 'boolean';
      case 'string': return 'string';
      case 'publicKey': return 'PublicKey';
      default: return 'any';
    }
  }
  
  if (anchorType.vec) {
    return `${getTypeScriptType(anchorType.vec)}[]`;
  }
  
  if (anchorType.option) {
    return `${getTypeScriptType(anchorType.option)} | null`;
  }
  
  if (anchorType.defined) {
    return anchorType.defined;
  }
  
  return 'any';
}

generateTypesFromIdl();
