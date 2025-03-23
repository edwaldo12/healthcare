import { ethers } from 'hardhat';
import 'dotenv/config';

async function main() {
  const authorizedWalletAddress = process.env.WALLET_ADDRESS || '';
  const contractAddress = process.env.CONTRACT_ADDRESS || '';
  const patientId = 0;

  const HealthcareRecords = await ethers.getContractFactory(
    'HealthcareRecords'
  );
  const contract = HealthcareRecords.attach(contractAddress);

  const [signer] = await ethers.getSigners();
  const currentSignerAddress = await signer.getAddress();
  console.log('Current signer address:', currentSignerAddress);

  if (
    currentSignerAddress.toLowerCase() !== authorizedWalletAddress.toLowerCase()
  ) {
    throw new Error(`Not the authorized wallet!`);
  }

  const records = await contract.getPatientRecords(patientId);
  console.log(`Patient ${patientId} records:`, records);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
