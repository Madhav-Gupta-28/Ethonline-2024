"use client";

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getUserBattles } from '../../firebase';
import UserBattleCard from '../../components/UserBattleCard';

interface Battle {
  id: string;
  name: string;
  description: string;
  winningMeme: string;
  claimed: boolean;
  memes: any[]; // Replace 'any[]' with a more specific type if possible
}

const UserProfile = () => {
  const [battles, setBattles] = useState<Battle[]>([]);
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
    const fetchBattles = async () => {
      if (address) {
        const userBattles = await getUserBattles(address);
        setBattles(userBattles as Battle[]); // Type assertion
      }
    };

    fetchBattles();
  }, [address]);

  const handleClaimSuccess = (battleId: string) => {
    setBattles(prevBattles => 
      prevBattles.map(battle => 
        battle.id === battleId ? { ...battle, claimed: true } : battle
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#091c29] via-[#08201D] to-[#051418] p-6">
      <h1 className="text-4xl font-bold text-white mb-8">Your Battles</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {battles.map((battle) => (
          <UserBattleCard key={battle.id} battle={battle} onClaimSuccess={handleClaimSuccess} />
        ))}
      </div>
    </div>
  );
};

export default UserProfile;