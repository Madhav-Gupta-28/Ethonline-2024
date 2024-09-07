"use client";
import React, { useState, useEffect } from 'react';
import { ethers } from "ethers";
import { IndexService } from '@ethsign/sp-sdk';
import { decodeAbiParameters } from "viem";

interface Attestation {
  id: string;
  attester: string;
  data: string;
  schema: {
    data: { name: string; type: string }[];
  };
}

const AttestationTable: React.FC = () => {
  const [attestations, setAttestations] = useState<Attestation[]>([]);
  const [decodedData, setDecodedData] = useState<any[]>([]);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    const connectWallet = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          setAddress(address);
        } catch (error) {
          console.error('Error connecting to wallet:', error);
        }
      }
    };

    connectWallet();
  }, []);

  useEffect(() => {
    const fetchAttestations = async () => {
      if (address) {
        const indexService = new IndexService("testnet");
        const res = await indexService.queryAttestationList({
          id: "",
          schemaId: "onchain_evm_421614_0xda",
          attester: "",
          page: 1,
          mode: "onchain",
          indexingValue: ""
        });

        if (res?.rows) {
          const filteredAttestations = res.rows.filter(
            (attestation: Attestation) => 
              attestation.attester.toLowerCase() === address.toLowerCase()
          );
          setAttestations(filteredAttestations);
          decodeAttestationData(filteredAttestations);
        }
      }
    };

    fetchAttestations();
  }, [address]);

  const decodeAttestationData = (attestations: Attestation[]) => {
    const decodedDataObjects = attestations.map(att => {
      if (!att.data) return null;

      try {
        const hexData = att.data.startsWith('0x') ? att.data : `0x${att.data}`;
        const decodedData = decodeAbiParameters(
          att.schema.data,
          hexData as `0x${string}`
        ) as [string , bigint, bigint, bigint, boolean, bigint, string]; // Add this type assertion

        return {
          meme_id: decodedData[1].toString(),
          bet_amount: ethers.formatEther(decodedData[3].toString()),
          bet_timestamp: new Date(Number(decodedData[4]) * 1000).toLocaleString(),
          action: decodedData[6].toString()
        };
      } catch (error) {
        console.error('Error decoding attestation data:', error);
        return null;
      }
    }).filter(Boolean);

    setDecodedData(decodedDataObjects);
  };

  return (
    <div className="bg-gray-900 bg-opacity-60 rounded-3xl shadow-2xl p-8 backdrop-blur-lg">
      {/* <h2 className="text-3xl font-bold text-[#5A08C0] mb-6">Your Attestations</h2> */}
      {attestations.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No attestations found. Start betting to see your activity!</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-800 bg-opacity-50">
                <th className="p-4 text-sm font-semibold text-[#410DEF] uppercase tracking-wider">Meme Id</th>
                <th className="p-4 text-sm font-semibold text-[#410DEF] uppercase tracking-wider">Bet Amount (ETH)</th>
                <th className="p-4 text-sm font-semibold text-[#410DEF] uppercase tracking-wider">Bet Timestamp</th>
                <th className="p-4 text-sm font-semibold text-[#410DEF] uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {attestations.map((attestation, index) => (
                <tr key={attestation.id} className="hover:bg-gray-800 hover:bg-opacity-30 transition-colors duration-200">
                  <td className="p-4 text-gray-300">{decodedData[index]?.meme_id}</td>
                  <td className="p-4 text-gray-300">{decodedData[index]?.bet_amount}</td>
                  <td className="p-4 text-gray-300">{decodedData[index]?.bet_timestamp}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      decodedData[index]?.action === 'USER_BET' ? 'bg-[#5A08C0] text-blue-100' : 'bg-[#5A08C0] text-green-100'
                    }`}>
                      {decodedData[index]?.action}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AttestationTable;