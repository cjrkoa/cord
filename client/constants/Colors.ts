/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#595958';
const tintColorDark = "#fff"

export const Colors = {
  light: {
    text: '#11181C',
    background: '#e8e8e3',
    tint: tintColorLight,
    icon: '#9BA1A6',
    tabBarBackground: '#302a5c',
    tabIconDefault: '#ECEDEE',
    tabIconSelected: tintColorDark,
  },
  dark: {
    text: '#ECEDEE',
    background: "#100c17",
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabBarBackground:'#302a5c',
    tabIconDefault: '#ECEDEE',
    tabIconSelected: tintColorDark,
  },
};
