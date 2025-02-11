// CameraStream.tsx

import * as React from "react";
import { Pressable, StyleSheet, Text, View, Modal } from "react-native";
import {
  MediapipeCamera,
  RunningMode,
  usePoseDetection,
  KnownPoseLandmarkConnections,
  type DetectionError,
  type PoseDetectionResultBundle,
  type ViewCoordinator,
} from "react-native-mediapipe";
import {
  useCameraPermission,
  type CameraPosition,
} from "react-native-vision-camera";
import type { RootTabParamList } from "./navigation";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { useSettings } from "./app-settings";
import { PoseDrawFrame } from "./Drawing";
import { useSharedValue } from "react-native-reanimated";
import { vec, type SkPoint } from "@shopify/react-native-skia";

type Props = BottomTabScreenProps<RootTabParamList, "CameraStream">;

interface Landmark {
  x: number;
  y: number;
  z: number;
}

function invertY(point: Landmark): Landmark {
  return {
    x: point.x,
    y: 1 - point.y,
    z: point.z,
  };
}

function calculateAngle(a: Landmark, b: Landmark, c: Landmark): number {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const magAb = Math.sqrt(ab.x ** 2 + ab.y ** 2);
  const magCb = Math.sqrt(cb.x ** 2 + cb.y ** 2);
  if (magAb === 0 || magCb === 0) return 0;
  let angle = Math.acos(dot / (magAb * magCb));
  if (isNaN(angle)) angle = 0;
  return (angle * 180) / Math.PI;
}

function isPoseValid(landmarks: Landmark[]): boolean {
  const r = [11, 12, 23, 24, 25, 26, 27, 28];
  return r.every((i) => landmarks[i] !== undefined);
}

function getSquatFeedback(pts: Landmark[]): string[] {
  const lh = invertY(pts[23]);
  const ls = invertY(pts[11]);
  const lk = invertY(pts[25]);
  const la = invertY(pts[27]);
  const rh = invertY(pts[24]);
  const rs = invertY(pts[12]);
  const rk = invertY(pts[26]);
  const ra = invertY(pts[28]);
  const le = invertY(pts[7]);
  const re = invertY(pts[8]);
  const leftKneeAngle = calculateAngle(lh, lk, la);
  const rightKneeAngle = calculateAngle(rh, rk, ra);
  const fullDepth = leftKneeAngle < 120 && rightKneeAngle < 120;
  function kneeOverToe(hip: Landmark, knee: Landmark, ankle: Landmark) {
    return (knee.x - hip.x) * (ankle.x - hip.x) > 0;
  }
  const kneesOut = kneeOverToe(lh, lk, la) && kneeOverToe(rh, rk, ra);
  const leftTorsoAngle = calculateAngle(le, ls, lh);
  const rightTorsoAngle = calculateAngle(re, rs, rh);
  const avgTorsoAngle = (leftTorsoAngle + rightTorsoAngle) / 2;
  const backUpright = avgTorsoAngle >= 140;
  const feedback: string[] = [];
  if (!fullDepth) feedback.push("Go deeper");
  if (!kneesOut) feedback.push("Push knees out more");
  if (!backUpright) feedback.push("Keep your back upright");
  return feedback;
}

enum SquatState {
  Standing,
  Squatting,
}

