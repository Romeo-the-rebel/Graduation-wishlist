'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { uploadProfilePicture, createUserProfile } from '../../lib/appwrite';
import { useUser } from '../context/UserContext';
import { FiEye, FiEyeOff } from 'react-icons/fi';


export default function CreateProfilePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { setUser, loading } = useUser();

  if (loading) return <p className="text-center text-white">Loading...</p>;

  const handleSaveProfile = async () => {
    if (!name || !email || !phone || !password || !file) {
      setError('All fields are required.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const uploadedFileId = await uploadProfilePicture(file);
      if (!uploadedFileId) throw new Error('Failed to upload profile picture.');

      const profileDocument = await createUserProfile({
        username: name,
        email,
        password,
        phone,
        profilepicture: uploadedFileId,
      });

      if (!profileDocument) throw new Error('Profile creation failed.');

      
      setUser({
        $id: profileDocument.$id,
        username: profileDocument.username,
        email: profileDocument.email,
        phone: profileDocument.phone,
        profilepicture: profileDocument.profilepicture,
      });

      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black text-white px-4 py-8 sm:px-6 md:px-10">
      <div className="w-full max-w-lg sm:max-w-md space-y-6">
        {error && <p className="text-red-500 text-center">{error}</p>}
        <div className="space-y-4 bg-white text-black p-6 sm:p-4 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold tracking-tight text-center">📋 Create Your Profile</h1>

          <div>
            <label className="block mb-1 text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-700">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Enter your phone number"
            />
          </div>

         <div className="relative">
            <label className="block mb-1 text-gray-700 my-auto">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded bg-gray-100 border border-gray-300"
              placeholder="Enter a secure password"
            />
            <div
              className="absolute inset-y-0 right-0  top-7 justify-center px-2 flex items-center cursor-pointer"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </div>
      </div>


          <label className="block text-gray-700 mb-2">Profile Picture</label>
          <div className="bg-gray-100 p-4 rounded-lg border border-gray-300 text-center">
            <div className="relative w-full border-2 border-dashed border-gray-400 rounded-md p-4 cursor-pointer hover:border-black transition">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              />
              <div className="flex flex-col items-center text-center text-black">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 mb-2 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm3 12l3-4 2 3 3-4 4 5H6z"
                  />
                </svg>
                <p className="text-sm">Click to upload or drag and drop</p>
                {file && <p className="mt-2 text-xs text-green-600">{file.name}</p>}
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="w-full py-2 bg-black text-white rounded hover:bg-gray-900 transition disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}
