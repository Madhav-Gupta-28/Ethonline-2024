"use client";

import React, { useState } from 'react';
import { addMemeBattle, addMemeToBattle } from '../../../firebase';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardBody, Image } from "@nextui-org/react";
import { ethers } from "ethers";
import { abi , contractAddress} from "../../../constant/abi";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddMemeBattle: React.FC = () => {
  const [battleName, setBattleName] = useState('');
  const [battleDescription, setBattleDescription] = useState('');
  const [memes, setMemes] = useState<Array<{ name: string; image: string; hashtag: string }>>([]);
  const [currentMeme, setCurrentMeme] = useState({ name: '', image: '', hashtag: '' });
  const [errors, setErrors] = useState({ battleName: '', battleDescription: '', memeName: '', memeImage: '', memeHashtag: '' });
  const router = useRouter();

  const validateMemeFields = () => {
    const newErrors = {
      memeName: currentMeme.name ? '' : 'Enter this field',
      memeImage: currentMeme.image ? '' : 'Enter this field',
      memeHashtag: currentMeme.hashtag ? '' : 'Enter this field',
    };
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return newErrors.memeName === '' && newErrors.memeImage === '' && newErrors.memeHashtag === '';
  };

  const validateBattleFields = () => {
    const newErrors = {
      battleName: battleName ? '' : 'Enter this field',
      battleDescription: battleDescription ? '' : 'Enter this field',
    };
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return newErrors.battleName === '' && newErrors.battleDescription === '';
  };

  const handleAddMeme = () => {
    if (validateMemeFields()) {
      setMemes([...memes, currentMeme]);
      setCurrentMeme({ name: '', image: '', hashtag: '' });
      setErrors({ ...errors, memeName: '', memeImage: '', memeHashtag: '' });
    }
  };


  const createBattleOnContract = async (battleId: string, memeNames: string[]) => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
  
        const tx = await contract.createBattle(battleId, memeNames, 240);
        await tx.wait();
        console.log('Battle created on contract');
      } catch (error) {
        console.error('Error creating battle on contract:', error);
      }
    } else {
      console.error('Ethereum object not found, do you have MetaMask installed?');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateBattleFields() && memes.length > 0) {
      try {
        console.log('Attempting to add meme battle...');
        const battleId = await addMemeBattle({ name: battleName, description: battleDescription, memes });
        console.log('Meme battle added, ID:', battleId);
        if (battleId) {
          const memeNames = memes.map(meme => meme.name);
          await createBattleOnContract(battleId, memeNames);
          console.log('All memes added to battle');
          toast.success('Meme battle created successfully!', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          // router.push('/battles');
        } else {
          console.error('Failed to create meme battle');
          toast.error('Failed to create meme battle. Please try again.');
        }
      } catch (error) {
        console.error('Error in handleSubmit:', error);
        toast.error('An error occurred while creating the meme battle.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080B0F] p-6">
      <div className="w-full max-w-2xl bg-gray-900 bg-opacity-80 p-8 rounded-3xl shadow-xl">
        <h1 className="text-2xl font-extrabold text-[#6B0CDF] mb-8 text-center">Add New Meme Battle</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="battleName" className="block mb-2 text-lg font-semibold text-gray-200">Battle Name:</label>
            <input
              type="text"
              id="battleName"
              value={battleName}
              onChange={(e) => setBattleName(e.target.value)}
              className={`w-full px-4 py-2 border ${errors.battleName ? 'border-red-500' : 'border-gray-700'} bg-transparent rounded-lg text-white outline-none focus:ring-2 focus:ring-[#6B0CDF]`}
            />
            {errors.battleName && <p className="text-red-500 text-sm mt-1">{errors.battleName}</p>}
          </div>
          <div>
            <label htmlFor="battleDescription" className="block mb-2 text-lg font-semibold text-gray-200">Battle Description:</label>
            <textarea
              id="battleDescription"
              value={battleDescription}
              onChange={(e) => setBattleDescription(e.target.value)}
              className={`w-full p-4 border ${errors.battleDescription ? 'border-red-500' : 'border-gray-700'} bg-transparent rounded-lg text-white outline-none focus:ring-2 focus:ring-[#6B0CDF] h-32 resize-none`}
            ></textarea>
            {errors.battleDescription && <p className="text-red-500 text-sm mt-1">{errors.battleDescription}</p>}
          </div>
          <div className="border border-gray-700 p-6 rounded-lg">
            <h2 className="text-lg font-bold text-white mb-4">Add Memes</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Meme Name"
                value={currentMeme.name}
                onChange={(e) => setCurrentMeme({ ...currentMeme, name: e.target.value })}
                className={`w-full px-3 py-2 border ${errors.memeName ? 'border-red-500' : 'border-gray-700'} bg-transparent rounded-lg text-white outline-none focus:ring-2 focus:ring-[#6B0CDF]`}
              />
              {errors.memeName && <p className="text-red-500 text-sm mt-1">{errors.memeName}</p>}
              <input
                type="url"
                placeholder="Meme Image URL"
                value={currentMeme.image}
                onChange={(e) => setCurrentMeme({ ...currentMeme, image: e.target.value })}
                className={`w-full px-3 py-2 border ${errors.memeImage ? 'border-red-500' : 'border-gray-700'} bg-transparent rounded-lg text-white outline-none focus:ring-2 focus:ring-[#6B0CDF]`}
              />
              {errors.memeImage && <p className="text-red-500 text-sm mt-1">{errors.memeImage}</p>}
              <input
                type="text"
                placeholder="Meme Hashtag"
                value={currentMeme.hashtag}
                onChange={(e) => setCurrentMeme({ ...currentMeme, hashtag: e.target.value })}
                className={`w-full px-3 py-2 border ${errors.memeHashtag ? 'border-red-500' : 'border-gray-700'} bg-transparent rounded-lg text-white outline-none focus:ring-2 focus:ring-[#6B0CDF]`}
              />
              {errors.memeHashtag && <p className="text-red-500 text-sm mt-1">{errors.memeHashtag}</p>}
              <button
                type="button"
                onClick={handleAddMeme}
                className=" text-white bg-gradient-to-br from-[#410DEF] to-[#8301D3] hover:bg-gradient-to-bl font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              >
                Add Meme
              </button>
            </div>
            {memes.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-xl text-white mb-4">Added Memes:</h3>
                <ul className="space-y-2">
                  {memes.map((meme, index) => (
                    <li key={index} className="flex items-center space-x-2 text-gray-300">
                      <span className="font-bold text-[#6B0CDF]">{meme.name}</span>
                      <span>-</span>
                      <span>#{meme.hashtag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {memes.length > 0 && (
            <div className="mt-8">
              <Card className="bg-transparent shadow-none">
                <CardHeader className="pb-0 pt-0 px-0 flex-col items-start">
                  <p className="text-sm uppercase font-bold text-[#6B0CDF]">Sample Meme</p>
                  <h4 className="font-bold text-2xl text-white">{memes[0].name}</h4>
                  <small className="text-gray-400">#{memes[0].hashtag}</small>
                </CardHeader>
                <CardBody className="overflow-visible py-4 px-0">
                  <Image
                    alt="Meme image"
                    className="object-cover rounded-xl shadow-lg"
                    src={memes[0].image}
                    width="100%"
                    height={300}
                  />
                </CardBody>
              </Card>
            </div>
          )}
          <button
            type="submit"
            className="w-full border border-transparent bg-[#6B0CDF] hover:border hover:border-[#6B0CDF] hover:bg-transparent transition-colors text-white py-2 rounded-lg shadow-md font-semibold text-lg"
          >
            Create Meme Battle
          </button>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default AddMemeBattle;
