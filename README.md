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





Thanks.. 

