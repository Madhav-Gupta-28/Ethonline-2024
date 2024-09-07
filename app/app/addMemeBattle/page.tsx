// "use client";

// import React, { useState } from 'react';
// import { addMemeBattle, addMemeToBattle } from '../../firebase';
// import { useRouter } from 'next/navigation';
// import { Card, CardHeader, CardBody, Image } from "@nextui-org/react";

// const AddMemeBattle: React.FC = () => {
//   const [battleName, setBattleName] = useState('');
//   const [battleDescription, setBattleDescription] = useState('');
//   const [memes, setMemes] = useState<Array<{ name: string; image: string; hashtag: string }>>([]);
//   const [currentMeme, setCurrentMeme] = useState({ name: '', image: '', hashtag: '' });
//   const router = useRouter();

//   const handleAddMeme = () => {
//     setMemes([...memes, currentMeme]);
//     setCurrentMeme({ name: '', image: '', hashtag: '' });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       console.log('Attempting to add meme battle...');
//       const battleId = await addMemeBattle({ name: battleName, description: battleDescription });
//       console.log('Meme battle added, ID:', battleId);
//       if (battleId) {
//         for (const meme of memes) {
//           console.log('Adding meme to battle:', meme);
//           await addMemeToBattle(battleId, meme);
//         }
//         console.log('All memes added to battle');
//         router.push('/battles'); // Updated to match new routing structure
//       } else {
//         console.error('Failed to create meme battle');
//       }
//     } catch (error) {
//       console.error('Error in handleSubmit:', error);
//     }
//   };

//   return (
//     <div className="p-4">
//       <h1 className="text-2xl font-bold mb-4">Add New Meme Battle</h1>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label htmlFor="battleName" className="block mb-1">Battle Name:</label>
//           <input
//             type="text"
//             id="battleName"
//             value={battleName}
//             onChange={(e) => setBattleName(e.target.value)}
//             required
//             className="w-full p-2 border rounded"
//           />
//         </div>
//         <div>
//           <label htmlFor="battleDescription" className="block mb-1">Battle Description:</label>
//           <textarea
//             id="battleDescription"
//             value={battleDescription}
//             onChange={(e) => setBattleDescription(e.target.value)}
//             required
//             className="w-full p-2 border rounded"
//           ></textarea>
//         </div>
//         <div className="border p-4 rounded">
//           <h2 className="text-xl font-semibold mb-2">Add Memes</h2>
//           <div className="space-y-2">
//             <input
//               type="text"
//               placeholder="Meme Name"
//               value={currentMeme.name}
//               onChange={(e) => setCurrentMeme({...currentMeme, name: e.target.value})}
//               className="w-full p-2 border rounded"
//             />
//             <input
//               type="url"
//               placeholder="Meme Image URL"
//               value={currentMeme.image}
//               onChange={(e) => setCurrentMeme({...currentMeme, image: e.target.value})}
//               className="w-full p-2 border rounded"
//             />
//             <input
//               type="text"
//               placeholder="Meme Hashtag"
//               value={currentMeme.hashtag}
//               onChange={(e) => setCurrentMeme({...currentMeme, hashtag: e.target.value})}
//               className="w-full p-2 border rounded"
//             />
//             <button type="button" onClick={handleAddMeme} className="bg-green-500 text-white px-4 py-2 rounded">
//               Add Meme
//             </button>
//           </div>
//           <div className="mt-4">
//             <h3 className="font-semibold">Added Memes:</h3>
//             <ul>
//               {memes.map((meme, index) => (
//                 <li key={index}>{meme.name} - #{meme.hashtag}</li>
//               ))}
//             </ul>
//           </div>
//         </div>
//         {memes.length > 0 && (
//           <Card className="py-4">
//             <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
//               <p className="text-tiny uppercase font-bold">Sample Meme</p>
//               <small className="text-default-500">{memes[0].name}</small>
//               <h4 className="font-bold text-large">#{memes[0].hashtag}</h4>
//             </CardHeader>
//             <CardBody className="overflow-visible py-2">
//               <Image
//                 alt="Meme image"
//                 className="object-cover rounded-xl"
//                 src={memes[0].image}
//                 width={270}
//               />
//             </CardBody>
//           </Card>
//         )}
//         <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
//           Create Meme Battle
//         </button>
//       </form>
//     </div>
//   );
// };

// export default AddMemeBattle;


// "use client";

// import React, { useState } from 'react';
// import { addMemeBattle, addMemeToBattle } from '../../firebase';
// import { useRouter } from 'next/navigation';
// import { Card, CardHeader, CardBody, Image } from "@nextui-org/react";

