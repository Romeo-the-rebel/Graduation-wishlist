"use client";

import React, { useEffect, useState } from "react";
import { getGifts, getUserDetailsById, makeUnavailable, createSelectedGift } from "@/lib/appwrite"; 
import { useUser } from "@/app/context/UserContext"; 
import {DatePicker} from "@heroui/date-picker";

import { useRouter } from "next/navigation";

type Gift = {
  id: string;
  name: string;
  price: number;
  available: boolean;
  link: string;
  imageId: string;
  type: number;
};

const DashboardPage = () => {
  const { user } = useUser(); 
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [selectedGifts, setSelectedGifts] = useState<string[]>([]);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [redirectLink, setRedirectLink] = useState<string | null>(null);  
  const [userDetailsLoading, setUserDetailsLoading] = useState<boolean>(true); 
  const [giftsLoading, setGiftsLoading] = useState<boolean>(true); 
  const[date, setDate] = useState<string>(""); 
  const [pendingGiftId, setPendingGiftId] = useState<string | null>(null);
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true); 

  useEffect(() => {
    const fetchGifts = async () => {
      setGiftsLoading(true); 
      try {
        const fetchedGifts = await getGifts();
        setGifts(fetchedGifts);
      } catch (err) {
        console.error('Error fetching gifts:', err);
      } finally {
        setGiftsLoading(false); 
      }
    };

    const fetchUserDetails = async () => {
      setUserDetailsLoading(true); 
      if (user?.$id) {
        try {
          const fetchedUser = await getUserDetailsById(user.$id);
          setUserDetails(fetchedUser); 
        } catch (err) {
          console.error('Error fetching user details:', err);
        } finally {
          setUserDetailsLoading(false); 
        }
      }
    };

    if (user) {
      
      fetchUserDetails();
      fetchGifts();
    }

  }, [user?.$id]);
