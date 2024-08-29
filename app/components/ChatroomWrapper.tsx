"use client";

import React from 'react';
import Chatroom from './Chatroom';
import { useWallet } from '../app/WalletContext';

const ChatroomWrapper = ({ roomId }: { roomId: string }) => {
  const { address, connectWallet } = useWallet();

  if (!address) {
    return (
      <div>
        <p>Please connect your wallet to access the chatroom.</p>
        <button onClick={connectWallet} className="bg-blue-500 text-white px-4 py-2 mt-4">
          Connect Wallet
        </button>
      </div>
    );
  }

  return <Chatroom roomId={roomId} />;
};

export default ChatroomWrapper;
