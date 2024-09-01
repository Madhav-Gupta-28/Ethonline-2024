"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';

interface MemeBattle {
  id: string;
  name: string;
  description: string;
  memes: Array<{ name: string; image: string; hashtag: string }>;
}

const ChatSection: React.FC = () => {
  const [memeBattles, setMemeBattles] = useState<MemeBattle[]>([]);

  useEffect(() => {
    fetchMemeBattles();
  }, []);

  const fetchMemeBattles = async () => {
    try {
      const battlesCollection = collection(db, 'memeBattles');
      const battleSnapshot = await getDocs(battlesCollection);
      const battleList = battleSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as MemeBattle));
      setMemeBattles(battleList);
      console.log('Fetched meme battles:', battleList);
    } catch (error) {
      console.error('Error fetching meme battles:', error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Meme Battles</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {memeBattles.map((battle) => (
          <Link href={`/chatroom/${battle.id}`} key={battle.id}>
            <div className="bg-gray-100 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold mb-1">{battle.name}</h2>
              <p className="text-sm mb-2">{battle.description}</p>
              <p className="text-xs text-gray-600">{battle.memes.length} memes in this battle</p>
            </div>
          </Link>
        ))}
      </div>
      <Link href="/addMemeBattle" className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded">
        Add New Meme Battle
      </Link>
    </div>
  );
};

export default ChatSection;
