import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore, where, getDocs, query } from "firebase/firestore";
import { collection, addDoc, updateDoc, arrayUnion, doc, getDoc, setDoc } from 'firebase/firestore';
import { increment } from 'firebase/firestore';
import { serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const addMemeBattle = async (battle: { name: string; description: string }) => {
  try {
    const docRef = await addDoc(collection(db, 'battles'), {
      ...battle,
      createdAt: serverTimestamp(),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      status: 'active'
    });
    console.log("Battle added with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding battle: ", e);
    return null;
  }
};

export const addMemeToBattle = async (
  battleId: string,
  memeData: {
    name: string;
    image: string;
    hashtag: string;
  }
) => {
  try {
    const battleRef = doc(db, "memeBattles", battleId);
    await updateDoc(battleRef, {
      memes: arrayUnion(memeData)
    });
    console.log("Meme added to battle: ", battleId);
    return true;
  } catch (e) {
    console.error("Error adding meme to battle: ", e);
    return false;
  }
};

export const placeBet = async (
  battleId: string,
  memeIndex: number,
  userAddress: string,
  amount: number
) => {
  try {
    const betRef = doc(db, "memeBattles", battleId, "bets", userAddress);
    await setDoc(betRef, {
      memeIndex,
      amount,
      timestamp: new Date()
    });
    console.log("Bet placed successfully");
    return true;
  } catch (e) {
    console.error("Error placing bet: ", e);
    return false;
  }
};

export const getBattleDetails = async (battleId: string) => {
  try {
    const battleDoc = await getDoc(doc(db, "memeBattles", battleId));
    if (battleDoc.exists()) {
      return { id: battleDoc.id, ...battleDoc.data() };
    } else {
      console.log("No such battle!");
      return null;
    }
  } catch (e) {
    console.error("Error getting battle details: ", e);
    return null;
  }
};

export const getMemeDetails = async (battleId: string, memeIndex: number) => {
  try {
    const battleDoc = await getDoc(doc(db, "memeBattles", battleId));
    if (battleDoc.exists()) {
      const battleData = battleDoc.data();
      if (battleData.memes && battleData.memes[memeIndex]) {
        return battleData.memes[memeIndex];
      } else {
        console.log("No such meme in this battle!");
        return null;
      }
    } else {
      console.log("No such battle!");
      return null;
    }
  } catch (e) {
    console.error("Error getting meme details: ", e);
    return null;
  }
};



export const registerUser = async (userAddress: string) => {
  const userRef = doc(db, 'users', userAddress);
  await setDoc(userRef, {
    battlesParticipated: 0,
    battlesWon: 0,
    totalStaked: 0,
    wonMemes: []
  }, { merge: true });
};

export const updateUserBet = async (userAddress: string, battleId: string, memeIndex: number, betAmount: number) => {
  const userRef = doc(db, 'users', userAddress);
  const battleRef = doc(db, 'memeBattles', battleId);

  await updateDoc(userRef, {
    battlesParticipated: increment(1),
    totalStaked: increment(betAmount)
  });

  await updateDoc(battleRef, {
    [`memes.${memeIndex}.participants`]: arrayUnion({ userAddress, betAmount })
  });
};

export const updateBattleWinner = async (battleId: string, winningMemeIndex: number) => {
  const battleRef = doc(db, 'memeBattles', battleId);
  const battleDoc = await getDoc(battleRef);
  const battleData = battleDoc.data();

  if (battleData) {
    const winningMeme = battleData.memes[winningMemeIndex];
    for (const participant of winningMeme.participants) {
      const userRef = doc(db, 'users', participant.userAddress);
      await updateDoc(userRef, {
        battlesWon: increment(1),
        wonMemes: arrayUnion(winningMeme.hashtag)
      });
    }
  }
};




// Add this function to get battle status
export const getBattleStatus = async (battleId: string) => {
  try {
    const battleDoc = await getDoc(doc(db, "memeBattles", battleId));
    if (battleDoc.exists()) {
      const battleData = battleDoc.data();
      return battleData.status || 'closed'; // Default to 'closed' if status is not set
    } else {
      console.log("No such battle!");
      return 'closed';
    }
  } catch (e) {
    console.error("Error getting battle status: ", e);
    return 'closed';
  }
};

// Add a function to update battle status
export const updateBattleStatus = async (battleId: string, status: 'open' | 'closed') => {
  try {
    const battleRef = doc(db, "memeBattles", battleId);
    await updateDoc(battleRef, { status });
    console.log(`Battle status updated to ${status}`);
    return true;
  } catch (e) {
    console.error("Error updating battle status: ", e);
    return false;
  }
};

// Add these functions to your firebase.ts file

export const addUserBet = async (userId: string, battleId: string, memeId: string, amount: number) => {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    await setDoc(userRef, {
      battlesParticipated: 1,
      wins: 0,
      totalStaked: amount
    });
  } else {
    await updateDoc(userRef, {
      battlesParticipated: increment(1),
      totalStaked: increment(amount)
    });
  }

  const battleRef = doc(db, 'battles', battleId);
  await updateDoc(battleRef, {
    [`memes.${memeId}.bets.${userId}`]: amount
  });
};

export const updateWinningMeme = async (battleId: string, memeId: string) => {
  const battleRef = doc(db, 'battles', battleId);
  await updateDoc(battleRef, {
    winningMeme: memeId
  });

  const battleDoc = await getDoc(battleRef);
  const battleData = battleDoc.data();
  const winningMeme = battleData?.memes[memeId];

  if (winningMeme && winningMeme.bets) {
    for (const userId in winningMeme.bets) {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        wins: increment(1)
      });
    }
  }
};

export const getUserProfile = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  return userDoc.data();
};

export const getUserBattles = async (userId: string) => {
  const battlesRef = collection(db, 'battles');
  const querySnapshot = await getDocs(battlesRef);
  const userBattles = [];

  for (const doc of querySnapshot.docs) {
    const battleData = doc.data();
    for (const meme of Object.values(battleData.memes) as Array<{ bets?: Record<string, unknown> }>) {
      if (meme.bets && userId in meme.bets) {
        userBattles.push({ id: doc.id, ...battleData });
        break;
      }
    }
  }

  return userBattles;
};