export const CameraStream: React.FC<Props> = () => {
  const { settings } = useSettings();
  const camPerm = useCameraPermission();
  const [permsGranted, setPermsGranted] = React.useState({ cam: camPerm.hasPermission });
  const askForPermissions = React.useCallback(() => {
    if (camPerm.hasPermission) {
      setPermsGranted((prev) => ({ ...prev, cam: true }));
    } else {
      camPerm.requestPermission().then((granted) => {
        setPermsGranted((prev) => ({ ...prev, cam: granted }));
      });
    }
  }, [camPerm]);
  const [active, setActive] = React.useState<CameraPosition>("front");
  const setActiveCamera = () => {
    setActive((currentCamera) => (currentCamera === "front" ? "back" : "front"));
  };
  const connections = useSharedValue<SkPoint[]>([]);
  const [squatFeedback, setSquatFeedback] = React.useState("Detecting Pose...");
  const [correctSquatCount, setCorrectSquatCount] = React.useState(0);
  const [badSquatCount, setBadSquatCount] = React.useState(0);
  const lastSquatCheckRef = React.useRef<number>(0);
  const SQUAT_CHECK_INTERVAL = 1000;
  const squatStateRef = React.useRef<SquatState>(SquatState.Standing);
  const [showModal, setShowModal] = React.useState(true);
  const [countdown, setCountdown] = React.useState(0);

  const handleModalOk = () => {
    setShowModal(false);
    setCountdown(5);
  };

  React.useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  const onResults = React.useCallback(
    (results: PoseDetectionResultBundle, vc: ViewCoordinator) => {
      if (showModal || countdown > 0) return;
      const now = Date.now();
      if (now - lastSquatCheckRef.current < SQUAT_CHECK_INTERVAL) {
        const fd = vc.getFrameDims(results);
        const pts = results.results[0].landmarks[0] ?? [];
        const newLines: SkPoint[] = [];
        if (pts.length > 0) {
          for (const connection of KnownPoseLandmarkConnections) {
            const [a, b] = connection;
            const p1 = vc.convertPoint(fd, pts[a]);
            const p2 = vc.convertPoint(fd, pts[b]);
            newLines.push(vec(p1.x, p1.y));
            newLines.push(vec(p2.x, p2.y));
          }
        }
        connections.value = newLines;
        return;
      }
      lastSquatCheckRef.current = now;
      const fd = vc.getFrameDims(results);
      const pts = results.results[0].landmarks[0] ?? [];
      const newLines: SkPoint[] = [];
      if (pts.length === 0) {
        setSquatFeedback("Detecting Pose...");
      } else {
        for (const connection of KnownPoseLandmarkConnections) {
          const [a, b] = connection;
          const p1 = vc.convertPoint(fd, pts[a]);
          const p2 = vc.convertPoint(fd, pts[b]);
          newLines.push(vec(p1.x, p1.y));
          newLines.push(vec(p2.x, p2.y));
        }
        if (isPoseValid(pts)) {
          const lh = invertY(pts[23]);
          const lk = invertY(pts[25]);
          const la = invertY(pts[27]);
          const rh = invertY(pts[24]);
          const rk = invertY(pts[26]);
          const ra = invertY(pts[28]);
          const leftKneeAngle = calculateAngle(lh, lk, la);
          const rightKneeAngle = calculateAngle(rh, rk, ra);
          let nextState = squatStateRef.current;
          if (leftKneeAngle < 140 && rightKneeAngle < 140) {
            nextState = SquatState.Squatting;
          } else {
            nextState = SquatState.Standing;
          }
          if (nextState !== squatStateRef.current) {
            if (nextState === SquatState.Squatting) {
              const feedback = getSquatFeedback(pts);
              if (feedback.length === 0) {
                setCorrectSquatCount((prev) => prev + 1);
                setSquatFeedback("Good Squat!");
              } else {
                console.log("Bad Squat Feedback:", feedback.join("; "));
                setBadSquatCount((prev) => prev + 1);
                setSquatFeedback("Bad Squat!");
              }
            } else {
              setSquatFeedback("Standing");
            }
            squatStateRef.current = nextState;
          }
        } else {
          setSquatFeedback("Detecting Pose...");
        }
      }
      connections.value = newLines;
    },
    [connections, showModal, countdown]
  );

  const onError = React.useCallback((error: DetectionError) => {}, []);
  const poseDetection = usePoseDetection(
    {
      onResults: onResults,
      onError: onError,
    },
    RunningMode.LIVE_STREAM,
    `${settings.model}.task`,
    {
      fpsMode: "none",
    }
  );

  if (permsGranted.cam) {
    return (
      <View style={styles.container}>
        <Modal transparent visible={showModal}>
          <View style={styles.modalContainer}>
            <View style={styles.modalInner}>
              <Text style={styles.modalTitle}>Get Ready</Text>
              <Text style={styles.modalText}>
                Make sure your whole body is visible in the camera. No one else should be in the frame. Stand in a safe area with room to squat.
              </Text>
              <Pressable style={styles.okButton} onPress={handleModalOk}>
                <Text style={styles.okText}>OK</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
        {countdown > 0 && (
          <View style={styles.countdownContainer}>
            <Text style={styles.countdownText}>{countdown}</Text>
          </View>
        )}
        <MediapipeCamera
          style={styles.box}
          solution={poseDetection}
          activeCamera={active}
          resizeMode="cover"
        />
        <PoseDrawFrame connections={connections} style={styles.box} />
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackText}>{squatFeedback}</Text>
        </View>
        <View style={styles.countsContainer}>
          <View style={styles.countBox}>
            <Text style={styles.countLabel}>Good Squats</Text>
            <Text style={styles.countNumber}>{correctSquatCount}</Text>
          </View>
          <View style={styles.countBox}>
            <Text style={styles.countLabel}>Bad Squats</Text>
            <Text style={styles.countNumber}>{badSquatCount}</Text>
          </View>
        </View>
        <Pressable style={styles.cameraSwitchButton} onPress={setActiveCamera}>
          <Text style={styles.cameraSwitchButtonText}>Switch Camera</Text>
        </Pressable>
      </View>
    );
  } else {
    return <NeedPermissions askForPermissions={askForPermissions} />;
  }
};

