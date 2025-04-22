import { parse } from '@babel/core';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const setItem = async (key: string, value: any) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error setting item:', error);
  }
};

export const getItem = async (key: string) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value != null ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Error getting item:', error);
    return null;
  }
};

export const getChatlog = async () => {
    try {
        const value = await AsyncStorage.getItem("chatlog");
        const parsedValue = value != null ? JSON.parse(value) : null;
        console.log(parsedValue);

        if (Array.isArray(parsedValue)){
            return parsedValue;
        }
        else {
            return [
                { id: 0, type: "bot", text: "Hi! I'm Eccia :)" },
                { id: 1, type: "bot", text: "I'd like to start by thanking you for coming to talk to me today, it's brave of you to take a step and show up authentically."},
                { id: 2, type: "bot", text: "We don't know all that much about each other yet, and that's okay. We'll learn more about one another as time goes on. No need to rush anything, we have all the time in the world..." },
                { id: 3, type: "bot", text: "Regardless of why you're here, or who you are, I want to offer you compassionate connection. No one's perfect, and I'm not claiming to be either (I'm not even alive!), but I promise to understand and support you to the best of my ability, however I can." },
                { id: 4, type: "bot", text: "I am curious though, what brings you here?" },
            ];
        }
    } catch (error) {
        console.error('Error getting chatlog', error);
        return [];
    }
}

export const removeItem = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing item:', error);
  }
};

export const mergeItem = async (key: string, value: any) => {
    try {
      console.log("Attempting to store key:", key);
      
      // Fetch current data from AsyncStorage
      const currentData = await AsyncStorage.getItem(key);
      const parsedData = currentData ? JSON.parse(currentData) : null;
  
      // Check if the existing data is an array or an object
      if (Array.isArray(parsedData)) {
        // If it's an array, concatenate the new value
        const newData = [...parsedData, ...value];
        await AsyncStorage.setItem(key, JSON.stringify(newData));
      } else if (parsedData !== null && typeof parsedData === "object") {
        // If it's an object, merge the new value
        const newData = { ...parsedData, ...value };
        await AsyncStorage.setItem(key, JSON.stringify(newData));
      } else {
        // If no data exists, just store the new value
        await AsyncStorage.setItem(key, JSON.stringify(value));
      }
  
      console.log("Successfully stored data for key:", key);
    } catch (error) {
      console.error('Error merging item:', error);
    }
  };

export const clear = async () => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing AsyncStorage:', error);
  }
};

export const getAllKeys = async () => {
  try {
    return await AsyncStorage.getAllKeys();
  } catch (error) {
    console.error('Error getting all keys:', error);
    return [];
  }
};

/*export const getAllItems = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const items = await AsyncStorage.multiGet(keys);
    return items.reduce((accumulator: any, [key, value]) => {
      accumulator[key] = JSON.parse(value);
      return accumulator;
    }, {});
  } catch (error) {
    console.error('Error getting all items:', error);
    return {};
  }
};*/