// const AddMemeBattle: React.FC = () => {
//   const [battleName, setBattleName] = useState('');
//   const [battleDescription, setBattleDescription] = useState('');
//   const [memes, setMemes] = useState<Array<{ name: string; image: string; hashtag: string }>>([]);
//   const [currentMeme, setCurrentMeme] = useState({ name: '', image: '', hashtag: '' });
//   const router = useRouter();

//   const handleAddMeme = () => {
//     if (currentMeme.name && currentMeme.image && currentMeme.hashtag) {
//       setMemes([...memes, currentMeme]);
//       setCurrentMeme({ name: '', image: '', hashtag: '' });
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       console.log('Attempting to add meme battle...');
//       const battleId = await addMemeBattle({ name: battleName, description: battleDescription });
//       console.log('Meme battle added, ID:', battleId);
//       if (battleId) {
//         for (const meme of memes) {
//           console.log('Adding meme to battle:', meme);
//           await addMemeToBattle(battleId, meme);
//         }
//         console.log('All memes added to battle');
//         router.push('/battles');
//       } else {
//         console.error('Failed to create meme battle');
//       }
//     } catch (error) {
//       console.error('Error in handleSubmit:', error);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#091c29] via-[#08201D] to-[#051418] p-6">
//       <div className="w-full max-w-2xl bg-gray-900 bg-opacity-80 p-8 rounded-3xl shadow-xl">
//         <h1 className="text-4xl font-extrabold text-white mb-8 text-center">Add New Meme Battle</h1>
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <label htmlFor="battleName" className="block mb-2 text-lg font-semibold text-gray-200">Battle Name:</label>
//             <input
//               type="text"
//               id="battleName"
//               value={battleName}
//               onChange={(e) => setBattleName(e.target.value)}
//               required
//               className="w-full p-4 border border-gray-700 bg-transparent rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//           <div>
//             <label htmlFor="battleDescription" className="block mb-2 text-lg font-semibold text-gray-200">Battle Description:</label>
//             <textarea
//               id="battleDescription"
//               value={battleDescription}
//               onChange={(e) => setBattleDescription(e.target.value)}
//               required
//               className="w-full p-4 border border-gray-700 bg-transparent rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
//             ></textarea>
//           </div>
//           <div className="border border-gray-700 p-6 rounded-lg">
//             <h2 className="text-2xl font-bold text-white mb-4">Add Memes</h2>
//             <div className="space-y-4">
//               <input
//                 type="text"
//                 placeholder="Meme Name"
//                 value={currentMeme.name}
//                 onChange={(e) => setCurrentMeme({ ...currentMeme, name: e.target.value })}
//                 className="w-full p-3 border border-gray-700 bg-transparent rounded-lg text-white outline-none focus:ring-2 focus:ring-green-500"
//               />
//               <input
//                 type="url"
//                 placeholder="Meme Image URL"
//                 value={currentMeme.image}
//                 onChange={(e) => setCurrentMeme({ ...currentMeme, image: e.target.value })}
//                 className="w-full p-3 border border-gray-700 bg-transparent rounded-lg text-white outline-none focus:ring-2 focus:ring-green-500"
//               />
//               <input
//                 type="text"
//                 placeholder="Meme Hashtag"
//                 value={currentMeme.hashtag}
//                 onChange={(e) => setCurrentMeme({ ...currentMeme, hashtag: e.target.value })}
//                 className="w-full p-3 border border-gray-700 bg-transparent rounded-lg text-white outline-none focus:ring-2 focus:ring-green-500"
//               />
//               <button
//                 type="button"
//                 onClick={handleAddMeme}
//                 className="w-full bg-green-500 hover:bg-green-600 transition-colors text-white py-3 rounded-lg shadow-md font-semibold"
//               >
//                 Add Meme
//               </button>
//             </div>
//             {memes.length > 0 && (
//               <div className="mt-6">
//                 <h3 className="font-semibold text-xl text-white mb-4">Added Memes:</h3>
//                 <ul className="space-y-2">
//                   {memes.map((meme, index) => (
//                     <li key={index} className="flex items-center space-x-2 text-gray-300">
//                       <span className="font-bold text-green-400">{meme.name}</span>
//                       <span>-</span>
//                       <span>#{meme.hashtag}</span>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}
//           </div>
//           {memes.length > 0 && (
//             <div className="mt-8">
//               <Card className="bg-transparent shadow-none">
//                 <CardHeader className="pb-0 pt-0 px-0 flex-col items-start">
//                   <p className="text-sm uppercase font-bold text-green-500">Sample Meme</p>
//                   <h4 className="font-bold text-2xl text-white">{memes[0].name}</h4>
//                   <small className="text-gray-400">#{memes[0].hashtag}</small>
//                 </CardHeader>
//                 <CardBody className="overflow-visible py-4 px-0">
//                   <Image
//                     alt="Meme image"
//                     className="object-cover rounded-xl shadow-lg"
//                     src={memes[0].image}
//                     width="100%"
//                     height={300}
//                   />
//                 </CardBody>
//               </Card>
//             </div>
//           )}
//           <button
//             type="submit"
//             className="w-full bg-blue-500 hover:bg-blue-600 transition-colors text-white py-4 rounded-lg shadow-md font-semibold text-lg"
//           >
//             Create Meme Battle
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AddMemeBattle;



