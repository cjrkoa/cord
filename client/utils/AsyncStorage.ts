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

        if (Array.isArray(parsedValue)){
            return parsedValue;
        }

        return [
            { id: 0, type: "bot", text: "Hello! :)" },
            {
              id: 1,
              type: "bot",
              text: "I'm Cord, your emotional support chatbot.",
            },
            {
              id: 2,
              type: "bot",
              text: "How are you feeling today?",
            },
        ];
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