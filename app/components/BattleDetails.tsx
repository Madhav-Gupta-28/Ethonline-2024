// "use client";

// import React, { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { doc, getDoc } from "firebase/firestore";
// import { db } from "@/firebase";

// interface Meme {
//   name: string;
//   image: string;
//   hashtag: string;
// }

// interface MemeBattle {
//   id: string;
//   name: string;
//   description: string;
//   memes: Meme[];
// }

// interface BattleDetailsProps {
//   battleId: string;
// }

// const BattleDetails: React.FC<BattleDetailsProps> = ({ battleId }) => {
//   const [battle, setBattle] = useState<MemeBattle | null>(null);
//   const router = useRouter();

//   useEffect(() => {
//     fetchBattleDetails();
//   }, [battleId]);

//   const fetchBattleDetails = async () => {
//     try {
//       const battleDoc = await getDoc(doc(db, "memeBattles", battleId));
//       if (battleDoc.exists()) {
//         setBattle({ id: battleDoc.id, ...battleDoc.data() } as MemeBattle);
//       } else {
//         console.log("No such battle!");
//         router.push("/battles");
//       }
//     } catch (error) {
//       console.error("Error fetching battle details:", error);
//     }
//   };

//   if (!battle) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div className="bg-gradient-to-b from-[#101212] to-[#08201D] min-h-screen p-6">
//       <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-white mb-8">
//         {battle.name}
//       </h1>
//       <p className="text-gray-300 text-center mb-8">{battle.description}</p>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {battle.memes.map((meme, index) => (
//           <Link href={`/battles/${battleId}/memes/${index}`} key={index}>
//             <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 hover:shadow-xl">
//               <img src={meme.image} alt={meme.name} className="w-full h-48 object-cover mb-4 rounded" />
//               <h2 className="text-2xl font-semibold text-white mb-2">{meme.name}</h2>
//               <p className="text-sm text-gray-300">#{meme.hashtag}</p>
//             </div>
//           </Link>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default BattleDetails;



// import React, { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { doc, getDoc } from "firebase/firestore";
// import { db } from "@/firebase";
// import { Modal } from "@nextui-org/react";

// interface Meme {
//   name: string;
//   image: string;
//   hashtag: string;
// }

// interface MemeBattle {
//   id: string;
//   name: string;
//   description: string;
//   memes: Meme[];
// }

// interface BattleDetailsProps {
//   battleId: string;
// }

// const BattleDetails: React.FC<BattleDetailsProps> = ({ battleId }) => {
//   const [battle, setBattle] = useState<MemeBattle | null>(null);
//   const [winner, setWinner] = useState<Meme | null>(null); // Store the winner
//   const [showModal, setShowModal] = useState(false); // Modal state
//   const [loading, setLoading] = useState(false); // Loading state for winner calculation
//   const router = useRouter();

//   useEffect(() => {
//     fetchBattleDetails();
//   }, [battleId]);

//   const fetchBattleDetails = async () => {
//     try {
//       const battleDoc = await getDoc(doc(db, "memeBattles", battleId));
//       if (battleDoc.exists()) {
//         setBattle({ id: battleDoc.id, ...battleDoc.data() } as MemeBattle);
//       } else {
//         console.log("No such battle!");
//         router.push("/battles");
//       }
//     } catch (error) {
//       console.error("Error fetching battle details:", error);
//     }
//   };

//   const fetchHashtagCounts = async (hashtag: string) => {
//     const url = `https://instagram-scraper-20231.p.rapidapi.com/searchtag/${hashtag}`;
//     const options = {
//       method: 'GET',
//       headers: {
//         'x-rapidapi-key': process.env.NEXT_PUBLIC_RAPIDAPI_KEY,
//         'x-rapidapi-host': 'instagram-scraper-20231.p.rapidapi.com'
//       }
//     };

//     try {
//       const response = await fetch(url, options);
//       const result = await response.json();
//       if (result.status === "success" && result.data[0]) {
//         return result.data[0].media_count; // return the media count
//       } else {
//         return 0; // return 0 if no result
//       }
//     } catch (error) {
//       console.error("Error fetching hashtag counts:", error);
//       return 0;
//     }
//   };

//   const determineWinner = async () => {
//     if (!battle || !battle.memes) return;

//     setLoading(true);
//     let highestCount = 0;
//     let winningMeme: Meme | null = null;

//     for (const meme of battle.memes) {
//       const count = await fetchHashtagCounts(meme.hashtag);
//       if (count > highestCount) {
//         highestCount = count;
//         winningMeme = meme;
//       }
//     }

//     setLoading(false);
//     setWinner(winningMeme);
//     setShowModal(true);
//   };

//   if (!battle) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div className="bg-gradient-to-b from-[#101212] to-[#08201D] min-h-screen p-6">
//       <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-white mb-8">
//         {battle.name}
//       </h1>
//       <p className="text-gray-300 text-center mb-8">{battle.description}</p>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {battle.memes.map((meme, index) => (
//           <Link href={`/battles/${battleId}/memes/${index}`} key={index}>
//             <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 hover:shadow-xl">
//               <img src={meme.image} alt={meme.name} className="w-full h-48 object-cover mb-4 rounded" />
//               <h2 className="text-2xl font-semibold text-white mb-2">{meme.name}</h2>
//               <p className="text-sm text-gray-300">#{meme.hashtag}</p>
//             </div>
//           </Link>
//         ))}
//       </div>

