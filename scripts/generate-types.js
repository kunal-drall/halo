const fs = require("fs");
const path = require("path");

function generateTypesFromIdl() {
  // Read the IDL
  const idl = JSON.parse(fs.readFileSync("target/idl/halo_protocol.json", "utf8"));
  
  // Generate TypeScript types
  let typesContent = `// Generated TypeScript types for Halo Protocol
// Program ID: ${idl.address}

export type ProgramId = "${idl.address}";

// Account Types
`;

  // Generate account types
  if (idl.accounts) {
    idl.accounts.forEach(account => {
      typesContent += `export type ${account.name} = {\n`;
      account.type.fields.forEach(field => {
        typesContent += `  ${field.name}: ${getTypeScriptType(field.type)};\n`;
      });
      typesContent += `};\n\n`;
    });
  }

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

  // Write the types file
  fs.writeFileSync("target/types/halo_protocol.ts", typesContent);
  console.log("TypeScript types generated successfully!");
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
