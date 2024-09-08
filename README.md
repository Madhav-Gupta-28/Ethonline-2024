# Bet-a-Meme

Bet-A-Meme: The Ultimate Viral Meme Betting platform where memes meet blockchain. Bet on viral meme templates, compete to make them go viral, and earn rewards. Powered by Sign Protocol, it's the ultimate fusion of social media trends and decentralized finance.

## Quick Links

- [Live Demo](https://bet-a-meme.vercel.app/)
- [Source Code](https://github.com/yourgithubusername/bet-a-meme)
- [Sign Protocol Schema](https://testnet-scan.sign.global/schema/onchain_evm_421614_0xe9)

## Contract Address

MemeBattle Contract: `0xe5c6ff16a8932b5f88059248549e4abdaea7bf55` (Arbitrum Sepolia Testnet)

## Project Description

Bet-a-Meme is a platform where users can bet on meme templates they believe will go viral, combining the thrill of meme culture with the excitement of decentralized betting. Users compete to make their chosen meme the most popular by creating, sharing, and posting it with a unique hashtag. The meme template that gets the most posts wins, and users who bet on it earn their stake back with a bonus.

### Key Features

1. **Bet Creation and Attestation**: Users place bets on meme templates, with each bet recorded as an attestation on the blockchain using Sign Protocol.
2. **Reward Claiming and Attestation Verification**: Winners claim rewards after battle conclusion, with eligibility verified through blockchain attestations.
3. **Decentralized and Transparent Reward Distribution**: Automatic and verifiable reward distribution based on meme virality.
4. **Real-time Chat**: Users can discuss and strategize about their bets in real-time.
5. **Dynamic Battle Management**: Create battles, add memes, and declare winners dynamically.

## How it's Made

### Tech Stack

- **Frontend**: Next.js with Tailwind CSS
- **Backend & Database**: Firebase (Realtime Database, Authentication, Cloud Functions)
- **Blockchain Integration**: Ethereum (via ethers.js)
- **Attestation and Security**: Sign Protocol
- **API Integration**: RapidAPI for fetching Instagram post counts

### Key Implementations

1. **Schema Hooks**: Custom on-chain logic execution for bet creation and reward claims.
2. **Social Media Integration**: Using RapidAPI to fetch Instagram post counts for determining meme virality.
3. **Real-time Chat in Blockchain Context**: Combining Firebase real-time chat with blockchain betting.

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- Yarn or npm
- MetaMask browser extension

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourgithubusername/bet-a-meme.git
   cd bet-a-meme
   ```

2. Install dependencies:
   ```
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add the following:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
   NEXT_PUBLIC_CONTRACT_ADDRESS=0xe5c6ff16a8932b5f88059248549e4abdaea7bf55
   ```

4. Run the development server:
   ```
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Connect your MetaMask wallet to the Arbitrum Sepolia Testnet.
2. Browse active meme battles or create a new one.
3. Place bets on meme templates you think will go viral.
4. Share and post memes with the unique hashtag to increase their virality.
5. Claim rewards if your chosen meme wins the battle.

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Sign Protocol for providing the attestation and security framework
- Arbitrum for the testnet infrastructure
- ETHOnline 2024 for the inspiration and platform



graph TD
    A[User] -->|Connects Wallet| B(Bet-a-Meme Platform)
    B -->|Browse Battles| C{Create or Join Battle?}
    C -->|Create| D[Create New Battle]
    C -->|Join| E[Select Existing Battle]
    D --> F[Set Battle Parameters]
    F --> G[Deploy Battle Contract]
    E --> H[Choose Meme Template]
    H --> I[Place Bet]
    I --> J[Sign Protocol Attestation]
    J --> K[Update User Profile]
    K --> L[Share Meme on Social Media]
    L --> M[Track Meme Virality]
    M --> N{Battle Ended?}
    N -->|No| L
    N -->|Yes| O[Determine Winner]
    O --> P[Claim Rewards]
    P --> Q[Verify Attestation]
    Q --> R[Distribute Rewards]
    R --> S[Update User Stats]




This flow diagram illustrates the user journey from connecting their wallet to claiming rewards, highlighting the key steps in the Bet-a-Meme process.
To reference specific code blocks from the provided snippets, I'll use the format you specified:


For the bet placement logic:


const handlePlaceBet = async () => {
  if (!account || !client) return;
  try {
    const createAttestationRes = await client.createAttestation({
      schemaId: "0xe9",
      data: {
        user: account as `0x${string}`,
        battleId: battleId as string,
        meme_id: BigInt(memeIndex + 1),
        bet_amount: ethers.parseEther(betAmount || "0"),
        bet_timestamp: BigInt(Math.floor(Date.now() / 1000)),
        win_amount: BigInt(0),
        action: "USER_BET",
      },
      indexingValue: `${account.toLowerCase()}`,
    }, {
      resolverFeesETH: ethers.parseEther(betAmount || "0"),
      getTxHash: (txHash) => console.log("Transaction hash:", txHash),
    });
    if (createAttestationRes) {
      await addUserBet(account, battleId, memeIndex.toString(), Number(betAmount), meme);
      toast.success(`Bet of ${betAmount} ETH placed successfully!`);
    }
  } catch (error) {
    console.error("Error placing bet:", error);
    toast.error("Error placing bet. Please try again.");
  }
};


For the winner declaration process:


const declareWinner = async () => {
  if (battle.winningMeme !== null) {
    toast.error("Winner has already been declared!");
    return;
  }
  try {
    const memeResults = await Promise.all(battle.memes.map(async (meme) => {
      const response = await fetch(`https://instagram-scraper-20231.p.rapidapi.com/searchtag/${encodeURIComponent(meme.hashtag)}`, options);
      const result = await response.json();
      return { meme, mediaCount: result.data[0]?.media_count || 0 };
    }));
    const winningMeme = memeResults.reduce((prev, current) => prev.mediaCount > current.mediaCount ? prev : current);
    const winningIndex = battle.memes.findIndex((meme) => meme.hashtag === winningMeme.m


For the reward claiming process:


const handleClaim = async () => {
if (!account || !client) return;
setIsClaiming(true);
try {
const userMeme = battle.memes.find(meme => meme.participants.includes(account));
if (!userMeme) throw new Error("User meme not found");
const createAttestationRes = await client.createAttestation({
schemaId: "0xda",
data: {
user: account as 0x${string},
meme_id: BigInt(battle.memes.indexOf(userMeme)),
bet_amount: BigInt(0),
bet_timestamp: BigInt(Math.floor(Date.now() / 1000)),
result: true,
win_amount: BigInt(Number(winnings)),
action: "CLAIM"
},
indexingValue: ${account.toLowerCase()}_${battle.id},
}, {
resolverFeesETH: ethers.parseEther("0"),
getTxHash: (txHash) => console.log("Claim transaction hash:", txHash),
});
if (createAttestationRes) {
onClaimSuccess(battle.id);
setIsOpen(false);
}
} catch (error) {
console.error('Error claiming reward:', error);
} finally {

{
setIsClaiming(false);
}
};