//       {/* Winner button */}
//       <button
//         className="mt-8 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
//         onClick={determineWinner}
//         disabled={loading}
//       >
//         {loading ? "Determining Winner..." : "Show Winner"}
//       </button>

//       {/* Modal for showing winner */}
//       <Modal
//         isOpen={showModal}
//         onRequestClose={() => setShowModal(false)}
//         className="bg-gray-800 text-white rounded-lg p-8 max-w-lg mx-auto mt-20"
//       >
//         {winner ? (
//           <div>
//             <h2 className="text-3xl font-bold mb-4">Winner Meme</h2>
//             <img src={winner.image} alt={winner.name} className="w-full h-48 object-cover mb-4 rounded" />
//             <p className="text-xl">Hashtag: #{winner.hashtag}</p>
//             <button
//               className="mt-4 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
//               onClick={() => setShowModal(false)}
//             >
//               Close
//             </button>
//           </div>
//         ) : (
//           <p>No winner found.</p>
//         )}
//       </Modal>
//     </div>
//   );
// };

// export default BattleDetails;

"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import Modal from 'react-modal'; // Import Modal for the popup

interface Meme {
  name: string;
  image: string;
  hashtag: string;
}

interface MemeBattle {
  id: string;
  name: string;
  description: string;
  memes: Meme[];
}

interface BattleDetailsProps {
  battleId: string;
}

const BattleDetails: React.FC<BattleDetailsProps> = ({ battleId }) => {
  const [battle, setBattle] = useState<MemeBattle | null>(null);
  const [winner, setWinner] = useState<Meme | null>(null); // Store the winner
  const [showModal, setShowModal] = useState(false); // Modal state
  const [loading, setLoading] = useState(false); // Loading state for winner calculation
  const router = useRouter();

  useEffect(() => {
    fetchBattleDetails();
  }, [battleId]);

  const fetchBattleDetails = async () => {
    try {
      const battleDoc = await getDoc(doc(db, "memeBattles", battleId));
      if (battleDoc.exists()) {
        setBattle({ id: battleDoc.id, ...battleDoc.data() } as MemeBattle);
      } else {
        console.log("No such battle!");
        router.push("/battles");
      }
    } catch (error) {
      console.error("Error fetching battle details:", error);
    }
  };

  const fetchHashtagCounts = async (hashtag: string) => {
    const url = `https://instagram-scraper-20231.p.rapidapi.com/searchtag/${hashtag}`;
    const options = {
      method: 'GET',
      headers: {
        // !need api key
        'x-rapidapi-key': 'your-api-key',
        'x-rapidapi-host': 'instagram-scraper-20231.p.rapidapi.com'
      }
    };

    try {
      const response = await fetch(url, options);
      const result = await response.json();
      if (result.status === "success" && result.data[0]) {
        return result.data[0].media_count; // return the media count
      } else {
        return 0; // return 0 if no result
      }
    } catch (error) {
      console.error("Error fetching hashtag counts:", error);
      return 0;
    }
  };

  const determineWinner = async () => {
    if (!battle || !battle.memes) return;

    setLoading(true);
    let highestCount = 0;
    let winningMeme: Meme | null = null;

    for (const meme of battle.memes) {
      const count = await fetchHashtagCounts(meme.hashtag);
      if (count > highestCount) {
        highestCount = count;
        winningMeme = meme;
      }
    }

    setLoading(false);
    setWinner(winningMeme);
    setShowModal(true);
  };

  if (!battle) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-gradient-to-b from-[#101212] to-[#08201D] min-h-screen p-6">
      <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-white mb-8">
        {battle.name}
      </h1>
      <p className="text-gray-300 text-center mb-8">{battle.description}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {battle.memes.map((meme, index) => (
          <Link href={`/battles/${battleId}/memes/${index}`} key={index}>
            <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 hover:shadow-xl">
              <img src={meme.image} alt={meme.name} className="w-full h-48 object-cover mb-4 rounded" />
              <h2 className="text-2xl font-semibold text-white mb-2">{meme.name}</h2>
              <p className="text-sm text-gray-300">#{meme.hashtag}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Winner button */}
      <button
        className="mt-8 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
        onClick={() => setShowModal(true)}
        disabled={loading}
      >
        {loading ? "Determining Winner..." : "Show Winner"}
      </button>

      {/* Modal for showing winner */}
      <Modal
        isOpen={showModal}
        onRequestClose={() => setShowModal(false)}
        className="bg-gray-800 text-white rounded-lg p-8 max-w-lg mx-auto mt-20"
      >
        {winner ? (
          <div>
            <h2 className="text-3xl font-bold mb-4">Winner Meme</h2>
            <img src={winner.image} alt={winner.name} className="w-full h-48 object-cover mb-4 rounded" />
            <p className="text-xl">Hashtag: #{winner.hashtag}</p>
            <button
              className="mt-4 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        ) : (
          <p>No winner found.</p>
        )}
      </Modal>
    </div>
  );
};

export default BattleDetails;
