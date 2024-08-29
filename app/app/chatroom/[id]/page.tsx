"use client";

import React, { useRef, useState } from 'react';
import ChatroomWrapper from '../../../components/ChatroomWrapper';
import { useParams } from 'next/navigation';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,} from '@chakra-ui/react';
import { useDisclosure , Button , FormControl , FormLabel , Input } from '@chakra-ui/react';

import {  SignProtocolClient,SpMode,  EvmChains,  delegateSignAttestation, delegateSignRevokeAttestation, delegateSignSchema,} from "@ethsign/sp-sdk";
import { privateKeyToAccount } from "viem/accounts";
const privateKey = `0x0e56dc56de5142b9f29bb8e448c0c6c332b352d7d17e8ac0bce8b25273c92896`; // private key

import { useWallet } from '@/app/WalletContext';


interface ChatroomPageProps{
  name: string;
  hashtag: string;
}

const ChatroomPage: React.FC<ChatroomPageProps> = ({name,hashtag}) => {

  const { address } = useWallet();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const betInputRef = useRef<HTMLInputElement>(null);

  const params = useParams();
  const roomId = params.id as string;

  // Sign Protocol Clint 
  const client = new SignProtocolClient(SpMode.OnChain, {
    chain: EvmChains.arbitrumSepolia,
    account: privateKeyToAccount(privateKey), // Optional if you are using an injected provider
  });
  

  const bet = async() => {
    const currentBetAmount = betInputRef.current?.value;
    console.log(currentBetAmount);
    console.log(privateKey);

    if(!address) {
      alert("Wallet not connected");
      return
    }

    console.log(address)

    // ***** Some Thoughts before doing the attestions Their is one way.. like we can do the tx first and then pash the tx hash in attestions
    // *** We can use the schema hooks to do the attestion and receive payments from the user based on their score.


    const createAttestationRes = await client.createAttestation({
      schemaId: "0xbf",
      data: { user_id: address , meme_id : "memeName_1" , stake_amount : currentBetAmount , bet_timestamp : Date.now() , schema_hook_data : "......................... "  },
      indexingValue: `${address.toLowerCase()}_${roomId}`,
    });

    console.log(createAttestationRes);
  }

  return (
    <>
        <ChatroomWrapper roomId={roomId} />

        <Button onClick={onOpen}>Open Modal</Button>

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



