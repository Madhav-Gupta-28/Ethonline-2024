"use client";

import React, { useState } from 'react';
import { addMemeBattle, addMemeToBattle } from '../../firebase';
import { useRouter } from 'next/navigation';

const AddMemeBattle: React.FC = () => {
  const [battleName, setBattleName] = useState('');
  const [battleDescription, setBattleDescription] = useState('');
  const [memes, setMemes] = useState<Array<{ name: string; image: string; hashtag: string }>>([]);
  const [currentMeme, setCurrentMeme] = useState({ name: '', image: '', hashtag: '' });
  const router = useRouter();

  const handleAddMeme = () => {
    setMemes([...memes, currentMeme]);
    setCurrentMeme({ name: '', image: '', hashtag: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Attempting to add meme battle...');
      const battleId = await addMemeBattle({ name: battleName, description: battleDescription });
      console.log('Meme battle added, ID:', battleId);
      if (battleId) {
        for (const meme of memes) {
          console.log('Adding meme to battle:', meme);
          await addMemeToBattle(battleId, meme);
        }
        console.log('All memes added to battle');
        router.push('/chatSection');
      } else {
        console.error('Failed to create meme battle');
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Add New Meme Battle</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="battleName" className="block mb-1">Battle Name:</label>
          <input
            type="text"
            id="battleName"
            value={battleName}
            onChange={(e) => setBattleName(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="battleDescription" className="block mb-1">Battle Description:</label>
          <textarea
            id="battleDescription"
            value={battleDescription}
            onChange={(e) => setBattleDescription(e.target.value)}
            required
            className="w-full p-2 border rounded"
          ></textarea>
        </div>
        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Add Memes</h2>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Meme Name"
              value={currentMeme.name}
              onChange={(e) => setCurrentMeme({...currentMeme, name: e.target.value})}
              className="w-full p-2 border rounded"
            />
            <input
              type="url"
              placeholder="Meme Image URL"
              value={currentMeme.image}
              onChange={(e) => setCurrentMeme({...currentMeme, image: e.target.value})}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Meme Hashtag"
              value={currentMeme.hashtag}
              onChange={(e) => setCurrentMeme({...currentMeme, hashtag: e.target.value})}
              className="w-full p-2 border rounded"
            />
            <button type="button" onClick={handleAddMeme} className="bg-green-500 text-white px-4 py-2 rounded">
              Add Meme
            </button>
          </div>
          <div className="mt-4">
            <h3 className="font-semibold">Added Memes:</h3>
            <ul>
              {memes.map((meme, index) => (
                <li key={index}>{meme.name} - #{meme.hashtag}</li>
              ))}
            </ul>
          </div>
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Create Meme Battle
        </button>
      </form>
    </div>
  );
};

export default AddMemeBattle;
