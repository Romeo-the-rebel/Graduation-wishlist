'use client';

import React, { useEffect, useState } from 'react';
import {
  getSelectedGiftsByUserId,
  getGiftDetailsById,
  deleteSelectedGiftById, makeAvailable
} from '@/lib/appwrite';
import { useUser } from '@/app/context/UserContext';

export default function ReceiptsPage() {
  const { user } = useUser();
  const [selectedGifts, setSelectedGifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGifts = async () => {
      if (!user?.$id) return;

      setLoading(true);
      try {
        const selected = await getSelectedGiftsByUserId(user.$id);

        const detailedGifts = await Promise.all(
          selected.map(async (gift) => {
            const details = await getGiftDetailsById(gift.productID);
            return {
              ...gift,
              details,
            };
          })
        );

        setSelectedGifts(detailedGifts);
      } catch (error) {
        console.error('Error loading selected gifts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGifts();
  }, [user?.$id]);

  const handleCancel = async (giftId: string, productID: string) => {
    try {
      await makeAvailable(productID); 
      await deleteSelectedGiftById(giftId);
      setSelectedGifts(prev => prev.filter(g => g.$id !== giftId));
    } catch (error) {
      console.error('Error cancelling gift:', error);
      alert('Could not cancel this gift. Try again.');
    }
  };
  

  if (loading) return <p className="p-4 text-white">Loading receipts...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white p-4 flex flex-col items-center">
  <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">🎁 Your Selected Gifts</h2>
    <p className="text-center text-gray-400 mb-4">Here are the gifts you have selected:</p>

  {selectedGifts.length === 0 ? (
    <p className="text-center text-gray-300">No gifts selected yet.</p>
  ) : (
    <div className="w-full max-w-4xl space-y-4">
      {selectedGifts.map((gift) => (
        <div
          key={gift.$id}
          className="bg-gray-900 border border-gray-700 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-center space-x-4">
            <img
              src={`https://fra.cloud.appwrite.io/v1/storage/buckets/68098ae3002784ce9cc4/files/${gift.details.image}/preview?project=68095cf0003cb28f3a6d&mode=admin`}
              alt={gift.details?.name}
              className="w-16 h-16 object-cover rounded"
            />
            <div>
              <h3 className="font-semibold text-base sm:text-lg">{gift.details?.name}</h3>
              <p className="text-sm text-gray-400">R {gift.details?.price}</p>
            </div>
          </div>
          <div className="flex justify-end sm:justify-start">
            <button
                onClick={() => handleCancel(gift.$id, gift.productID)}
                className="text-sm text-red-500 hover:underline"
            >
              Cancel
            </button>
          </div>
        </div>
      ))}
    </div>
  )}
  <button
  onClick={() => window.history.back()}
  className=" mt-10 mb-4 hover:underline self-start bg-white text-black px-4 py-2 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
>
 return to dashboard
</button>
</div>

  );
}
