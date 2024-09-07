// import Link from "next/link";

// export default function Home() {
//   return (
//     <main className=" p-2">
//       <h1 className="font-bold mx-auto text-4xl w-full flex justify-center items-center">Welcome to the the Meme Betting App</h1>
//       <div className="flex justify-center mx-auto gap-3 mt-20">
//         <Link className="bg-red-300 w-fit px-2 py-1 rounded-md" href="/dapp">Home page</Link>
//         <Link className="bg-green-300 w-fit px-2 py-1 rounded-md" href={"/chatSection"}>Chat Section</Link>
//       </div>
//     </main>
//   );
// }

import React from "react";
import Link from "next/link";

function Home() {
  return (
    <div className="bg-[#080B0F] min-h-screen grid grid-cols-1 md:grid-cols-2 overflow-hidden">
      {/* <div className=" flex flex-col items-center lg:items-start bg-red-500"> */}
      <div className="text-center lg:text-left flex flex-col justify-center col-span-1 md:pl-10 ">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#410DEF] to-[#8301D3]">
          Meme Betting App
        </h1>
        <p className="mt-6 text-lg text-gray-400 sm:text-xl w-[80%]">
          Engage in exciting meme betting competitions and chat with fellow
          stakers.
        </p>

        <Link
          href="/battles"
          className="w-fit flex items-center px-8 py-4 mt-8 font-semibold text-white transition-all duration-200 border-gradient-to-r from-[#410DEF] to-[#8301D3] rounded-lg shadow-sm hover:shadow-md border-transparent hover:border-gradient-to-r hover:from-[#410DEF] hover:to-[#8301D3] shadow-[#5A08C0]  hover:shadow-[#5A08C0] "
        >
          Go to Dashboard
          <svg
            className="w-6 h-6 ml-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 9l3 3m0 0l-3 3m3-3H8"
            />
          </svg>
        </Link>

        <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-center space-x-1">
            <svg
              className="flex-shrink-0 w-8 h-8 text-[#5A08C0]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 9l3 3m0 0l-3 3m3-3H8"
              />
            </svg>
            <p className="text-sm text-gray-300">
              Chat with other stakers online
            </p>
          </div>
          <div className="flex items-center space-x-1">
            <svg
              className="flex-shrink-0 w-8 h-8 text-[#5A08C0]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 9l3 3m0 0l-3 3m3-3H8"
              />
            </svg>
            <p className="text-sm text-gray-300">Compete for top rankings</p>
          </div>
          <div className="flex items-center space-x-1">
            <svg
              className="flex-shrink-0 w-8 h-8 text-[#5A08C0]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 9l3 3m0 0l-3 3m3-3H8"
              />
            </svg>
            <p className="text-sm text-gray-300">Win exciting rewards</p>
          </div>
        </div>
      </div>
      {/* <div className="col-span-1"> */}
      <div className="flex justify-center h-[100vh]">
        <div className="col-span-1 h-[700px] w-[1000px] bg-gradient-to-r from-[#410DEF] to-[#8301D3] rounded-lg shadow-lg transform rotate-12 transition-transform duration-300 hover:rotate-3 hover:scale-105 mr-0 translate-x-32 -translate-y-28">
          <div className="flex items-center justify-center h-full text-3xl font-semibold text-white">
            MEMES
          </div>
        </div>
      </div>
      {/* </div> */}
    </div>
  );
}

export default Home;
