import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import "react-native-reanimated";

import { Animated, ImageURISource, View, StyleSheet } from "react-native";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AnimatedSplashScreen image={require("../assets/images/shoes.png")}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </AnimatedSplashScreen>
  );

  function AnimatedSplashScreen({
    children,
    image,
  }: {
    children: ReactNode;
    image: Animated.WithAnimatedObject<ImageURISource>;
  }) {
    const animation = useMemo(() => new Animated.Value(1), []);
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [isSplashAnimationComplete, setAnimationComplete] = useState(false);
    const [isFontLoaded] = useFonts({
      SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    });

    useEffect(() => {
      if (isImageLoaded && isFontLoaded) {
        Animated.timing(animation, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
          delay: 500,
        }).start(() => setAnimationComplete(true));
      }
    }, [isImageLoaded, isFontLoaded]);

    const onImageLoaded = useCallback(async () => {
      try {
        await SplashScreen.hideAsync();
        // Load stuff
        await Promise.all([]);
      } catch (e) {
        // handle errors
      } finally {
        setIsImageLoaded(true);
      }
    }, []);

    return (
      <View style={{ flex: 1 }}>
        {isImageLoaded && isFontLoaded && children}
        {!isSplashAnimationComplete && (
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              {
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "white",
                opacity: animation,
              },
            ]}
          >
            <Animated.Image
              style={{
                width: "50%",
                height: "50%",
                resizeMode: "contain",
              }}
              source={image}
              onLoadEnd={onImageLoaded}
              fadeDuration={0}
            />
          </Animated.View>
        )}
      </View>
    );
  }
}
