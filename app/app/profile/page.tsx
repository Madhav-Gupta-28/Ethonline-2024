"use client";

import React from 'react';
import AttestationTable from './AttestationTable';

const UserProfile = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#091c29] via-[#08201D] to-[#051418] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-white mb-12 text-center">
          Your Profile
        </h1>
        <div className="bg-gray-800 bg-opacity-50 rounded-3xl shadow-2xl p-8 md:p-12">
          <div className="mb-10">
            <h2 className="text-3xl font-semibold text-green-300 mb-4">Your Attestations</h2>
            <p className="text-gray-300 text-lg">
              Here's a record of all your meme betting activities. Each attestation represents a bet you've made.
            </p>
          </div>
          <AttestationTable />
        </div>
      </div>
    </div>
  );
};

export default UserProfile;