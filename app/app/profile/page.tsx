"use client";

import React from "react";
import AttestationTable from "./AttestationTable";
import Link from "next/link";

const UserProfile = () => {
  return (
    <section className="bg-[#080B0F] min-h-screen p-6">
      <div className="w-full h-fit py-5 bg-transparent backdrop-blur-2xl border-2 border-[#8301D3] to rounded-3xl flex justify-between items-center relative text-white px-10">
        <div>
          <Link
            href={"/"}
            className="text-2xl font-bold text-center text-transparent bg-clip-text bg-white cursor-pointer"
          >
            Meme Battles
          </Link>
        </div>
        <div className="flex justify-center items-center gap-7">
          <Link
            href={"/battles"}
            className=" text-gray-300 font-semibold transition-all duration-300 cursor-pointer link-underline link-underline-black text-lg"
          >
            Battle Page
          </Link>

          <Link
            href={"/profile"}
            className="text-[#5A08C0] transition-all duration-300 font-semibold cursor-pointer link-underline link-underline-black text-lg"
          >
            Profile
          </Link>
        </div>
        {/* <Link
          href={"/battles"}
          className="absolute left-5 text-gray-200 font-semibold bg-[#6B0CDF] px-4 py-2 rounded-xl cursor-pointer border-2 border-transparent hover:border-2 hover:border-[#6B0CDF] hover:bg-transparent"
        >
          Battle Page
        </Link>
        
        <div className="absolute right-5 text-gray-200 font-semibold bg-[#6B0CDF] px-4 py-2 rounded-xl cursor-pointer border-2 border-transparent hover:border-2 hover:border-[#6B0CDF] hover:bg-transparent">
          Connect Wallet
        </div> */}
      </div>

      <div className="min-h-screen bg-[#080B0F] p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#5A08C0] to-[#410DEF] mb-12 text-center">
            User Profile
          </h1>
          <div className="bg-gray-800 bg-opacity-50 rounded-3xl shadow-2xl p-8 md:p-12">
            <div className="mb-10">
              <h2 className="text-3xl font-semibold text-[#5A08C0] mb-4">
                Your Attestations
              </h2>
              <p className="text-gray-300 text-lg">
                Here is a record of all your meme betting activities. Each
                attestation represents a bet you have made.
              </p>
            </div>
            <AttestationTable />
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserProfile;
