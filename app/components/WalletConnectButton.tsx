"use client";

import React from 'react';
import { useWallet } from '../app/WalletContext';

const WalletConnectButton = () => {
  const { address, connectWallet, disconnectWallet } = useWallet();

  return (
    <div>
      {address ? (
        <div>
          <p>Connected: {address.slice(0, 6)}...{address.slice(-4)}</p>
          <button onClick={disconnectWallet} className="bg-red-500 text-white px-4 py-2 mt-2">
            Disconnect
          </button>
        </div>
      ) : (
        <button onClick={connectWallet} className="bg-blue-500 text-white px-4 py-2">
          Connect Wallet
        </button>
      )}
    </div>
  );
};

export default WalletConnectButton;