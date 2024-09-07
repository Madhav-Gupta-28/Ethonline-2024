"use client";

import React, { useState, useEffect, useRef } from "react";
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, getDoc, doc } from "firebase/firestore";
import { db, getMemeDetails, placeBet, updateUserBet } from "@/firebase";
import { ethers } from "ethers";
import { SignProtocolClient, SpMode, EvmChains, AttestationResult } from "@ethsign/sp-sdk";

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: any;
}

interface Meme {
  name: string;
  image: string;
  hashtag: string;
}

interface MemeChatroomProps {
  battleId: string;
  memeIndex: number;
}

const MemeChatroom: React.FC<MemeChatroomProps> = ({ battleId, memeIndex }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [account, setAccount] = useState<string | null>(null);
  const [meme, setMeme] = useState<Meme | null>(null);
  const [betAmount, setBetAmount] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [attestationCreated, setattestationCreated] = useState<boolean>(false);
  const [battleEndTime, setBattleEndTime] = useState<Date | null>(null);
  const [isBettingClosed, setIsBettingClosed] = useState(false);

  const client = new SignProtocolClient(SpMode.OnChain, {
    chain: EvmChains.arbitrumSepolia,
  });

  const betInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      connectWallet();
      fetchMemeDetails();
      fetchBattleDetails();
    }
  }, [isClient, battleId, memeIndex]);

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x66eee' }],
        });
      } catch (error) {
        console.error("Error connecting to MetaMask", error);
      }
    } else {
      console.log("Please install MetaMask!");
    }
  };

  const fetchMemeDetails = async () => {
    const memeData = await getMemeDetails(battleId, memeIndex);
    if (memeData) {
      setMeme(memeData);
    }
  };

  const fetchBattleDetails = async () => {
    const battleDoc = await getDoc(doc(db, 'memeBattles', battleId));
    if (battleDoc.exists()) {
      const battleData = battleDoc.data();
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

  useEffect(() => {
    if (battleEndTime) {
      const interval = setInterval(() => {
        if (new Date() >= battleEndTime) {
          setIsBettingClosed(true);
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setIsBettingClosed(true); // Assume betting is closed if end time is not set
    }
  }, [battleEndTime]);

  useEffect(() => {
    if (!account) return;

    const memeMessagesRef = collection(
      db,
      `memeBattles/${battleId}/memes/${memeIndex}/chatMessages`
    );
    const q = query(memeMessagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageList = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Message)
      );
      setMessages(messageList);
    });

    return () => unsubscribe();
  }, [battleId, memeIndex, account]);

  const handleMessageSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!account || !newMessage.trim()) return;

    try {
      const memeMessagesRef = collection(
        db,
        `memeBattles/${battleId}/memes/${memeIndex}/chatMessages`
      );
      await addDoc(memeMessagesRef, {
        content: newMessage,
        sender: account,
        timestamp: serverTimestamp(),
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleBet = async () => {
    if (!account || !betAmount || isBettingClosed) return;
    const betAmountNumber = parseFloat(betAmount);
    if (isNaN(betAmountNumber) || betAmountNumber <= 0) {
      console.error("Invalid bet amount");
      return;
    }

    const currentBetAmount = betInputRef.current?.value;
    console.log(currentBetAmount);

    if (!account) {
      alert("Wallet not connected");
      return;
    }

    const betAmountWei = ethers.parseEther(currentBetAmount || '0');
    const roomIdBigInt = BigInt(memeIndex);

    const UserAddress = account as `0x${string}`;

    try {
      const createAttestationRes = await client.createAttestation(
        {
          schemaId: "0xda",
          data: {
            user: UserAddress,
            // meme_id: roomIdBigInt,
            meme_id : BigInt(3),
            bet_amount: betAmountWei,
            bet_timestamp: Math.floor(Date.now() / 1000),
            result: false,
            win_amount: BigInt(0),
            action: "USER_BET"
          },
          indexingValue: `${account.toLowerCase()}_${roomIdBigInt}`,
        },
        {
          resolverFeesETH: betAmountWei,
          getTxHash: (txHash) => {
            console.log("Transaction hash:", txHash as `0x${string}`);
          }
        }
      );

      if (createAttestationRes) {
        setattestationCreated(true);
        await updateUserBet(account, battleId, memeIndex, betAmountNumber);

        const success = await placeBet(
          battleId,
          memeIndex,
          account,
          betAmountNumber
        );

        if (success) {
          console.log(
            `Bet of ${betAmount} placed successfully on meme ${memeIndex} in battle ${battleId}`
          );
          setBetAmount("");
        } else {
          console.error("Failed to place bet");
        }
      } else {
        alert("Creation of Attestation Failed");
      }
    } catch (error) {
      console.log("Error when running createAttestation function", error);
    }
  };

  if (!account) {
    return <div>Please connect your wallet to access the chatroom.</div>;
  }

  return (
    <div className="p-6 bg-gradient-to-b from-[#091c29] via-[#08201D] to-[#051418] min-h-screen mt-4 rounded-3xl shadow-xl">
      {meme && (
        <div className="mb-6">
          <h1 className="text-4xl font-extrabold text-white mb-4">{meme.name}</h1>
          <img
            src={meme.image}
            alt={meme.name}
            className="w-full max-w-md mb-4 rounded-lg shadow-lg"
          />
          <p className="text-gray-400 text-lg">#{meme.hashtag}</p>
        </div>
      )}
      {isBettingClosed ? (
        <p className="text-red-500">Betting is closed for this battle.</p>
      ) : (
        <div className="mb-6 flex items-center gap-4">
          <input
            type="number"
            value={betAmount}
            ref={betInputRef}
            onChange={(e) => setBetAmount(e.target.value)}
            className="w-1/3 border border-gray-600 bg-transparent p-3 rounded-lg text-white outline-none focus:ring-2 focus:ring-green-400"
            placeholder="Bet amount"
          />
          <button
            onClick={handleBet}
            className="bg-green-500 hover:bg-green-600 transition-colors text-white px-5 py-3 rounded-lg shadow-md"
          >
            Place Bet
          </button>
        </div>
      )}
      <div className="mb-6 h-64 overflow-y-auto border border-gray-600 p-4 bg-gray-900 rounded-lg shadow-lg">
        {messages.map((message) => (
          <div key={message.id} className="mb-4 flex items-start gap-2">
            <div className="w-10 h-10 bg-gray-700 rounded-full flex-shrink-0" />
            <div className="flex flex-col">
              <span className="font-bold text-green-400">
                {message.sender.slice(0, 6)}...{message.sender.slice(-4)}
              </span>
              <span className="text-gray-300">{message.content}</span>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleMessageSubmit} className="flex gap-4">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-grow border border-gray-600 bg-transparent p-3 rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Type a message..."
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 transition-colors text-white px-5 py-3 rounded-lg shadow-md"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default MemeChatroom;
