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
      const battleList = battleSnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as MemeBattle)
      );
      setMemeBattles(battleList);
      console.log("Fetched meme battles:", battleList);
    } catch (error) {
      console.error("Error fetching meme battles:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-white text-center mt-10">Loading battles...</div>
    );
  }

  if (memeBattles.length === 0) {
    return (
      <div className="text-white text-center mt-10">
        No battles found. Create a new battle to get started!
        <div className="mt-4">
        <Link
            href="/battles/addMemeBattle"
            className="text-white bg-gradient-to-br from-[#410DEF] to-[#8301D3] hover:bg-gradient-to-bl font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
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
            <div className="bg-[#18191A] border-2 border-[#303031] backdrop-blur-xl p-6 rounded-lg shadow-lg transition-transform transform group-hover:scale-105 group-hover:shadow-xl">
              <h2 className="text-2xl font-semibold text-purple-500 mb-2">
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
          href="/battles/addMemeBattle"
          className="text-white bg-gradient-to-br from-[#410DEF] to-[#8301D3] hover:bg-gradient-to-bl font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
        >
          Add New Meme Battle
        </Link>
      </div>
    </div>
  );
};

export default BattlesList;
