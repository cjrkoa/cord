import { Image } from "react-native";
import { Tabs, Redirect } from "expo-router";

import { useSession } from "../../ctx";

import React from "react";

import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function AppLayout() {
  const { session, isLoading } = useSession();
  const colorScheme = useColorScheme();

  // You can keep the splash screen open, or render a loading screen like we do here.
  if (isLoading) {
    return <Image source={require("@/assets/images/eccia-loading.png")} />;
  }

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!session) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href="/unauthorized" />;
  }

  // This layout can be deferred because it's not the root layout.
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "dark"].tabIconSelected,
        tabBarInactiveTintColor: Colors[colorScheme ?? "dark"].tabIconDefault,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? "dark"].tabBarBackground,
          height: "9%",
          paddingTop: 4,
          paddingBottom: 4,
          borderTopWidth: 0,
        },
        headerShown: false,
      }}
    >
      {
        <Tabs.Screen
          name="audiorecorder"
          options={{
            title: "Record",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "mic-sharp" : "mic-outline"}
                color={color}
              />
            ),
          }}
        />
      }
      <Tabs.Screen
        name="index"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "chatbox" : "chatbox-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "settings" : "settings-outline"}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
