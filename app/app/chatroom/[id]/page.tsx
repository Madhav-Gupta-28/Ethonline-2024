"use client";

import React from 'react';
import ChatroomWrapper from '../../../components/ChatroomWrapper';
import { useParams } from 'next/navigation';

const ChatroomPage = () => {
  const params = useParams();
  const roomId = params.id as string;

  return <ChatroomWrapper roomId={roomId} />;
};

export default ChatroomPage;