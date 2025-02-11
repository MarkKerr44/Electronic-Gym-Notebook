import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MediapipeCamera, RunningMode, usePoseDetection, KnownPoseLandmarkConnections, Delegate } from 'react-native-mediapipe';
import { useCameraPermission } from 'react-native-vision-camera';
import { useSharedValue } from 'react-native-reanimated';
import { vec, Canvas, Points } from '@shopify/react-native-skia';

export default function OpeningScreen() {
  const camPerm = useCameraPermission();
  const [permsGranted, setPermsGranted] = useState(camPerm.hasPermission);
  const askForPermissions = useCallback(() => {
    if (camPerm.hasPermission) {
      setPermsGranted(true);
    } else {
      camPerm.requestPermission().then(granted => setPermsGranted(granted));
    }
  }, [camPerm]);

  const [active, setActive] = useState("back");
  const switchCamera = () => {
    setActive(current => current === "back" ? "front" : "back");
  };

  const connections = useSharedValue([]);

  const onResults = useCallback((results, viewCoordinator) => {
    console.log("onResults called with:", results);
    if (!results || !results.results || results.results.length === 0) {
      console.log("No results returned in onResults callback");
      return;
    }
    const frameDims = viewCoordinator.getFrameDims(results);
    const landmarksArray = results.results[0].landmarks;
    if (!landmarksArray || landmarksArray.length === 0) {
      console.log("No landmarks array present");
    }
    const pts = (landmarksArray && landmarksArray[0]) || [];
    console.log("Detected landmarks count:", pts.length);
    const newPoints = [];
    if (pts.length > 0) {
      for (const connection of KnownPoseLandmarkConnections) {
        const [a, b] = connection;
        if (pts[a] && pts[b]) {
          const pt1 = viewCoordinator.convertPoint(frameDims, pts[a]);
          const pt2 = viewCoordinator.convertPoint(frameDims, pts[b]);
          newPoints.push(vec(pt1.x, pt1.y), vec(pt2.x, pt2.y));
        }
      }
    }
    console.log("Computed points count:", newPoints.length);
    connections.value = newPoints;
  }, [connections]);

  const onError = useCallback((error) => {
    console.error("Pose detection error:", error);
  }, []);

  const poseDetection = usePoseDetection(
    { onResults, onError },
    RunningMode.LIVE_STREAM,
    "pose_landmarker_lite.task",
    { fpsMode: 30, delegate: Delegate.CPU }
  );

  useEffect(() => {
    console.log("Pose detection instance created:", poseDetection);
  }, [poseDetection]);

  if (!permsGranted) {
    return (
      <View style={styles.container}>
        <Text style={styles.infoText}>Camera permission is required.</Text>
        <Pressable style={styles.button} onPress={askForPermissions}>
          <Text style={styles.buttonText}>Allow Permission</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MediapipeCamera
        style={styles.camera}
        solution={poseDetection}
        activeCamera={active}
        resizeMode="cover"
      />
      <Canvas style={styles.camera}>
        <Points points={connections} mode="lines" color="lightblue" strokeWidth={3} />
        <Points points={connections} mode="points" color="red" strokeWidth={10} strokeCap="round" />
      </Canvas>
      <Pressable style={styles.switchButton} onPress={switchCamera}>
        <Text style={styles.switchButtonText}>Switch Camera</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { ...StyleSheet.absoluteFillObject },
  infoText: { fontSize: 16, textAlign: 'center', marginTop: 50 },
  button: { alignSelf: 'center', backgroundColor: '#F95F48', padding: 10, borderRadius: 5, marginTop: 20 },
  buttonText: { color: 'white' },
  switchButton: { position: 'absolute', top: 40, right: 20, backgroundColor: '#F95F48', padding: 10, borderRadius: 20 },
  switchButtonText: { color: 'white', fontSize: 16 }
});