"use client";

import React, { useState } from 'react';
import { addMemeBattle, addMemeToBattle } from '../../firebase';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardBody, Image } from "@nextui-org/react";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateBattleFields() && memes.length > 0) {
      try {
        console.log('Attempting to add meme battle...');
        const battleId = await addMemeBattle({ name: battleName, description: battleDescription, memes });
        console.log('Meme battle added, ID:', battleId);
        if (battleId) {
          console.log('All memes added to battle');
          router.push('/battles');
        } else {
          console.error('Failed to create meme battle');
        }
      } catch (error) {
        console.error('Error in handleSubmit:', error);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#091c29] via-[#08201D] to-[#051418] p-6">
      <div className="w-full max-w-2xl bg-gray-900 bg-opacity-80 p-8 rounded-3xl shadow-xl">
        <h1 className="text-4xl font-extrabold text-white mb-8 text-center">Add New Meme Battle</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="battleName" className="block mb-2 text-lg font-semibold text-gray-200">Battle Name:</label>
            <input
              type="text"
              id="battleName"
              value={battleName}
              onChange={(e) => setBattleName(e.target.value)}
              className={`w-full p-4 border ${errors.battleName ? 'border-red-500' : 'border-gray-700'} bg-transparent rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.battleName && <p className="text-red-500 text-sm mt-1">{errors.battleName}</p>}
          </div>
          <div>
            <label htmlFor="battleDescription" className="block mb-2 text-lg font-semibold text-gray-200">Battle Description:</label>
            <textarea
              id="battleDescription"
              value={battleDescription}
              onChange={(e) => setBattleDescription(e.target.value)}
              className={`w-full p-4 border ${errors.battleDescription ? 'border-red-500' : 'border-gray-700'} bg-transparent rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none`}
            ></textarea>
            {errors.battleDescription && <p className="text-red-500 text-sm mt-1">{errors.battleDescription}</p>}
          </div>
          <div className="border border-gray-700 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-4">Add Memes</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Meme Name"
                value={currentMeme.name}
                onChange={(e) => setCurrentMeme({ ...currentMeme, name: e.target.value })}
                className={`w-full p-3 border ${errors.memeName ? 'border-red-500' : 'border-gray-700'} bg-transparent rounded-lg text-white outline-none focus:ring-2 focus:ring-green-500`}
              />
              {errors.memeName && <p className="text-red-500 text-sm mt-1">{errors.memeName}</p>}
              <input
                type="url"
                placeholder="Meme Image URL"
                value={currentMeme.image}
                onChange={(e) => setCurrentMeme({ ...currentMeme, image: e.target.value })}
                className={`w-full p-3 border ${errors.memeImage ? 'border-red-500' : 'border-gray-700'} bg-transparent rounded-lg text-white outline-none focus:ring-2 focus:ring-green-500`}
              />
              {errors.memeImage && <p className="text-red-500 text-sm mt-1">{errors.memeImage}</p>}
              <input
                type="text"
                placeholder="Meme Hashtag"
                value={currentMeme.hashtag}
                onChange={(e) => setCurrentMeme({ ...currentMeme, hashtag: e.target.value })}
                className={`w-full p-3 border ${errors.memeHashtag ? 'border-red-500' : 'border-gray-700'} bg-transparent rounded-lg text-white outline-none focus:ring-2 focus:ring-green-500`}
              />
              {errors.memeHashtag && <p className="text-red-500 text-sm mt-1">{errors.memeHashtag}</p>}
              <button
                type="button"
                onClick={handleAddMeme}
                className="w-full bg-green-500 hover:bg-green-600 transition-colors text-white py-3 rounded-lg shadow-md font-semibold"
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
                      <span className="font-bold text-green-400">{meme.name}</span>
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
                  <p className="text-sm uppercase font-bold text-green-500">Sample Meme</p>
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
            className="w-full bg-blue-500 hover:bg-blue-600 transition-colors text-white py-4 rounded-lg shadow-md font-semibold text-lg"
          >
            Create Meme Battle
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMemeBattle;
