import { Slot } from "expo-router";
import { SessionProvider } from "../ctx";
import {
  getTrackingStatus,
  requestTrackingPermission,
} from "react-native-tracking-transparency";
import { useEffect } from "react";
import { Platform } from "react-native";

export default function Root() {
  // Set up the auth context and render our layout inside of it.

  const requestATT = async () => {
    const status = await getTrackingStatus();

    if (status === "not-determined") {
      const newStatus = await requestTrackingPermission();
      console.log("ATT status:", newStatus);
    } else {
      console.log("Existing ATT status:", status);
    }
  };

  useEffect(() => {
    try {
      if (Platform.OS === "ios") {
        requestATT();
      }
    } catch (e) {
      console.error("ATT permission error:", e);
    }
  }, []);

  return (
    <SessionProvider>
      <Slot />
    </SessionProvider>
  );
}
