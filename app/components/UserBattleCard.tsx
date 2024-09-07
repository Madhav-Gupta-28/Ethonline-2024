import React, { useState } from 'react';
import { Modal, Button } from '@nextui-org/react';
import { claimReward } from '../utils/smartContract';
import { useAccount } from 'wagmi';
import { ModalBody, ModalFooter, ModalHeader } from '@chakra-ui/react';

interface Battle {
  id: string;
  name: string;
  description: string;
  winningMeme: string;
  claimed: boolean;
  memes: Array<{
    name: string;
    participants: string[];
  }>;
}

const UserBattleCard = ({ battle, onClaimSuccess }: { battle: Battle; onClaimSuccess: (id: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const { address } = useAccount();

  const handleClaim = async () => {
    if (!address) return;
    setIsClaiming(true);
    try {
      await claimReward(battle.id, address);
      onClaimSuccess(battle.id);
      setIsOpen(false);
    } catch (error) {
      console.error('Error claiming reward:', error);
      // Show error message to user
    } finally {
      setIsClaiming(false);
    }
  };

  const userMeme = battle.memes.find(meme => meme.participants.includes(address ?? ''));
  const isWinner = userMeme && userMeme.name === battle.winningMeme;

  return (
    <>
      <div
        className="bg-gray-800 p-4 rounded-lg shadow-lg cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <h2 className="text-2xl font-bold text-white mb-2">{battle.name}</h2>
        <p className="text-gray-400 mb-4">{battle.description}</p>
        <p className="text-green-400">Your Meme: {userMeme ? userMeme.name : 'N/A'}</p>
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ModalHeader>
          <h3 className="text-xl font-semibold">{battle.name} Details</h3>
        </ModalHeader>
        <ModalBody>
          <p>Winning Meme: {battle.winningMeme}</p>
          <p>Your Meme: {userMeme ? userMeme.name : 'N/A'}</p>
          <p>Status: {isWinner ? 'Won' : 'Lost'}</p>
        </ModalBody>
        <ModalFooter>
          {isWinner && !battle.claimed && (
            <Button 
              color="success" 
              onClick={handleClaim} 
              disabled={isClaiming}
            >
              {isClaiming ? 'Claiming...' : 'Claim Reward'}
            </Button>
          )}
          <Button color="danger" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default UserBattleCard;