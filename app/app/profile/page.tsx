"use client";

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getUserBattles, getUserProfile } from '../../firebase';
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
  const [userProfile, setUserProfile] = useState<any>(null);

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
    const fetchData = async () => {
      if (address) {
        const userBattles = await getUserBattles(address);
        setBattles(userBattles as Battle[]);
        const profile = await getUserProfile(address);
        setUserProfile(profile);
      }
    };

    fetchData();
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
      <h1 className="text-4xl font-bold text-white mb-8">Your Profile</h1>
      {userProfile && (
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Stats</h2>
          <p className="text-white">Battles Participated: {userProfile.battlesParticipated}</p>
          <p className="text-white">Wins: {userProfile.wins}</p>
          <p className="text-white">Total Staked: {userProfile.totalStaked} ETH</p>
        </div>
      )}
      <h2 className="text-3xl font-bold text-white mb-6">Your Battles</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {battles.map((battle) => (
          <UserBattleCard key={battle.id} battle={battle} onClaimSuccess={handleClaimSuccess} />
        ))}
      </div>
    </div>
  );
};

export default UserProfile;