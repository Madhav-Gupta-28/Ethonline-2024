"use client";
import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, updateBattleWinner } from '@/firebase';
import Link from 'next/link';

const BattleDetails: React.FC<{ battleId: string }> = ({ battleId }) => {
  const [battle, setBattle] = useState<any>(null);
  const [battleEndTime, setBattleEndTime] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [winningMemeIndex, setWinningMemeIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchBattleDetails = async () => {
      const battleDoc = await getDoc(doc(db, 'memeBattles', battleId));
      if (battleDoc.exists()) {
        const battleData = battleDoc.data();
        setBattle(battleData);
        if (battleData.endTime && typeof battleData.endTime.toDate === 'function') {
          setBattleEndTime(battleData.endTime.toDate());
        } else {
          console.error('Battle end time is missing or invalid');
          setBattleEndTime(null);
        }
      } else {
        console.error('Battle document does not exist');
      }
    };
    fetchBattleDetails();
  }, [battleId]);

  useEffect(() => {
    if (battle && battleEndTime) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const endTime = battleEndTime.getTime();
        const distance = endTime - now;

        if (distance < 0) {
          clearInterval(timer);
          setTimeLeft('Battle Ended');
          setWinningMemeIndex(Math.floor(Math.random() * battle.memes.length));
        } else {
          const hours = Math.floor(distance / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);

      return () => clearInterval(timer);
    } else {
      setTimeLeft('Battle end time not set');
    }
  }, [battle, battleEndTime]);

  const handleClaimWinnings = async () => {
    if (winningMemeIndex !== null) {
      await updateBattleWinner(battleId, winningMemeIndex);
      alert('Winnings claimed!');
    }
  };

  if (!battle) return <div>Loading...</div>;

  return (
    <div className="p-6 bg-gradient-to-b from-[#091c29] via-[#08201D] to-[#051418] min-h-screen">
      <h1 className="text-4xl font-bold text-white mb-4">{battle.name}</h1>
      <p className="text-xl text-gray-300 mb-4">{battle.description}</p>
      <p className="text-lg text-yellow-400 mb-6">Time left: {timeLeft}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {battle.memes.map((meme: any, index: number) => (
          <div key={index} className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <img src={meme.image} alt={meme.name} className="w-full h-48 object-cover rounded-md mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">{meme.name}</h2>
            <p className="text-gray-400 mb-4">#{meme.hashtag}</p>
            <Link href={`/battles/${battleId}/memes/${index}`} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
              Join Chatroom
            </Link>
          </div>
        ))}
      </div>
      {winningMemeIndex !== null && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">Winner: {battle.memes[winningMemeIndex].name}</h2>
          <button
            onClick={handleClaimWinnings}
            className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 transition-colors"
          >
            Claim Winnings
          </button>
        </div>
      )}
    </div>
  );
};

export default BattleDetails;