const NeedPermissions: React.FC<{ askForPermissions: () => void }> = ({ askForPermissions }) => {
  return (
    <View style={styles.container}>
      <View style={styles.permissionsBox}>
        <Text style={styles.noPermsText}>Allow App to use your Camera and Microphone</Text>
        <Text style={styles.permsInfoText}>
          App needs access to your camera in order for Object Detection to work.
        </Text>
      </View>
      <Pressable style={styles.permsButton} onPress={askForPermissions}>
        <Text style={styles.permsButtonText}>Allow</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF0F0",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  box: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  permsButton: {
    padding: 15.5,
    paddingRight: 25,
    paddingLeft: 25,
    backgroundColor: "#F95F48",
    borderRadius: 5,
    margin: 15,
  },
  permsButtonText: {
    fontSize: 17,
    color: "black",
    fontWeight: "bold",
  },
  permissionsBox: {
    backgroundColor: "#F3F3F3",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CCCACA",
    marginBottom: 20,
  },
  noPermsText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
  },
  permsInfoText: {
    fontSize: 15,
    color: "black",
    marginTop: 12,
  },
  cameraSwitchButton: {
    position: "absolute",
    padding: 10,
    backgroundColor: "#F95F48",
    borderRadius: 20,
    top: 20,
    right: 20,
  },
  cameraSwitchButtonText: {
    color: "white",
    fontSize: 16,
  },
  feedbackContainer: {
    position: "absolute",
    bottom: 150,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  feedbackText: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  countsContainer: {
    position: "absolute",
    top: 20,
    left: 20,
    flexDirection: "column",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 8,
  },
  countBox: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  countLabel: {
    color: "white",
    fontSize: 16,
    marginRight: 10,
  },
  countNumber: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalInner: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "black",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "black",
  },
  okButton: {
    backgroundColor: "#F95F48",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  okText: {
    color: "#fff",
    fontSize: 16,
  },
  countdownContainer: {
    position: "absolute",
    top: 100,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 20,
    borderRadius: 20,
    zIndex: 999,
  },
  countdownText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },
});