const handleRouteChange = (path: string) => {
    router.push(path);
    setMenuOpen(false); 

  }
  const handleSelectGift = async (giftId: string) => {
    const gift = gifts.find(g => g.id === giftId);
    if (!gift || !gift.available) return;
  
    setPendingGiftId(giftId); 
    setRedirectLink(gift.link);
    setShowModal(true); 
  };
  
 
  const handleConfirmGift = async () => {
    if (!pendingGiftId || !user?.$id || !date) return;
  
    try {
      await makeUnavailable(pendingGiftId);
      await createSelectedGift(user.$id, pendingGiftId, date);
  
      setGifts(prev =>
        prev.map(g => g.id === pendingGiftId ? { ...g, available: false } : g)
      );
      setSelectedGifts(prev => [...prev, pendingGiftId]);
  
      if (redirectLink) window.location.href = redirectLink;
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setShowModal(false);
      setPendingGiftId(null);
      setRedirectLink(null);
    }
  };
  
  const scrollSection = (type: any, direction: string) => {
    const container = document.getElementById(`scroll-${type}`);
    if (!container) return;
    const scrollAmount = 300;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };
  

  const renderHeader = () => {
    if (!userDetails) {
      return null;
    }

    return (
      <nav className="bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white p-4 rounded-2xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo / App Name */}
        <div className="flex items-center gap-3">
        <img
             src={`https://fra.cloud.appwrite.io/v1/storage/buckets/68098ae3002784ce9cc4/files/${userDetails.profilepicture}/preview?project=68095cf0003cb28f3a6d&mode=admin`} // fallback image if no profile pic
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover"
          />
           <span className="font-semibold text-sm md:text-base">{userDetails.name||user?.username || "User"}</span>
           
         </div>

        {/* Hamburger Icon */}
        <button
          className="sm:hidden focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Menu Links */}
        <div className={`flex-col sm:flex-row sm:flex ${menuOpen ? 'flex' : 'hidden'} sm:items-center gap-4 absolute sm:static bg-gray-800 sm:bg-transparent left-0 right-0 top-[64px] sm:top-auto p-4 sm:p-0 z-10`}>
        <button
            className="hover:text-blue-400 transition"
            onClick={() => handleRouteChange('/receipts')}
          >
            My Gifts
          </button>
          <button
            className="bg-blue-700 rounded-2xl p-3 hover:text-blue-400 transition"
          >
            <a href="https://www.backabuddy.co.za/campaign/graduation~15" target="_blank">Donate</a>
            
          </button>
          
        </div>
      </div>
    </nav>
  )
   
  };

  const typeLabels: { [key: number]: string } = {
    1: "Technology",
    2: "Clothing",
    3: "Camping",
    4: "Sports",
  };

  const groupedGifts = (type: number) => {
    return gifts.filter((gift) => gift.type === type);
  };

  
  if (userDetailsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading User Details...</div> 
      </div>
    );
  }

  
  if (giftsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading Gifts...</div> 
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white text-black rounded-2xl shadow-lg p-8 w-full max-w-6xl space-y-8">
        
        {/* Header */}
        <div className="text-center text-2xl font-bold tracking-tight">
          🎓 Graduation Wishlist
        </div>
        {renderHeader()}

        {/* Main Content */}
        <main className="space-y-12">
          {Object.entries(typeLabels).map(([type, label]) => {
            const typedGifts = groupedGifts(Number(type));
            if (typedGifts.length === 0) return null;

            return (
              <section key={type}>
  <h2 className="text-xl md:text-2xl font-bold mb-4">{label}</h2>

  <div className="relative">
    {/* Scroll Buttons - Hidden on small & medium */}
    <button
      onClick={() => scrollSection(type, 'left')}
      className="hidden lg:flex absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-white border border-black rounded-full p-2 shadow-md hover:bg-gray-100"
    >
      ◀
    </button>
    <button
      onClick={() => scrollSection(type, 'right')}
      className="hidden lg:flex absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-white border border-black rounded-full p-2 shadow-md hover:bg-gray-100"
    >
      ▶
    </button>

    {/* Scrollable Container */}
    <div
      id={`scroll-${type}`}
      className="flex overflow-x-scroll space-x-8 p-2 md:p-4 rounded-2xl bg-gray-100 border-2 border-black scrollbar-hide"
    >
      {typedGifts.map((gift) => (
        <div
          key={gift.id}
          className="min-w-[200px] max-w-[200px] md:min-w-[250px] md:max-w-[250px] h-[320px] md:h-[400px] flex-shrink-0 border p-3 md:p-4 rounded shadow-md flex flex-col justify-between bg-white transition-transform hover:scale-105"
        >
          <div>
            <img
              src={`https://fra.cloud.appwrite.io/v1/storage/buckets/68098ae3002784ce9cc4/files/${gift.imageId}/preview?project=68095cf0003cb28f3a6d&mode=admin`}
              alt={gift.name}
              className="w-full h-[140px] md:h-[180px] object-cover rounded"
            />
            <h3 className="text-base md:text-lg font-bold mt-2 truncate">{gift.name}</h3>
            <p className="text-xs md:text-sm text-gray-600 mt-1">
              Price: R{gift.price.toFixed(2)}
            </p>
          </div>
          <a href={gift.link} target="_blank" rel="noopener noreferrer" className="items-center p-2 rounded text-xs md:text-base transition">
          <button
            disabled={!gift.available}
            className={`mt-3 p-2 rounded text-xs md:text-base transition ${
              gift.available
                ? selectedGifts.includes(gift.id)
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-400 text-white cursor-not-allowed"
            }`}
          >
            Redirect to Site
           
          
            
          </button>
          </a>

          <button
            onClick={() => handleSelectGift(gift.id)}
            disabled={!gift.available}
            className={`mt-3 p-2 rounded text-xs md:text-base transition ${
              gift.available
                ? selectedGifts.includes(gift.id)
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-400 text-white cursor-not-allowed"
            }`}
          >
            {selectedGifts.includes(gift.id) ? "Selected" : "Select"}
          </button>
        </div>
      ))}
    </div>
  </div>
</section>

            );
          })}
        </main>
        {showModal && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full text-center space-y-4">
                          <h2 className="text-xl font-semibold">Select a Delivery Date</h2>
                          <p className="text-gray-700">
                            Pick a date before confirming the gift selection.
                          </p>
                          <div className="w-full max-w-xl flex flex-row gap-4 justify-center">
                            <DatePicker
                              showMonthAndYearPickers
                              label="Delivery Date"
                              variant="bordered"
                              onChange={(val) => setDate(val?.toString() ?? "")} 
                            />
                          </div>
                          <div className="text-sm text-gray-500">
                            <h3 className="text-black font-semibold mb-2">
                            ⚠️NOTE: Please note this before ordering.
                            </h3>
                            <p className="text-gray-500">
                              1. The selected date is for delivery. <br />
                              2. My height is 1.9m and my weight is 85kg. <br />
                              3. I am a size 10 in shoes(UK) and a size 38(XL) in clothes. <br />
                              4. Please ensure the selected gift is suitable for my size and preferences. <br />
                              5. This website is for my graduation wishlist and is not connected to the external website you are redirected to. <br />
                              6. Please ensure the selected gift details matches the external website and also account for delivery before selecting date. <br />
                              7. If you want to chamge the date, please cancel the gift on the selected gift page and select a new date. <br />
                            </p>  
                          </div>
                          <div className="flex justify-center gap-4 mt-4">
                            <button
                              onClick={() => {
                                setShowModal(false);
                                setRedirectLink(null);
                                setPendingGiftId(null);
                                setDate(""); 
                              }}
                              className="bg-gray-200 text-black px-4 py-2 rounded hover:bg-gray-300 transition"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleConfirmGift}
                              className={`px-4 py-2 rounded text-white transition ${
                                date ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
                              }`}
                              disabled={!date}
                            >
                              Go to Link
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
 
{showWelcome && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center max-w-sm  max-h-[20rem] px-2 z-50 m-auto rounded-2xl">
                        <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full text-center space-y-4">
                          <h2 className="text-xl font-semibold">🔥🔥 Welcome 🔥🔥 </h2>
                          <div className="text-sm text-gray-700">
                            <p className="text-gray-500">

                              1. I am so excited to share this special moment with you.
                              <br />
                              2. This website is a wishlist for my graduation gifts.
                              <br />
                              3. Please feel free to select any gift you like.
                              <br />
                              4. If you don't find anything you like, please feel free to donate any amount you like.
                              <br />
                              5. Any Questions or concerns, please feel free to reach out to me.
                              </p>
                             
                          </div>
                          <div className="flex justify-center gap-4 mt-4">
                            <button
                              onClick={() => {
                               setShowWelcome(false); 
                              }}
                              className="bg-gray-200 text-black px-4 py-2 rounded hover:bg-gray-300 transition border-2 border-black"
                            >
                              ❤️Thank you❤️
                            </button>
                            
                          </div>
                        </div>
                      </div>
                    )}

        {/* Footer */}
        <footer className="w-full text-gray-600 text-center py-4 mt-8 text-xs md:text-sm">
          Contact: tshivhulafhulufhelo@gmail.com | Phone: +27 67 015 1989
        </footer>
      </div>
    </div>
  );
};

export default DashboardPage;
