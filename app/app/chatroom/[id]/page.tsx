"use client";

import React, { useRef, useState , useEffect } from 'react';
import ChatroomWrapper from '../../../components/ChatroomWrapper';
import { useParams } from 'next/navigation';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,} from '@chakra-ui/react';
import { useDisclosure , Button , FormControl , FormLabel , Input } from '@chakra-ui/react';
import {ethers } from "ethers";

import {  SignProtocolClient,SpMode,  EvmChains,  delegateSignAttestation, delegateSignRevokeAttestation, delegateSignSchema,} from "@ethsign/sp-sdk";
import { privateKeyToAccount } from "viem/accounts";
const privateKey = `0x0e56dc56de5142b9f29bb8e448c0c6c332b352d7d17e8ac0bce8b25273c92896`; // private key


interface ChatroomPageProps{
  name: string;
  hashtag: string;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

const ChatroomPage: React.FC<ChatroomPageProps> = ({name,hashtag}) => {


  const [account, setAccount] = useState<string | null>(null);

  useEffect(() => {
    connectWallet();
  }, []);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Request account access`
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);

        // Switch to Arbitrum Sepolia
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x66eee' }], // Chain ID for Arbitrum Sepolia
        });
      } catch (error) {
        console.error('Error connecting to MetaMask', error);
      }
    } else {
      console.log('Please install MetaMask!');
    }
  };




  const { isOpen, onOpen, onClose } = useDisclosure();
  const betInputRef = useRef<HTMLInputElement>(null);

  const params = useParams();
  const roomId = params.id as string;

  // Sign Protocol Clint 
  const client = new SignProtocolClient(SpMode.OnChain, {
    chain: EvmChains.arbitrumSepolia,
    // account: privateKeyToAccount(privateKey), // Optional if you are using an injected provider
  });

  enum Action {
    USER_BET = 0,
    MEME_WIN = 1
  }
  

  const bet = async() => {
    try {
      const currentBetAmount = betInputRef.current?.value;
      if (!currentBetAmount || !account) {
        alert("Please enter a bet amount and connect your wallet");
        return;
      }
  
      const betAmountWei = ethers.parseEther(currentBetAmount);
  
      // Prepare the extra data
      const extraData = ethers.AbiCoder.defaultAbiCoder().encode(
        ['uint8', 'uint256', 'uint256'],
        [Action.USER_BET, 1, betAmountWei]
      );
  
      const createAttestationRes = await client.createAttestation(
        {
          schemaId: "0xc4",
          data: { 
            user: account, 
            meme_id: "memeName_1", 
            bet_amount: betAmountWei.toString(), // Convert BigInt to string
            bet_timestamp: Math.floor(Date.now() / 1000) // Use seconds instead of milliseconds
          },
          indexingValue: `${account.toLowerCase()}_${roomId}`,
        },
        {
          extraData: extraData,
          getTxHash: (txHash) => {
            console.log("Transaction hash:", txHash as `0x${string}`);
          }
        }
      );
  
      console.log("Attestation created:", createAttestationRes);
    } catch (error) {
      console.error("Error creating attestation:", error);
      alert("Failed to create attestation. Check console for details.");
    }
  }

  

  return (
    <>
        <ChatroomWrapper roomId={roomId} />

        <Button onClick={onOpen} colorScheme='green' >Bet</Button>

        <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{name}  {hashtag}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
          <FormControl>
            <FormLabel htmlFor='bet'>Bet Amount</FormLabel>
            <Input id='bet' type='number' placeholder='Enter bet amount'   ref={betInputRef}  />
          </FormControl>
            
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button onClick={bet} colorScheme='blue'>Bet</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </>

  );
};

export default ChatroomPage;



