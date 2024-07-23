import React, { useState } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import Mapbox from "@rnmapbox/maps";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { Canvas, Path, Paint } from "@shopify/react-native-skia";

Mapbox.setAccessToken(
  "pk.eyJ1IjoiZGFuaWxvbWlndWVsMTQ4NSIsImEiOiJjbGZwYzg2ZzQwdW0yM3FwdG91Z3BoZXVtIn0.FOkbq1V7d5cjKTXgyTQVuQ"
);

const App = () => {
  const [paths, setPaths] = useState([]);
  const { width, height } = Dimensions.get("window");

  const handlePanStart = (gesture) => {
    const { x, y } = gesture;
    const newPaths = [
      ...paths,
      {
        segments: [`M ${x} ${y}`],
        color: "#FAAF32",
      },
    ];
    setPaths(newPaths);
  };

  const handlePanUpdate = (gesture) => {
    const { x, y } = gesture;
    if (paths.length > 0) {
      const updatedPaths = [...paths];
      const lastIndex = updatedPaths.length - 1;
      updatedPaths[lastIndex].segments.push(`L ${x} ${y}`);
      setPaths(updatedPaths);
    }
  };

  const panGestureHandler = Gesture.Pan()
    .onStart(handlePanStart)
    .onUpdate(handlePanUpdate)
    .minDistance(1);

  const paint = new Paint();
  paint.setColor("#FAAF3280");

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={panGestureHandler}>
        <View style={{ flex: 1, backgroundColor: "black" }}>
          <Canvas style={{ flex: 1 }}>
            {paths.map((p, index) => (
              <Path
                key={index}
                path={p.segments.join(" ")}
                strokeWidth={5}
                style="stroke"
                color={p.color}
                paint={paint}
              />
            ))}
            <View style={[styles.page, { width, height }]}>
              <Mapbox.MapView style={styles.map} />
            </View>
          </Canvas>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

export default App;

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },

  map: {
    flex: 1,
  },
});
