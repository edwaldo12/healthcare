/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { ethers, Eip1193Provider } from 'ethers';
import { useEffect, useState } from 'react';
import HealthCare from '../ABI/HealthcareRecords.json';
import { Contract } from 'ethers';
import { BrowserProvider } from 'ethers';
import { JsonRpcSigner } from 'ethers';
import { PatientRecord } from './type';

declare global {
  interface Window {
    ethereum: Eip1193Provider;
  }
}

const Home = () => {
  const [provider, setProvider] = useState<BrowserProvider>();
  const [signer, setSigner] = useState<JsonRpcSigner>();
  const [contract, setContract] = useState<Contract>();
  const [account, setAccount] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [providerAddress, setProviderAddress] = useState('');
  const [patientID, setPatientID] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [patientRecords, setPatientRecords] = useState<PatientRecord[]>([]);
  const [patientName, setPatientName] = useState('');
  const contractAddress = '0x2a9bBE8894BF072ad29F91072cC1A455D8D2E250';

  useEffect(() => {
    const connectWallet = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send('eth_requestAccounts', []);
        const signer = await provider.getSigner();
        setProvider(provider);
        setSigner(signer);

        const accountAddress = await signer.getAddress();
        setAccount(accountAddress);

        const healthcareContract = new ethers.Contract(
          contractAddress,
          HealthCare.abi,
          signer
        );
        setContract(healthcareContract);

        const ownerAddress = await healthcareContract.getOwner();
        setIsOwner(accountAddress.toLowerCase() === ownerAddress.toLowerCase());
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    };
    connectWallet();
  }, []);

  const authorizeProvider = async () => {
    if (isOwner) {
      setIsLoading(true);
      try {
        const tx = await contract?.authorizedProvider(providerAddress);
        await tx?.wait();
        alert('Provider authorized successfully');
      } catch (error) {
        console.error('Error authorizing provider:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      alert('You are not authorized to authorize a provider');
    }
  };

  const handleFetchRecords = async () => {
    try {
      const records = await contract?.getPatientRecords(patientID);
      setPatientRecords(records);
      console.log(`Patient ${patientID} records:`, records);
    } catch (error) {
      console.error('Error fetching patient records:', error);
    }
  };

  const addRecord = async () => {
    try {
      const tx = await contract?.addRecord(
        Number(patientID),
        patientName,
        diagnosis,
        treatment
      );
      await tx?.wait();
      handleFetchRecords();
      console.log('Record added successfully');
      alert('Record added successfully');
    } catch (error) {
      console.error('Error adding record:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12">
      <div className="max-w-lg w-full space-y-8 p-4 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-extrabold text-center text-blue-600">
          Healthcare Application
        </h1>
        <div className="space-y-4">
          {account && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-lg font-medium text-gray-800">
                Connected Account: {account.slice(0, 8)}...{account.slice(-4)}
              </p>
            </div>
          )}
          {isOwner && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-100 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p className="text-green-600 font-medium">
                You are the contract owner
              </p>
            </div>
          )}
          {!account && (
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 text-center">
              <p className="text-yellow-600 font-medium">
                Connect your MetaMask wallet to proceed
              </p>
            </div>
          )}
        </div>
        <div className="form-section bg-gray-50 border border-gray-300 rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-lg font-medium mb-4 text-blue-600">
            Fetch Patient Record
          </h2>
          <div className="space-y-4">
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-200 focus:outline-none"
              type="text"
              placeholder="Enter Patient ID"
              value={patientID}
              onChange={(e) => setPatientID(e.target.value)}
            />
            <button
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-500 transition duration-200"
              onClick={handleFetchRecords}
            >
              Fetch Record
            </button>
          </div>
        </div>
        <div className="records-section bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-lg font-medium mb-4 text-blue-600">
            Patient Records
          </h2>
          {patientRecords.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-600">#</th>
                    <th className="px-4 py-2 text-left text-gray-600">Name</th>
                    <th className="px-4 py-2 text-left text-gray-600">
                      Diagnosis
                    </th>
                    <th className="px-4 py-2 text-left text-gray-600">
                      Treatment
                    </th>
                    <th className="px-4 py-2 text-left text-gray-600">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {patientRecords.map((record, index) => (
                    <tr
                      key={index}
                      className={`border-b border-gray-200 hover:bg-gray-50 transition duration-200 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="px-4 py-2 text-gray-700">
                        {record.recordID.toString()}
                      </td>
                      <td className="px-4 py-2 text-gray-700">
                        {record.patientName}
                      </td>
                      <td className="px-4 py-2 text-gray-700">
                        {record.diagnosis}
                      </td>
                      <td className="px-4 py-2 text-gray-700">
                        {record.treatment}
                      </td>
                      <td className="px-4 py-2 text-gray-700">
                        {new Date(
                          Number(record.timestamp) * 1000
                        ).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-gray-400 mt-4">
              <p>No records found for this patient.</p>
            </div>
          )}
        </div>
        <div className="form-section bg-gray-50 border border-gray-300 rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-lg font-medium mb-4 text-blue-600">
            Add Patient Record
          </h2>
          <div className="space-y-4">
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-200 focus:outline-none"
              type="text"
              placeholder="Patient Name"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
            />
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-200 focus:outline-none"
              type="text"
              placeholder="Diagnosis"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
            />
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-200 focus:outline-none"
              type="text"
              placeholder="Treatment"
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
            />
            <button
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-500 transition duration-200"
              onClick={addRecord}
            >
              Add Records
            </button>
          </div>
        </div>
        <div className="form-section bg-gray-50 border border-gray-300 rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-lg font-medium mb-4 text-blue-600">
            Authorize Healthcare Provider
          </h2>
          <div className="space-y-4">
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              type="text"
              placeholder="Provider Address"
              value={providerAddress}
              onChange={(e) => setProviderAddress(e.target.value)}
            />
            <button
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 ease-in-out"
              onClick={authorizeProvider}
              disabled={isLoading}
            >
              {isLoading ? 'Authorizing...' : 'Authorize Provider'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
