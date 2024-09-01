"use client";


import React, { useRef, useState , useEffect } from 'react';
import ChatroomWrapper from '../../../components/ChatroomWrapper';
import { useParams } from 'next/navigation';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,} from '@chakra-ui/react';
import { useDisclosure , Button , FormControl , FormLabel , Input } from '@chakra-ui/react';
import {ethers } from "ethers";


import {  SignProtocolClient,SpMode,  EvmChains,  delegateSignAttestation, delegateSignRevokeAttestation, delegateSignSchema,} from "@ethsign/sp-sdk";



interface ChatroomPageProps{
  name: string;
  hashtag: string;
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
    });
 


  const bet = async() => {
    const currentBetAmount = betInputRef.current?.value;
    console.log(currentBetAmount);


    if(!account) {
      alert("Wallet not connected");
      return
    }

    const betAmountWei = ethers.parseEther(currentBetAmount || '0');


    console.log(account);


    // Define Action enum
    enum Action{
      USER_BET = 0 ,
      MEME_WIN = 1
    }


     // Prepare the extra data
    const extraData = ethers.AbiCoder.defaultAbiCoder().encode(
      ['uint8', 'uint256', 'uint256'],
      [Action.USER_BET, "1", betAmountWei]
    );

    const UserAddress = account as `0x${string}`


    const createAttestationRes = await client.createAttestation(
      {
        schemaId: "0xc4",
        data: {
          user: UserAddress,
          meme_id: "memeName_1",
          bet_amount: betAmountWei,
          bet_timestamp: Math.floor(Date.now() / 1000)
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


   


    console.log(createAttestationRes);
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









