"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  getDoc,
  doc,
} from "firebase/firestore";
import {
  db,
  getMemeDetails,
  placeBet,
  updateUserBet,
  getBattleStatus,
  addMemeToBattle,
  addUserBet,
} from "@/firebase";
import { ethers } from "ethers";
import {
  SignProtocolClient,
  SpMode,
  EvmChains,
  AttestationResult,
} from "@ethsign/sp-sdk";
import doge_pp from "../public/doge_pp.jpg";
import Image from "next/image";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  const [isBettingClosed, setIsBettingClosed] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [battleEndTime, setBattleEndTime] = useState<Date | null>(null);
  const [attestationCreated, setAttestationCreated] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    setIsClient(true);
  }, []);

  const client = isClient
    ? new SignProtocolClient(SpMode.OnChain, {
        chain: EvmChains.arbitrumSepolia,
      })
    : null;

  const betInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isClient) {
      connectWallet();
      fetchMemeDetails();
      fetchBattleDetails();
    }
  }, [isClient, battleId, memeIndex]);

  useEffect(() => {
    const checkBattleStatus = async () => {
      const status = await getBattleStatus(battleId);
      setIsBettingClosed(status !== "open");
    };
    checkBattleStatus();
  }, [battleId]);

  const connectWallet = async () => {
    if (isClient && typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x66eee" }],
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
    const battleDoc = await getDoc(doc(db, "battles", battleId));
    if (battleDoc.exists()) {
      const battleData = battleDoc.data();
      setBattleEndTime(battleData.endTime.toDate());
    }
  };

  useEffect(() => {
    if (battleEndTime) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const endTime = battleEndTime.getTime();
        const distance = endTime - now;

        if (distance < 0) {
          clearInterval(timer);
          setTimeLeft("Battle Ended");
          setIsBettingClosed(true);
        } else {
          const hours = Math.floor(distance / (1000 * 60 * 60));
          const minutes = Math.floor(
            (distance % (1000 * 60 * 60)) / (1000 * 60)
          );
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
          setIsBettingClosed(false);
        }
      }, 1000);

      return () => clearInterval(timer);
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

  const handlePlaceBet = async () => {
    const currentBetAmount = betInputRef.current?.value;
    console.log(currentBetAmount);

    if (!account) {
      toast.error("Wallet not connected");
      return;
    }

    const betAmountWei = ethers.parseEther(currentBetAmount || "0");
    const roomIdBigInt = BigInt(memeIndex);

    const UserAddress = account as `0x${string}`;

    if (!client) {
      console.error("SignProtocolClient is not initialized");
      toast.error("Error initializing bet. Please try again.");
      return;
    }

    const memeIdForContract = BigInt(memeIndex + 1);

    try {
      toast.info("Placing bet...", { autoClose: false });
      const createAttestationRes = await client.createAttestation(
        {
          schemaId: "0xe9",
          data: {
            user: UserAddress,
            battleId: battleId as string,
            meme_id: memeIdForContract as BigInt,
            bet_amount: betAmountWei,
            bet_timestamp: Math.floor(Date.now() / 1000),
            win_amount: BigInt(0),
            action: "USER_BET",
          },
          indexingValue: `${account.toLowerCase()}`,
        },
        {
          resolverFeesETH: betAmountWei,
          getTxHash: (txHash) => {
            console.log("Transaction hash:", txHash as `0x${string}`);
          },
        }
      );

      if (createAttestationRes) {
        setAttestationCreated(true);

        await addUserBet(UserAddress, battleId, memeIndex.toString(), Number(currentBetAmount), {
          name: String(3) || '',
          image: meme?.image || '',
          hashtag: meme?.hashtag || ''
        });

        console.log(`Bet of ${betAmount} placed successfully on meme ${memeIndex} in battle ${battleId}`);
        setBetAmount("");
        toast.success(`Bet of ${currentBetAmount} ETH placed successfully!`);
      } else {
        toast.error("Failed to place bet. Please try again.");
      }
    } catch (error) {
      console.log("Error when running createAttestation function", error);
      toast.error("Error placing bet. Please try again.");
    }
  };

  if (!isClient) {
    return null; // or a loading indicator
  }

  if (!account) {
    return (
      <div className="p-6 bg-[#080B0F] mt-4 rounded-3xl shadow-xl flex justify-center items-start h-fit w-full">
        <button
          onClick={connectWallet}
          className="text-white bg-gradient-to-br from-[#410DEF] to-[#8301D3] hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
        >
          Connect Wallet to proceed
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#080B0F] min-h-screen mt-4 rounded-3xl shadow-xl">
      {meme && (
        <div className="mb-6">
          <h1 className="text-4xl font-extrabold text-white mb-4">
            {meme.name}
          </h1>
          <img
            src={meme.image}
            alt={meme.name}
            className="w-full max-w-md mb-4 rounded-lg shadow-lg"
          />
          <p className="text-gray-400 text-lg">#{meme.hashtag}</p>
        </div>
      )}
      {!isBettingClosed ? (
        <div className="mb-6 flex items-center gap-4">
          <input
            type="number"
            value={betAmount}
            ref={betInputRef}
            onChange={(e) => setBetAmount(e.target.value)}
            className="w-1/3 border border-[#6B0CDF] bg-transparent p-3 rounded-lg text-white outline-none focus:ring-2 focus:ring-green-400"
            placeholder="Bet amount"
          />
          <button
            onClick={() => handlePlaceBet()}
            className="text-white bg-gradient-to-br from-[#410DEF] to-[#8301D3] hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          >
            Place Bet
          </button>
        </div>
      ) : (
        <p className="text-red-600">Betting is closed for this battle.</p>
      )}
      <p className="text-lg text-red-500 mb-6">Time left: {timeLeft}</p>
      <div className="mb-6 h-64 overflow-y-auto border border-[#6B0CDF] p-4 bg-[#18191A] rounded-lg shadow-lg">
        {messages.map((message) => (
          <div key={message.id} className="mb-4 flex items-start gap-2">
            {/* <div className="w-10 h-10 bg-purple-700 rounded-full flex-shrink-0" /> */}
            <div className="w-10 h-10 rounded-full flex-shrink-0 relative overflow-hidden">
              <Image
                src={doge_pp}
                alt="Profile Picture"
                layout="fill"
                objectFit="cover"
                className="rounded-full"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[#6B0CDF]">
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
          className="flex-grow border bg-transparent p-3 rounded-lg text-white outline-none border-[#6B0CDF]"
          placeholder="Type a message..."
        />
        <button
          type="submit"
          className="text-gray-200 font-semibold bg-[#6B0CDF] px-4 py-2 rounded-xl cursor-pointer border-2 border-transparent hover:border-2 hover:border-[#6B0CDF] hover:bg-transparent"
        >
          Send
        </button>
      </form>
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default MemeChatroom;
