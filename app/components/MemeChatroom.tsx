// import React, { useState, useEffect } from 'react';
// import { useParams } from 'next/navigation';
// import { collection, addDoc, onSnapshot, query, orderBy, doc, serverTimestamp, getDoc } from 'firebase/firestore';
// import { db } from '@/firebase';

// interface Message {
//   id: string;
//   content: string;
//   sender: string;
//   timestamp: any;
// }

// interface Meme {
//   name: string;
//   image: string;
//   hashtag: string;
// }

// const MemeChatroom: React.FC = () => {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [account, setAccount] = useState<string | null>(null);
//   const [meme, setMeme] = useState<Meme | null>(null);
//   const [betAmount, setBetAmount] = useState('');

//   const params = useParams();
//   const battleId = params.battleId as string;
//   const memeIndex = parseInt(params.memeIndex as string);

//   useEffect(() => {
//     connectWallet();
//     fetchMemeDetails();
//   }, []);

//   const connectWallet = async () => {
//     if (typeof window.ethereum !== 'undefined') {
//       try {
//         const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
//         setAccount(accounts[0]);
//         await window.ethereum.request({
//           method: 'wallet_switchEthereumChain',
//           params: [{ chainId: '0x66eee' }],
//         });
//       } catch (error) {
//         console.error('Error connecting to MetaMask', error);
//       }
//     } else {
//       console.log('Please install MetaMask!');
//     }
//   };

//   const fetchMemeDetails = async () => {
//     try {
//       const battleDoc = await getDoc(doc(db, 'memeBattles', battleId));
//       if (battleDoc.exists()) {
//         const battleData = battleDoc.data();
//         setMeme(battleData.memes[memeIndex]);
//       }
//     } catch (error) {
//       console.error('Error fetching meme details:', error);
//     }
//   };

//   useEffect(() => {
//     if (!account) return;

//     const chatroomRef = doc(db, 'memeBattles', battleId, 'memes', memeIndex.toString(), 'messages');
//     const messagesRef = collection(chatroomRef, 'messages');
//     const q = query(messagesRef, orderBy('timestamp', 'asc'));

//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       const messageList = snapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data()
//       } as Message));
//       setMessages(messageList);
//     });

//     return () => unsubscribe();
//   }, [battleId, memeIndex, account]);

//   const handleMessageSubmit = async (event: React.FormEvent) => {
//     event.preventDefault();
//     if (!account || !newMessage.trim()) return;

//     const chatroomRef = doc(db, 'memeBattles', battleId, 'memes', memeIndex.toString(), 'messages');
//     const messagesRef = collection(chatroomRef, 'messages');

//     try {
//       await addDoc(messagesRef, {
//         content: newMessage,
//         sender: account,
//         timestamp: serverTimestamp()
//       });
//       setNewMessage('');
//     } catch (error) {
//       console.error("Error sending message:", error);
//     }
//   };

//   const handleBet = async () => {
//     if (!account || !betAmount) return;
//     // Implement betting logic here
//     console.log(`Placing bet of ${betAmount} on meme ${memeIndex} in battle ${battleId}`);
//   };

//   if (!account) {
//     return <div>Please connect your wallet to access the chatroom.</div>;
//   }

//   return (
//     <div className="p-4 bg-gradient-to-b from-[#101212] to-[#08201D] min-h-screen">
//       {meme && (
//         <div className="mb-4">
//           <h1 className="text-3xl font-bold text-white mb-2">{meme.name}</h1>
//           <img src={meme.image} alt={meme.name} className="w-full max-w-md mb-2 rounded" />
//           <p className="text-gray-300">#{meme.hashtag}</p>
//         </div>
//       )}
//       <div className="mb-4">
//         <input
//           type="number"
//           value={betAmount}
//           onChange={(e) => setBetAmount(e.target.value)}
//           className="border border-gray-300 p-2 mr-2"
//           placeholder="Bet amount"
//         />
//         <button onClick={handleBet} className="bg-green-500 text-white px-4 py-2">Place Bet</button>
//       </div>
//       <div className="mb-4 h-64 overflow-y-auto border border-gray-300 p-2 bg-gray-800">
//         {messages.map((message) => (
//           <div key={message.id} className="mb-2 text-white">
//             <span className="font-bold">{message.sender.slice(0, 6)}...{message.sender.slice(-4)}:</span> {message.content}
//           </div>
//         ))}
//       </div>
//       <form onSubmit={handleMessageSubmit} className="flex">
//         <input
//           type="text"
//           value={newMessage}
//           onChange={(e) => setNewMessage(e.target.value)}
//           className="flex-grow border border-gray-300 p-2"
//           placeholder="Type a message..."
//         />
//         <button type="submit" className="bg-blue-500 text-white px-4 py-2 ml-2">Send</button>
//       </form>
//     </div>
//   );
// };

// export default MemeChatroom;

"use client";

import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db, getMemeDetails, placeBet } from "@/firebase";

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

  useEffect(() => {
    connectWallet();
    fetchMemeDetails();
  }, [battleId, memeIndex]);

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
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
    if (!account || !betAmount) return;
    const betAmountNumber = parseFloat(betAmount);
    if (isNaN(betAmountNumber) || betAmountNumber <= 0) {
      console.error("Invalid bet amount");
      return;
    }

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
      <div className="mb-6 flex items-center gap-4">
        <input
          type="number"
          value={betAmount}
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
