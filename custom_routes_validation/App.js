import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  Text,
} from "react-native";
import MapboxGL, * as maps from "@rnmapbox/maps";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { Canvas, Path, Paint, Skia } from "@shopify/react-native-skia";
import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";

MapboxGL.setAccessToken(
  "pk.eyJ1IjoiZGFuaWxvbWlndWVsMTQ4NSIsImEiOiJjbGZwYzg2ZzQwdW0yM3FwdG91Z3BoZXVtIn0.FOkbq1V7d5cjKTXgyTQVuQ"
);

const App = () => {
  const [paths, setPaths] = useState([]);
  const { width, height } = Dimensions.get("window");
  const [isDraw, setIsDraw] = useState(false);
  const [moveEvent, setMoveEvent] = useState(null);
  const [coordinates, setCoordinates] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const getLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 1000 },
        (location) => {
          setUserLocation([
            location.coords.longitude,
            location.coords.latitude,
          ]);
          if (mapRef.current) {
            mapRef.current.setCamera({
              centerCoordinate: [
                location.coords.longitude,
                location.coords.latitude,
              ],
              zoomLevel: 15, // Ajuste o nível de zoom conforme necessário
              animationDuration: 1000,
            });
          }
        }
      );
    };

    getLocation();
  }, []);

  const handleDraw = () => {
    setIsDraw(!isDraw);
  };

  const handlePanStart = async (gesture) => {
    if (isDraw) {
      const { x, y } = gesture;
      const pixelCoordinates = [x, y];
      console.log(`coords ${x} ${y}`);

      const geoCoordinates = await mapRef.current.getCoordinateFromView(
        pixelCoordinates
      );
      setCoordinates([geoCoordinates]);
      console.log("Geographic coordinates:", geoCoordinates);

      const newPaths = [
        ...paths,
        {
          segments: [`M ${x} ${y}`],
          color: "#FAAF3280",
        },
      ];
      setPaths(newPaths);
    }
  };

  const handlePanUpdate = async (gesture) => {
    if (isDraw) {
      const { x, y } = gesture;
      if (paths.length > 0) {
        const updatedPaths = [...paths];
        const lastIndex = updatedPaths.length - 1;
        updatedPaths[lastIndex].segments.push(`L ${x} ${y}`);
        setPaths(updatedPaths);

        const pixelCoordinates = [x, y];
        const geoCoordinates = await mapRef.current.getCoordinateFromView(
          pixelCoordinates
        );
        try {
          const geoCoordinates = await mapRef.current.getCoordinateFromView(
            pixelCoordinates
          );
          console.log("Geographic coordinates on update:", geoCoordinates);
          setCoordinates((prevCoords) => [...prevCoords, geoCoordinates]); // Adiciona novos pontos
        } catch (error) {
          console.error("Error converting coordinates:", error);
        }
      }
    }
  };

  const handleMapPress = async (event) => {
    if (!isDraw) return;

    const { coordinates: pixelCoordinates } = event;
    const geoCoordinates = await mapRef.current.getCoordinateFromView(
      pixelCoordinates
    );

    // Adiciona ponto de início se a lista estiver vazia
    if (coordinates.length === 0) {
      setCoordinates([geoCoordinates]);
    } else {
      // Atualiza o ponto final e adiciona a linha
      setCoordinates((prevCoords) => [...prevCoords, geoCoordinates]);
    }
  };

  console.log("Start Coordinate:", coordinates[0]);
  console.log("End Coordinate:", coordinates[coordinates.length - 1]);

  const panGestureHandler = Gesture.Pan()
    .onStart(handlePanStart)
    .onUpdate(handlePanUpdate)
    .minDistance(1);

  // Coordenadas de início e fim
  const startCoordinate = coordinates[0];
  const endCoordinate = coordinates[coordinates.length - 1];

  return (
    <>
      {isDraw && <Text style={styles.information}>Drawing Mode Active</Text>}
      <GestureHandlerRootView style={styles.page}>
        <View style={styles.container}>
          <MapboxGL.MapView
            ref={mapRef}
            styleURL={MapboxGL.StyleURL.Satellite}
            style={styles.map}
            onPress={handleMapPress}
          >
            <MapboxGL.Camera
              centerCoordinate={userLocation}
              zoomLevel={19}
              pitch={45}
              heading={0}
              animationMode={"flyTo"}
            />
            {coordinates.length > 1 && (
              <MapboxGL.ShapeSource
                id="lineSource"
                shape={{
                  type: "Feature",
                  geometry: {
                    type: "LineString",
                    coordinates: coordinates,
                  },
                }}
              >
                <MapboxGL.LineLayer
                  id="lineLayer"
                  style={{ lineColor: "black", lineWidth: 10 }}
                />
              </MapboxGL.ShapeSource>
            )}

            {startCoordinate && (
              <MapboxGL.PointAnnotation
                id="startPoint"
                coordinate={startCoordinate}
              >
                <View style={styles.markerContainer}>
                  <View style={styles.marker} />
                </View>
              </MapboxGL.PointAnnotation>
            )}

            {/* Marcador para o fim da rota */}
            {endCoordinate && (
              <MapboxGL.PointAnnotation
                id="endPoint"
                coordinate={endCoordinate}
              >
                <View style={styles.markerContainer}>
                  <View style={styles.marker} />
                </View>
              </MapboxGL.PointAnnotation>
            )}

            {userLocation && (
              <MapboxGL.PointAnnotation
                id="userLocation"
                coordinate={userLocation}
              >
                <View style={styles.userMarkerContainer}>
                  <View style={styles.userMarker} />
                </View>
              </MapboxGL.PointAnnotation>
            )}
          </MapboxGL.MapView>

          <Canvas style={styles.canvas}>
            {paths.map((p, index) => (
              <Path
                key={index}
                path={p.segments.join(" ")}
                strokeWidth={12}
                style="stroke"
                color={p.color}
              />
            ))}
          </Canvas>
          <GestureDetector gesture={panGestureHandler}>
            <View style={styles.touchableArea} />
          </GestureDetector>
        </View>
      </GestureHandlerRootView>
      <View style={styles.containerButton}>
        <TouchableOpacity style={styles.button} onPress={handleDraw}>
          <MaterialIcons
            name="route"
            size={24}
            color="#001D29"
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>
    </>
  );
};

export default App;

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },

  container: {
    flex: 1,
    position: "relative",
  },

  map: {
    flex: 1,
  },

  canvas: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },

  touchableArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },

  containerButton: {
    position: "absolute",
    bottom: 40,
    right: 40,
  },

  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    padding: 8,
    gap: 8,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.9,
    shadowOffset: {
      height: 10,
    },
  },

  information: {
    // position: "absolute",
    // top: 40,
    // right: 40,
    // marginTop: 12,
    // fontSize: 12,
  },

  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  marker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FAAF32",
    borderColor: "#FAAF32",
    borderWidth: 3,
  },

  userMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarker: {
    width: 31,
    height: 39,
    backgroundColor: '#55AFCBd',
  },
});
