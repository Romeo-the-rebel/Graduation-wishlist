import { Account, Client, Databases, ID, Query, Storage } from "appwrite";
import type { Models } from 'appwrite'; 


export const config = {
    endpoint: 'https://fra.cloud.appwrite.io/v1',
    projectId: '68095cf0003cb28f3a6d',
    databaseId: '680960190011f849b1ed',
    usersCollection: '680960500032ecdf2fb6',
    bucketId: '68098ae3002784ce9cc4', 
    giftsCollection: '680a521b0016cef0372c',
    selectedGiftsCollection: '68168fcc002ce9a022e0',

};

const {
    endpoint,
    projectId,
    databaseId,
    usersCollection,
    giftsCollection,
    bucketId,
    selectedGiftsCollection,
} = config;

const client = new Client();

client
    .setEndpoint(endpoint)
    .setProject(projectId);

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);




//  1. Get currently authenticated user (basic Appwrite info)
const getCurrentUser = async (): Promise<Models.User<Models.Preferences> | null> => {
    try {
        return await account.get();
    } catch {
        return null;
    }
};

//  2. Fetch full profile from your users collection (custom data)
const getUserProfile = async (userId: string) => {
    try {
        const userDoc = await databases.getDocument(databaseId, usersCollection, userId);
        return userDoc;
    } catch (error) {
        console.error("User profile not found:", error);
        return null;
    }
};

// 3. Upload profile picture to Appwrite storage
const uploadProfilePicture = async (file: File): Promise<string | null> => {
    try {
        const response = await storage.createFile(bucketId, ID.unique(), file);
        return response.$id; 
    } catch (error) {
        console.error("Failed to upload profile picture:", error);
        return null;
    }
};




// 4. Create profile in database after login
const createUserProfile = async (user: {
    username: string;
    email: string;
    password: string;
    phone: string;
    profilepicture: string;
  }) => {
    try {
      
      const newAccount = await account.create(
        ID.unique(),
        user.email,
        user.password,
        user.username
      );
  
      
      const profile = await databases.createDocument(
        databaseId,
        usersCollection,
        newAccount.$id, 
        {
          username: user.username,
          email: user.email,
          phone: user.phone,
          profilepicture: user.profilepicture,
          password:user.password,
        }
      );
      return profile;
    } catch (error) {
      console.error('Failed to create user account/profile:', error);
      return null;
    }
  };
  
// 5. function to fetch all selected gifts by userid
export const getSelectedGiftsByUserId = async (userId: string) => {
    try {
        const response = await databases.listDocuments(databaseId, selectedGiftsCollection, [
            Query.equal('userID', userId),
        ]);
        return response.documents;
    } catch (error) {
        console.error('Error fetching selected gifts:', error);
        throw new Error('Unable to fetch selected gifts');
    }
};
//6. delete selected gift by id
export const deleteSelectedGiftById = async (selectedGiftId: string) => {
    try {
        await databases.deleteDocument(databaseId, selectedGiftsCollection, selectedGiftId);
    } catch (error) {
        console.error('Error deleting selected gift:', error);
        throw new Error('Unable to delete selected gift');
    }
};

//7. function that makes a gift available again
export const makeAvailable = async (giftId: string) => {
    try {
        const updatedGift = await databases.updateDocument(
            databaseId,
            giftsCollection,
            giftId,
            { available: true }
        );
        return updatedGift;
    } catch (error) {
        console.error('Error updating gift availability:', error);
        throw new Error('Unable to update gift availability');
    }
};
//8. get gift details by id
export const getGiftDetailsById = async (giftId: string) => {
    try {
        const giftDetails = await databases.getDocument(databaseId, giftsCollection, giftId);
        return giftDetails;
    } catch (error) {
        console.error('Error fetching gift details:', error);
        throw new Error('Unable to fetch gift details');
    }
};
//9. function to get all selected gifts 
export const getAllSelectedGifts = async () => {
    try {
        const response = await databases.listDocuments(databaseId, selectedGiftsCollection);
        return response.documents;
    } catch (error) {
        console.error('Error fetching all selected gifts:', error);
        throw new Error('Unable to fetch all selected gifts');
    }
};

//10. function to create selected gifts
export const createSelectedGift = async (userId: string, giftId: string, date:string) => {
    try {
        const newDocument = await databases.createDocument(
            databaseId,
            selectedGiftsCollection,
            ID.unique(),
            {
                userID: userId,
                productID: giftId,
                date: date,
            }
        );
        return newDocument;
    } catch (error) {
        console.error('Error creating selected gift:', error);
        throw new Error('Unable to create selected gift');
    }
};
//11. Function to log out
export async function logout() {
  try {
    await account.deleteSession('current');
  } catch (error) {
    console.error('Failed to logout:', error);
  }
}

  import { AppwriteException } from 'appwrite';

 const login = async (email: string, password: string) => {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (error: any) {
    if (error instanceof AppwriteException) {
      console.error('Appwrite error:', error.message);
      throw new Error(error.message); 
    } else {
      console.error('Unknown error:', error);
      throw new Error('An unknown error occurred');
    }
  }
};
//12. function to make gift available
export const makeUnavailable=async (giftId: string) => {
  try {
    const updatedGift = await databases.updateDocument(
      databaseId,
      giftsCollection,
      giftId,
      { available: false }
    );
    return updatedGift;
  } catch (error) {
    console.error('Error updating gift availability:', error);
    throw new Error('Unable to update gift availability');
  }
}

export const getUserDetailsById = async (userId: string) => {
  try {
    const userDetails = await databases.getDocument(databaseId, usersCollection, userId);
    return userDetails; 
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw new Error('Unable to fetch user details');
  }
};
//13: function to get all the gifts
  const getGifts = async () => {
    try {
      const response = await databases.listDocuments(databaseId, giftsCollection);
      const gifts = response.documents.map((doc) => ({
        id: doc.$id,
        name: doc.name,
        price: doc.price,
        available: doc.available,
        link: doc.link,
        imageId: doc.image,
        type: doc.type,
      }));
  
      return gifts;
    } catch (error) {
      console.error('Failed to fetch gifts:', error);
      return [];
    }
  };
  
export {
    client,
    account,
    databases,
    storage,
    getCurrentUser,
    getUserProfile,
    uploadProfilePicture,
    createUserProfile,
    login,
    getGifts,
};
