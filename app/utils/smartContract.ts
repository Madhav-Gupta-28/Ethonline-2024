import { ethers } from 'ethers';
// import { abi } from './MemeBattleABI'; // You'll need to create this ABI file

const contractAddress = 'YOUR_CONTRACT_ADDRESS';

export const claimReward = async (battleId: string, userAddress: string) => {
  if (typeof window.ethereum !== 'undefined') {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    try {
      const transaction = await contract.claimReward(battleId, userAddress);
      await transaction.wait();
      return true;
    } catch (error) {
      console.error('Error claiming reward:', error);
      throw error;
    }
  } else {
    console.log('Please install MetaMask!');
    throw new Error('MetaMask not installed');
  }
};