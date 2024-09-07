"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";

interface MemeBattle {
  id: string;
  name: string;
  description: string;
  createdAt: any;
  endTime: any;
  status: string;
  memes: Array<{ name: string; image: string; hashtag: string }>;
}

const BattlesList: React.FC = () => {
  const [memeBattles, setMemeBattles] = useState<MemeBattle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemeBattles();
  }, []);

  const fetchMemeBattles = async () => {
    try {
      setLoading(true);
      const battlesCollection = collection(db, "battles");
      const battleSnapshot = await getDocs(battlesCollection);
      const battleList = battleSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as MemeBattle));
      setMemeBattles(battleList);
      console.log("Fetched meme battles:", battleList);
    } catch (error) {
      console.error("Error fetching meme battles:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-white text-center mt-10">Loading battles...</div>;
  }

  if (memeBattles.length === 0) {
    return (
      <div className="text-white text-center mt-10">
        No battles found. Create a new battle to get started!
        <div className="mt-4">
          <Link
            href="/addMemeBattle"
            className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-3 rounded-lg shadow-lg hover:from-green-500 hover:to-blue-600 transition-transform transform hover:scale-105"
          >
            Add New Meme Battle
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
        {memeBattles.map((battle) => (
          <Link
            href={`/battles/${battle.id}`}
            key={battle.id}
            className="group"
          >
            <div className="bg-gradient-to-r from-green-800 via-green-900 to-green-950 p-6 rounded-lg shadow-lg transition-transform transform group-hover:scale-105 group-hover:shadow-xl">
              <h2 className="text-2xl font-semibold text-white mb-2">
                {battle.name}
              </h2>
              <p className="text-sm text-gray-300 mb-4">{battle.description}</p>
              <p className="text-xs text-gray-400">
                {battle.memes.length} memes in this battle
              </p>
            </div>
          </Link>
        ))}
      </div>
      <div className="flex justify-center mt-8">
        <Link
          href="/addMemeBattle"
          className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-3 rounded-lg shadow-lg hover:from-green-500 hover:to-blue-600 transition-transform transform hover:scale-105"
        >
          Add New Meme Battle
        </Link>
      </div>
    </div>
  );
};

export default BattlesList;
