"use client";

import React from "react";
import Link from "next/link";
import WalletConnectButton from "../../components/WalletConnectButton";
import { ThirdwebProvider } from "@thirdweb-dev/react";

const ChatSection = () => {
  return (
    <ThirdwebProvider clientId="5101ab374c610f458813c8583fffa1da">
      <div>
        <div>Chat Section</div>
        <WalletConnectButton />
        <div className="flex gap-4">
          <Link href="/chatroom/1" className="w-64 h-64 bg-gray-500 flex items-center justify-center">
            Chatroom 1
          </Link>
          <Link href="/chatroom/2" className="w-64 h-64 bg-gray-500 flex items-center justify-center">
            Chatroom 2
          </Link>
          <Link href="/chatroom/3" className="w-64 h-64 bg-gray-500 flex items-center justify-center">
            Chatroom 3
          </Link>
        </div>
      </div>
    </ThirdwebProvider>
  );
};

export default ChatSection;
