import { View, Text, ImageBackground, Pressable } from "react-native";
import React, { useEffect, useState, useContext } from "react";
import MEDITATION_IMAGES from "@/constants/meditation-images";
import { router, useLocalSearchParams } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import AppGradient from "@/components/AppGradient";
import CustomButton from "@/components/CustomButton";
import { Audio } from "expo-av";
import { MEDITATION_DATA, AUDIO_FILES } from "@/constants/MeditationData";
import { TimerContext } from "@/context/TimerContext";

const Meditate = () => {
  const { id } = useLocalSearchParams();
  //const [duration, setduration] = useState(10);
  const { duration, setDuration } = useContext(TimerContext);
  console.log("Duration: " + duration);
  const [isMeditating, setMeditating] = useState(false);
  const [isPlayingAudio, setPlayingAudio] = useState(false);
  const [audioSound, setSound] = useState<Audio.Sound>();

  useEffect(() => {
    let timerId: NodeJS.Timeout;
    // Exit
    if (duration === 0) {
      setMeditating(false);
      return;
    }

    if (isMeditating) {
      timerId = setTimeout(() => {
        setDuration(duration - 1);
      }, 1000);
    }

    return () => {
      clearTimeout(timerId);
    };
  }, [duration, isMeditating]); //whernever duration  changes

  useEffect(() => {
    return () => {
      if (!isMeditating) {
        setDuration(10);
      }
      audioSound?.unloadAsync();
    };
  }, [duration, isMeditating]);

  const toggleMeditationSessionStatus = async () => {
    if (duration === 0) {
      setDuration(10);
    }
    setMeditating(!isMeditating);

    //await toggleSound();
  };

  const initializeSound = async () => {
    console.log("initializing sound");
    const audioFileName = MEDITATION_DATA[Number(id) - 1].audio;
    console.log(MEDITATION_DATA[Number(id) - 1].title);
    const { sound } = await Audio.Sound.createAsync(AUDIO_FILES[audioFileName]);
    setSound(sound);
    console.log("got sound");
    return sound;
  };

  const toggleSound = async () => {
    const sound = audioSound ? audioSound : await initializeSound();
    const status = await sound?.getStatusAsync();

    if (status?.isLoaded && !isPlayingAudio) {
      await sound.playAsync();
      setPlayingAudio(true);
    } else {
      console.log("Loaded status " + status?.isLoaded);
      await sound.pauseAsync();
      setPlayingAudio(false);
    }
  };

  // format time left to ensure two digits
  const formattedTimeMinutes = String(Math.floor(duration / 60)).padStart(
    2,
    "0"
  );

  const formattedTimeSeconds = String(duration % 60).padStart(2, "0");

  const handleAdjustDuration = () => {
    if (isMeditating) toggleMeditationSessionStatus();
    router.push("/(modal)/adjust-meditation-duration");
  };

  return (
    <View className="flex-1">
      <ImageBackground
        source={MEDITATION_IMAGES[Number(id) - 1]}
        resizeMode="cover"
        className="flex-1"
      >
        <AppGradient colors={["transparent", "rgba(0, 0, 0, 0.8)"]}>
          <Pressable
            onPress={() => router.back()}
            className="absolute top-16 left-6 z-10"
          >
            <AntDesign name="leftcircleo" size={50} color="white" />
          </Pressable>

          <View className="flex-1 justify-center">
            <View className="mx-auto bg-neutral-200 rounded-full w-44 h-44 justify-center items-center">
              <Text className="text-blue-800 text-4xl font-rmono">
                {formattedTimeMinutes}:{formattedTimeSeconds}
              </Text>
            </View>
          </View>

          <View className="mb-5">
            <CustomButton
              title="Adjust Duration"
              containerStyles="mt-4"
              onPress={handleAdjustDuration}
            />
            <CustomButton
              title={isMeditating ? "Stop" : "Start Meditation"}
              onPress={toggleMeditationSessionStatus}
            />
          </View>
        </AppGradient>
      </ImageBackground>
    </View>
  );
};

export default Meditate;
