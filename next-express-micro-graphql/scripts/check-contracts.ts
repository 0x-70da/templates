import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const clientContracts = path.resolve("client/contracts");
const serverContracts = path.resolve("server/src/contracts");

if (!fs.existsSync(clientContracts) || !fs.existsSync(serverContracts)) {
  console.error("Contract directories missing!");
  process.exit(1);
}

const clientFiles = fs.readdirSync(clientContracts);
const serverFiles = fs.readdirSync(serverContracts);

let hasDrift = false;

for (const file of clientFiles) {
  if (!serverFiles.includes(file)) {
    console.error(`Missing contract file in server: ${file}`);
    hasDrift = true;
    continue;
  }
  const clientContent = fs.readFileSync(path.join(clientContracts, file), "utf-8").trim();
  const serverContent = fs.readFileSync(path.join(serverContracts, file), "utf-8").trim();
  if (clientContent !== serverContent) {
    console.error(`Contract mismatch between client and server for: ${file}`);
    hasDrift = true;
  }
}

for (const file of serverFiles) {
  if (!clientFiles.includes(file)) {
    console.error(`Missing contract file in client: ${file}`);
    hasDrift = true;
  }
}

if (hasDrift) {
  console.error(
    "Contract drift check FAILED! Please synchronize client and server contract files.",
  );
  process.exit(1);
} else {
  console.log("Contract drift check PASSED! Client and server contracts are in sync.");
}
