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
        );

        const obj: any = {};
        decodedData.forEach((item: any, i: number) => {
          obj[att.schema.data[i].name] = item.toString();
        });

        return obj;
      } catch (error) {
        console.error('Error decoding attestation data:', error);
        return null;
      }
    }).filter(Boolean);

    setDecodedData(decodedDataObjects);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
              Attester
            </th>
            <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
              Decoded Data
            </th>
          </tr>
        </thead>
        <tbody>
          {attestations.map((attestation, index) => (
            <tr key={attestation.id}>
              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                {attestation.id}
              </td>
              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                {attestation.attester}
              </td>
              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                {decodedData[index] && (
                  <pre>{JSON.stringify(decodedData[index], null, 2)}</pre>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttestationTable;