"use client";

import { createThirdwebClient } from "thirdweb";
import { ThirdwebProvider, ConnectButton } from "thirdweb/react";
import { createWallet, inAppWallet } from "thirdweb/wallets";

const client = createThirdwebClient({ clientId: "5101ab374c610f458813c8583fffa1da" }); // Replace with your actual client ID

const wallets = [
  inAppWallet(),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
];

export default function WalletConnectButton() {
  return (
    <ThirdwebProvider>
      <ConnectButton client={client} wallets={wallets} />
    </ThirdwebProvider>
  );
}