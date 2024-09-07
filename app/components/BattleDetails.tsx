"use client";
import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import Link from 'next/link';

interface Meme {
  name: string;
  image: string;
  hashtag: string;
}

const BattleDetails: React.FC<{ battleId: string }> = ({ battleId }) => {
  const [battle, setBattle] = useState<any>(null);
  const [battleEndTime, setBattleEndTime] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [winningMemeIndex, setWinningMemeIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchBattleDetails = async () => {
      const battleDoc = await getDoc(doc(db, 'battles', battleId));
      if (battleDoc.exists()) {
        const battleData = battleDoc.data();
        setBattle(battleData);
        if (battleData.endTime && typeof battleData.endTime.toDate === 'function') {
          setBattleEndTime(battleData.endTime.toDate());
        }
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
        } else {
          const hours = Math.floor(distance / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [battle, battleEndTime]);

  const declareWinner = async () => {
    if (battle.winningMeme !== null) {
      alert('Winner has already been declared!');
      return;
    }

    const memeResults = await Promise.all(battle.memes.map(async (meme: Meme) => {
      if (!meme.hashtag) {
        console.error('Meme is missing hashtag:', meme);
        return { meme, mediaCount: 0 };
      }

      const url = `https://instagram-scraper-20231.p.rapidapi.com/searchtag/${encodeURIComponent(meme.hashtag)}`;
      const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-key': 'c026b6f1f8msh176b6da96f22657p17c629jsn3e43e020dd32',
          'x-rapidapi-host': 'instagram-scraper-20231.p.rapidapi.com'
        }
      };

      try {
        const response = await fetch(url, options);
        const result = await response.json();
        return { meme, mediaCount: result.data[0]?.media_count || 0 };
      } catch (error) {
        console.error('Error fetching hashtag data:', error);
        return { meme, mediaCount: 0 };
      }
    }));

    const winningMeme = memeResults.reduce((prev, current) => 
      (prev.mediaCount > current.mediaCount) ? prev : current
    );

    const winningIndex = battle.memes.findIndex((meme: Meme) => meme.hashtag === winningMeme.meme.hashtag);

    if (winningIndex === -1) {
      console.error('Winning meme not found in battle memes');
      return;
    }

    const battleRef = doc(db, 'battles', battleId);
    await updateDoc(battleRef, {
      winningMeme: winningIndex
    });

    setWinningMemeIndex(winningIndex);
    setBattle({ ...battle, winningMeme: winningIndex });
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
      {timeLeft === 'Battle Ended' && battle.winningMeme === null && (
        <button
          onClick={declareWinner}
          className="mt-8 bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 transition-colors"
        >
          Declare Winner
        </button>
      )}
      {battle.winningMeme !== null && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">Winner: {battle.memes[battle.winningMeme].name}</h2>
          <img src={battle.memes[battle.winningMeme].image} alt={battle.memes[battle.winningMeme].name} className="w-64 h-64 object-cover rounded-md" />
        </div>
      )}
    </div>
  );
};

export default BattleDetails;
