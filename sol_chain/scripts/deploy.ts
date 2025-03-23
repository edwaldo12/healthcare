// deploy.ts
import { ethers } from 'hardhat';
import 'dotenv/config';

async function main() {
  const HealthcareRecords = await ethers.getContractFactory(
    'HealthcareRecords'
  );
  const healthcareRecords = await HealthcareRecords.deploy();
  await healthcareRecords.waitForDeployment();

  const deployedAddress = await healthcareRecords.getAddress();
  console.log('HealthcareRecords deployed to:', deployedAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
