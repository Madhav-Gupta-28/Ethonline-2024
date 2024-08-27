"use client";

import React, { useRef, useState } from 'react';
import ChatroomWrapper from '../../../components/ChatroomWrapper';
import { useParams } from 'next/navigation';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,} from '@chakra-ui/react';
import { useDisclosure , Button , FormControl , FormLabel , Input } from '@chakra-ui/react'

interface ChatroomPageProps{
  name: string;
  hashtag: string;
}

const ChatroomPage: React.FC<ChatroomPageProps> = ({name,hashtag}) => {

  const { isOpen, onOpen, onClose } = useDisclosure();

  const betInputRef = useRef<HTMLInputElement>(null);


  const params = useParams();
  const roomId = params.id as string;

  const bet = () => {
    const currentBetAmount = betInputRef.current?.value;
    console.log(currentBetAmount);
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



