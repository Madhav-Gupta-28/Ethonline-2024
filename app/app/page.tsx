import React from "react";
import Link from "next/link";
import picbet from "../public/crypto_meme_collage.webp";
import Image from "next/image";

function Home() {
  return (
    <div className="bg-[#080B0F] min-h-screen grid grid-cols-1 md:grid-cols-2 overflow-hidden">
      <div className="text-center lg:text-left flex flex-col justify-center col-span-1 md:pl-20">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#410DEF] to-[#8301D3]">
          Bet-a-Meme
        </h1>
        <div className="relative left-64 text-white">
          {" "}
          <span className="text-sm text-gray-500">Powered by</span> Sign
          Protocol
        </div>
        <p className="mt-6 text-lg text-gray-400 sm:text-xl w-[90%]">
          Where memes become{" "}
          <span className="font-semibold text-[#8301D3]">legends</span>, <br />{" "}
          and your <span className="font-semibold text-[#8301D3]">bets</span>{" "}
          fuel the battle for ultimate internet glory.
        </p>

        <Link
          href="/battles"
          className="w-fit flex items-center px-4 py-3 mt-8 font-semibold text-white transition-all duration-200 bg-gradient-to-r from-[#410DEF] to-[#8301D3] rounded-lg shadow-sm hover:shadow-sm border-transparent hover:border-gradient-to-r hover:from-[#410DEF] hover:to-[#8301D3] shadow-[#5A08C0] hover:shadow-[#5A08C0] group"
        >
          Go to Dashboard
          <svg
            className="w-8 h-8 ml-0 transform transition-transform duration-200 group-hover:translate-x-2"
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

        <div className="mt-12 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
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
      <div className="flex justify-center h-[100vh]">
        <div className="col-span-1 h-[700px] w-[1000px] bg-gradient-to-r from-[#410DEF] to-[#8301D3] rounded-lg shadow-lg transform rotate-12 transition-transform duration-300 hover:rotate-6 hover:scale-105 mr-0 translate-x-32 -translate-y-16 p-1">
          <div className="flex items-center justify-center h-full">
            <Image
              src={picbet}
              alt=""
              className="object-cover h-full w-full rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
