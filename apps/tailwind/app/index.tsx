import React, { useEffect, useState } from "react";
import { Text, View, Pressable } from "react-native";

const textColors = [
  "text-red-500",
  "text-yellow-500",
  "text-pink-500",
  "text-blue-500",
  "text-green-500",
  "text-purple-500",
];

export default function Page() {
  let [textColor, setTextColor] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setTextColor(++textColor % textColors.length),
      1000
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <View className="p-4 flex-1 items-center">
      <View className="flex-1 max-w-4xl justify-center">
        <Pressable className="rounded-md bg-indigo-500 mt-6 animate-bounce self-start flex-column flex-shrink">
          <Text className="text-white p-4">Start the party 🎉</Text>
        </Pressable>
      </View>
    </View>
  );
}

// <Text
//   className={`${textColors[textColor]} transition-colors duration-1000 text-6xl font-bold`}
// >
//   Hello World
// </Text>
// <Text className="text-slate-700 text-4xl">
//   This is the first page of your app.
// </Text>
