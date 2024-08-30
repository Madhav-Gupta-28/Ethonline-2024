"use client";

import React, { useState } from "react";
import Link from "next/link";
import WalletConnectButton from "../../components/WalletConnectButton";
import { ThirdwebProvider } from "@thirdweb-dev/react";

interface HashtagResult {
  hashtag: string;
  count: number;
}

const ChatSection: React.FC = () => {
  const [winnerHashtag, setWinnerHashtag] = useState<HashtagResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchHashtagCount = async (hashtag: string): Promise<HashtagResult> => {
    const url = `https://instagram-scraper-20231.p.rapidapi.com/searchtag/${encodeURIComponent(hashtag)}`;
    const options: RequestInit = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': 'e1c5c7828amshed306ef3489e5e3p1498ccjsn7f91b9ceee32',
        'X-RapidAPI-Host': 'instagram-scraper-20231.p.rapidapi.com'
      }
    };

    try {
      const response = await fetch(url, options);
      const result = await response.json();
      if (result.status === 'success' && result.data && result.data.length > 0) {
        return { hashtag, count: result.data[0].media_count };
      }
      return { hashtag, count: 0 };
    } catch (error) {
      console.error(`Error fetching count for #${hashtag}:`, error);
      return { hashtag, count: 0 };
    }
  };

  const findWinnerHashtag = async (): Promise<void> => {
    setIsLoading(true);
    const hashtags: string[] = ['cattmirga', 'cattniara', 'cattpichii', 'catttikkii'];
    const results = await Promise.all(hashtags.map(fetchHashtagCount));
    const winner = results.reduce((max, current) => (current.count > max.count ? current : max));
    setWinnerHashtag(winner);
    setIsLoading(false);
  };

  return (
    <ThirdwebProvider clientId="5101ab374c610f458813c8583fffa1da">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Chat Section</h1>
        <WalletConnectButton />
        <div className="flex gap-4 my-4">
          <Link href="/chatroom/1" className="w-64 h-64 bg-gray-500 flex items-center justify-center text-white">
            Chatroom 1
          </Link>
          <Link href="/chatroom/2" className="w-64 h-64 bg-gray-500 flex items-center justify-center text-white">
            Chatroom 2
          </Link>
          <Link href="/chatroom/3" className="w-64 h-64 bg-gray-500 flex items-center justify-center text-white">
            Chatroom 3
          </Link>
        </div>
        <button
          onClick={findWinnerHashtag}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={isLoading}
        >
          {isLoading ? 'Calculating...' : 'Show Winner Hashtag'}
        </button>
        {winnerHashtag && (
          <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            <strong>Winner Hashtag:</strong> #{winnerHashtag.hashtag} with {winnerHashtag.count} posts
          </div>
        )}
      </div>
    </ThirdwebProvider>
  );
};

export default ChatSection;
