import React, { useState, useEffect, useCallback, useRef } from "react"
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  Animated,
  Easing
} from "react-native"
import LinearGradient from "react-native-linear-gradient"
import {
  MediapipeCamera,
  RunningMode,
  usePoseDetection,
  KnownPoseLandmarkConnections,
  type DetectionError,
  type PoseDetectionResultBundle,
  type ViewCoordinator
} from "react-native-mediapipe"
import {
  useCameraPermission,
  type CameraPosition
} from "react-native-vision-camera"
import Ionicons from "react-native-vector-icons/Ionicons"
import { PoseDrawFrame } from "./Drawing"
import { useSharedValue } from "react-native-reanimated"
import { vec, type SkPoint } from "@shopify/react-native-skia"

interface Landmark {
  x: number
  y: number
  z: number
}

function invertY(point: Landmark): Landmark {
  return { x: point.x, y: 1 - point.y, z: point.z }
}

function calculateAngle(a: Landmark, b: Landmark, c: Landmark): number {
  const ab = { x: a.x - b.x, y: a.y - b.y }
  const cb = { x: c.x - b.x, y: c.y - b.y }
  const dot = ab.x * cb.x + ab.y * cb.y
  const magAb = Math.sqrt(ab.x ** 2 + ab.y ** 2)
  const magCb = Math.sqrt(cb.x ** 2 + cb.y ** 2)
  if (magAb === 0 || magCb === 0) return 0
  let angle = Math.acos(dot / (magAb * magCb))
  if (isNaN(angle)) angle = 0
  return (angle * 180) / Math.PI
}

function isPoseValid(pts: Landmark[], idxs: number[]): boolean {
  return idxs.every((i) => pts[i] !== undefined)
}

function squatFeedback(pts: Landmark[]): string[] {
  const lh = invertY(pts[23]);
  const lk = invertY(pts[25]);
  const la = invertY(pts[27]);
  const rh = invertY(pts[24]);
  const rk = invertY(pts[26]);
  const ra = invertY(pts[28]);
  const le = invertY(pts[7]);
  const ls = invertY(pts[11]);
  const re = invertY(pts[8]);
  const rs = invertY(pts[12]);
  const leftKneeAngle = calculateAngle(lh, lk, la);
  const rightKneeAngle = calculateAngle(rh, rk, ra);
  
  const goodDepth = leftKneeAngle <= 100 && rightKneeAngle <= 100;
  const arr: string[] = [];
  if (!goodDepth) arr.push("Go deeper");

  const kneeOverToe = (hip: Landmark, knee: Landmark, ankle: Landmark) =>
    (knee.x - hip.x) * (ankle.x - hip.x) > 0;
  const kneesOut = kneeOverToe(lh, lk, la) && kneeOverToe(rh, rk, ra);
  if (!kneesOut) arr.push("Knees out more");

  const leftTorsoAngle = calculateAngle(le, ls, lh);
  const rightTorsoAngle = calculateAngle(re, rs, rh);
  const avgTorsoAngle = (leftTorsoAngle + rightTorsoAngle) / 2;
  const backUpright = avgTorsoAngle >= 140;
  if (!backUpright) arr.push("Back upright");
  
  return arr;
}

function bicepCurlFeedback(pts: Landmark[]): string[] {
  const lShoulder = invertY(pts[11]);
  const lElbow = invertY(pts[13]);
  const lWrist = invertY(pts[15]);
  const rShoulder = invertY(pts[12]);
  const rElbow = invertY(pts[14]);
  const rWrist = invertY(pts[16]);

  const leftAngle = calculateAngle(lShoulder, lElbow, lWrist);
  const rightAngle = calculateAngle(rShoulder, rElbow, rWrist);

  const feedback: string[] = [];

  if (leftAngle > 160 && rightAngle > 160) {
    feedback.push("Lower weight slowly");
  }
  if (leftAngle < 30 && rightAngle < 30) {
    feedback.push("Fully contracted");
  }

  const leftElbowDeviation = Math.abs(lShoulder.x - lElbow.x);
  const rightElbowDeviation = Math.abs(rShoulder.x - rElbow.x);
  const ELBOW_DEVIATION_THRESHOLD = 0.18; 
  if (leftElbowDeviation > ELBOW_DEVIATION_THRESHOLD || rightElbowDeviation > ELBOW_DEVIATION_THRESHOLD) {
    feedback.push("Keep elbow static");
  }

  return feedback;
}

function shoulderPressFeedback(pts: Landmark[]): string[] {
  const lShoulder = invertY(pts[11]);
  const lElbow = invertY(pts[13]);
  const lHip = invertY(pts[23]);
  const rShoulder = invertY(pts[12]);
  const rElbow = invertY(pts[14]);
  const rHip = invertY(pts[24]);

  const leftAngle = calculateAngle(lHip, lShoulder, lElbow);
  const rightAngle = calculateAngle(rHip, rShoulder, rElbow);

  const calcFlareAngle = (shoulder: Landmark, elbow: Landmark) => {
    const dx = elbow.x - shoulder.x;
    const dy = elbow.y - shoulder.y;
    const mag = Math.sqrt(dx * dx + dy * dy);
    if (mag === 0) return 0;
    const angle = Math.acos(dx / mag) * (180 / Math.PI);
    return Math.abs(angle); 
  };
  const leftDeviation = calcFlareAngle(lShoulder, lElbow);
  const rightDeviation = calcFlareAngle(rShoulder, rElbow);

  const feedback: string[] = [];

  if (leftAngle < 50 && rightAngle < 50) {
    feedback.push("Arms fully up");
  }

  if (leftAngle > 90 && rightAngle > 90) {
    feedback.push("Control weight down");
  }

  if (leftDeviation > 45 || rightDeviation > 45) {
    feedback.push("Keep elbows slightly forward");
  }

  return feedback;
}

enum ExerciseType {
  None = "none",
  Squats = "squats",
  BicepCurls = "curls",
  ShoulderPress = "press"
}

enum RepState {
  Start,
  Middle
}

export default function PoseEstimatorScreen() {
  const [exercise, setExercise] = useState<ExerciseType>(ExerciseType.None)
  const camPerm = useCameraPermission()
  const [permsGranted, setPermsGranted] = useState({ cam: camPerm.hasPermission })
  const askForPermissions = useCallback(() => {
    if (camPerm.hasPermission) {
      setPermsGranted((p) => ({ ...p, cam: true }))
    } else {
      camPerm.requestPermission().then((granted) => {
        setPermsGranted((p) => ({ ...p, cam: granted }))
      })
    }
  }, [camPerm])
  const [activeCam, setActiveCam] = useState<CameraPosition>("front")
  const [feedback, setFeedback] = useState("Choose Exercise")
  const [correctCount, setCorrectCount] = useState(0)
  const [badCount, setBadCount] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const repStateRef = useRef<RepState>(RepState.Start)
  const lastCheckRef = useRef<number>(0)
  const connections = useSharedValue<SkPoint[]>([])
  const fadeAnim1 = useRef(new Animated.Value(0)).current
  const fadeAnim2 = useRef(new Animated.Value(0)).current
  const fadeAnim3 = useRef(new Animated.Value(0)).current

  const handleModalOk = () => {
    setShowModal(false)
    setCountdown(5)
  }

  useEffect(() => {
    let t: NodeJS.Timeout | undefined
    if (countdown > 0) {
      t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    }
    return () => {
      if (t) clearTimeout(t)
    }
  }, [countdown])

  useEffect(() => {
    if (exercise === ExerciseType.None) {
      Animated.sequence([
        Animated.timing(fadeAnim1, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
          easing: Easing.ease
        }),
        Animated.timing(fadeAnim2, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
          easing: Easing.ease
        }),
        Animated.timing(fadeAnim3, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
          easing: Easing.ease
        })
      ]).start()
    } else {
      fadeAnim1.setValue(0)
      fadeAnim2.setValue(0)
      fadeAnim3.setValue(0)
    }
  }, [exercise, fadeAnim1, fadeAnim2, fadeAnim3])

  const switchCamera = () => {
    setActiveCam((p) => (p === "front" ? "back" : "front"))
  }

  const startNewExercise = (type: ExerciseType) => {
    setExercise(type)
    setShowModal(true)
    setFeedback("Detecting Pose...")
    setCorrectCount(0)
    setBadCount(0)
  }

  const squatBestPoseRef = useRef<Landmark[] | null>(null);

  const checkSquatRep = useCallback((pts: Landmark[]) => {
    const lh = invertY(pts[23]);
    const lk = invertY(pts[25]);
    const la = invertY(pts[27]);
    const rh = invertY(pts[24]);
    const rk = invertY(pts[26]);
    const ra = invertY(pts[28]);
    const lAngle = calculateAngle(lh, lk, la);
    const rAngle = calculateAngle(rh, rk, ra);
    let next = repStateRef.current;
    if (lAngle < 140 && rAngle < 140) {
      next = RepState.Middle;
      if (!squatBestPoseRef.current) {
        squatBestPoseRef.current = pts.slice();
      } else {
        const storedLH = invertY(squatBestPoseRef.current[23]);
        const storedLK = invertY(squatBestPoseRef.current[25]);
        const storedLA = invertY(squatBestPoseRef.current[27]);
        const storedRH = invertY(squatBestPoseRef.current[24]);
        const storedRK = invertY(squatBestPoseRef.current[26]);
        const storedRA = invertY(squatBestPoseRef.current[28]);
        const storedLAngle = calculateAngle(storedLH, storedLK, storedLA);
        const storedRAngle = calculateAngle(storedRH, storedRK, storedRA);
        if ((lAngle + rAngle) < (storedLAngle + storedRAngle)) {
          squatBestPoseRef.current = pts.slice();
        }
      }
    } else {
      if (repStateRef.current === RepState.Middle) {
        const evaluationPose = squatBestPoseRef.current || pts;
        const fb = squatFeedback(evaluationPose);
        const evalLH = invertY(evaluationPose[23]);
        const evalLK = invertY(evaluationPose[25]);
        const evalLA = invertY(evaluationPose[27]);
        const evalRH = invertY(evaluationPose[24]);
        const evalRK = invertY(evaluationPose[26]);
        const evalRA = invertY(evaluationPose[28]);
        const evalLeftAngle = calculateAngle(evalLH, evalLK, evalLA);
        const evalRightAngle = calculateAngle(evalRH, evalRK, evalRA);
        if (fb.length === 0) {
          if (evalLeftAngle < 50 || evalRightAngle < 50) {
            setFeedback("Not Deep Enough");
          } else if (evalLeftAngle <= 89 && evalRightAngle <= 89) {
            setCorrectCount((p) => p + 1);
            setFeedback("Good Squat!");
          } else if (evalLeftAngle <= 110 && evalRightAngle <= 110) {
            setCorrectCount((p) => p + 1);
            setFeedback("Great Squat!");
          } else if (evalLeftAngle > 110 || evalRightAngle > 110) {
            setFeedback("Deep Squat - Be careful!");
          }
        } else {
          setBadCount((p) => p + 1);
          setFeedback("Bad Squat! " + fb.join(", "));
        }
        squatBestPoseRef.current = null;
        setTimeout(() => {
          setFeedback("Detecting...");
        }, 2000);
      }
      next = RepState.Start;
    }
    repStateRef.current = next;
  }, []);


  const checkCurlRep = useCallback((pts: Landmark[]) => {
    const lShoulder = invertY(pts[11]);
    const lElbow = invertY(pts[13]);
    const lWrist = invertY(pts[15]);
    const rShoulder = invertY(pts[12]);
    const rElbow = invertY(pts[14]);
    const rWrist = invertY(pts[16]);
    const lAngle = calculateAngle(lShoulder, lElbow, lWrist);
    const rAngle = calculateAngle(rShoulder, rElbow, rWrist);
    let next = repStateRef.current;
    if (lAngle < 50 && rAngle < 50) {
      next = RepState.Middle;
    } else {
      if (repStateRef.current === RepState.Middle) {
        const fb = bicepCurlFeedback(pts);
        if (fb.length <= 1) {
          setCorrectCount((p) => p + 1);
          setFeedback("Good Curl!");
        } else {
          setBadCount((p) => p + 1);
          setFeedback("Bad Curl! " + fb.join(", "));
        }
      }
      setTimeout(() => {
        setFeedback("Detecting...");
      }
      , 2000);
      next = RepState.Start;
    }
    repStateRef.current = next;
  }, []);
  const checkPressRep = useCallback((pts: Landmark[]) => {
    const lShoulder = invertY(pts[11])
    const lElbow = invertY(pts[13])
    const lHip = invertY(pts[23])
    const rShoulder = invertY(pts[12])
    const rElbow = invertY(pts[14])
    const rHip = invertY(pts[24])
    const lAngle = calculateAngle(lHip, lShoulder, lElbow)
    const rAngle = calculateAngle(rHip, rShoulder, rElbow)
    let next = repStateRef.current
    if (lAngle > 160 && rAngle > 160) {
      next = RepState.Middle
    } else {
      if (repStateRef.current === RepState.Middle) {
        const fb = shoulderPressFeedback(pts)
        if (fb.length <= 1) {
          setCorrectCount((p) => p + 1)
          setFeedback("Good Press!")
        } else {
          setBadCount((p) => p + 1)
          setFeedback("Bad Press!")
        }

        setTimeout(() => {
          setFeedback("Detecting...")
        }, 2000)
      }
      next = RepState.Start
    }
    repStateRef.current = next
  }, [])

  const onResults = useCallback(
    (results: PoseDetectionResultBundle, vc: ViewCoordinator) => {
      if (exercise === ExerciseType.None || showModal || countdown > 0) return
      const now = Date.now()
      if (now - lastCheckRef.current < 800) {
        const fd = vc.getFrameDims(results)
        const pts = results.results[0].landmarks[0] ?? []
        const lines: SkPoint[] = []
        if (pts.length > 0) {
          for (const connection of KnownPoseLandmarkConnections) {
            const [a, b] = connection
            const p1 = vc.convertPoint(fd, pts[a])
            const p2 = vc.convertPoint(fd, pts[b])
            lines.push(vec(p1.x, p1.y))
            lines.push(vec(p2.x, p2.y))
          }
        }
        connections.value = lines
        return
      }
      lastCheckRef.current = now
      const fd = vc.getFrameDims(results)
      const pts = results.results[0].landmarks[0] ?? []
      const lines: SkPoint[] = []
      if (pts.length === 0) {
        setFeedback("Detecting...")
      } else {
        for (const connection of KnownPoseLandmarkConnections) {
          const [a, b] = connection
          const p1 = vc.convertPoint(fd, pts[a])
          const p2 = vc.convertPoint(fd, pts[b])
          lines.push(vec(p1.x, p1.y))
          lines.push(vec(p2.x, p2.y))
        }
        if (exercise === ExerciseType.Squats && isPoseValid(pts, [11,12,23,24,25,26,27,28])) {
          checkSquatRep(pts)
        } else if (exercise === ExerciseType.BicepCurls && isPoseValid(pts, [11,12,13,14,15,16])) {
          checkCurlRep(pts)
        } else if (exercise === ExerciseType.ShoulderPress && isPoseValid(pts, [11,12,13,14,23,24])) {
          checkPressRep(pts)
        } else {
          setFeedback("Detecting...")
        }
      }
      connections.value = lines
    },
    [exercise, showModal, countdown, checkSquatRep, checkCurlRep, checkPressRep, connections]
  )

  const onError = useCallback((error: DetectionError) => {}, [])

  const poseDetection = usePoseDetection(
    { onResults, onError },
    RunningMode.LIVE_STREAM,
    "pose_landmarker_lite.task",
    { fpsMode: "none" }
  )

  if (!permsGranted.cam) {
    return <NeedPermissions askForPermissions={askForPermissions} />
  }

  if (exercise === ExerciseType.None) {
    return (
      <LinearGradient
        colors={["#360033", "#0b8793"]}
        style={styles.gradientContainer}
      >
        <Text style={styles.selectTitle}>Select Your Workout</Text>
        <AnimatedPressable
          style={[styles.exerciseBtn, { opacity: fadeAnim1 }]}
          onPress={() => startNewExercise(ExerciseType.Squats)}
        >
          <Ionicons name="walk" size={24} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.exerciseText}>Squats</Text>
        </AnimatedPressable>
        <AnimatedPressable
          style={[styles.exerciseBtn, { opacity: fadeAnim2 }]}
          onPress={() => startNewExercise(ExerciseType.BicepCurls)}
        >
          <Ionicons name="barbell" size={24} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.exerciseText}>Bicep Curls</Text>
        </AnimatedPressable>
        <AnimatedPressable
          style={[styles.exerciseBtn, { opacity: fadeAnim3 }]}
          onPress={() => startNewExercise(ExerciseType.ShoulderPress)}
        >
          <Ionicons name="fitness" size={24} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.exerciseText}>Shoulder Press</Text>
        </AnimatedPressable>
      </LinearGradient>
    )
  }

  return (
    <View style={styles.mainContainer}>
      <Modal transparent visible={showModal}>
        <View style={styles.modalOuter}>
          <View style={styles.modalInner}>
            <Text style={styles.modalTitle}>Get Ready</Text>
            <Text style={styles.modalDesc}>Position yourself in view of the camera.</Text>
            <Pressable style={styles.okButton} onPress={handleModalOk}>
              <Text style={styles.okButtonText}>OK</Text>
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
        style={styles.camera}
        solution={poseDetection}
        activeCamera={activeCam}
        resizeMode="cover"
      />
      <PoseDrawFrame connections={connections} style={styles.camera} />
      <View style={styles.feedbackContainer}>
        <Text style={styles.feedbackText}>{feedback}</Text>
      </View>
      <View style={styles.countBoxContainer}>
        <View style={styles.countBox}>
          <Text style={styles.countLabel}>Good</Text>
          <Text style={styles.countNum}>{correctCount}</Text>
        </View>
        <View style={styles.countBox}>
          <Text style={styles.countLabel}>Bad</Text>
          <Text style={styles.countNum}>{badCount}</Text>
        </View>
      </View>
      <Pressable style={styles.camSwitchBtn} onPress={switchCamera}>
        <Ionicons name="camera-reverse-outline" size={24} color="#fff" />
      </Pressable>
      <Pressable style={styles.backBtn} onPress={() => setExercise(ExerciseType.None)}>
        <Ionicons name="arrow-back-outline" size={20} color="#fff" />
      </Pressable>
    </View>
  )
}

function NeedPermissions({ askForPermissions }: { askForPermissions: () => void }) {
  return (
    <View style={styles.permContainer}>
      <View style={styles.permInfo}>
        <Text style={styles.permText}>We need camera access</Text>
      </View>
      <Pressable style={styles.allowBtn} onPress={askForPermissions}>
        <Text style={styles.allowBtnText}>Allow</Text>
      </Pressable>
    </View>
  )
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  selectTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 40,
    textAlign: "center"
  },
  exerciseBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
    marginVertical: 10
  },
  exerciseText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold"
  },
  mainContainer: {
    flex: 1,
    backgroundColor: "#000",
    position: "relative"
  },
  modalOuter: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center"
  },
  modalInner: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 25,
    width: "80%",
    alignItems: "center"
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 10,
    color: "#000"
  },
  modalDesc: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "#000"
  },
  okButton: {
    backgroundColor: "#F95F48",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8
  },
  okButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600"
  },
  countdownContainer: {
    position: "absolute",
    top: 100,
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.3)",
    padding: 20,
    borderRadius: 20,
    zIndex: 999
  },
  countdownText: {
    color: "#fff",
    fontSize: 48,
    fontWeight: "900"
  },
  camera: {
    position: "absolute",
    width: "100%",
    height: "100%"
  },
  feedbackContainer: {
    position: "absolute",
    bottom: 140,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 20
  },
  feedbackText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900"
  },
  countBoxContainer: {
    position: "absolute",
    top: 40,
    left: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    width: 120
  },
  countBox: {
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  countLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600"
  },
  countNum: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800"
  },
  camSwitchBtn: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 10,
    borderRadius: 25
  },
  backBtn: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 12,
    borderRadius: 25
  },
  permContainer: {
    flex: 1,
    backgroundColor: "#fff0f0",
    alignItems: "center",
    justifyContent: "center"
  },
  permInfo: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 12,
    marginBottom: 20
  },
  permText: {
    fontSize: 18,
    color: "#000",
    fontWeight: "600"
  },
  allowBtn: {
    backgroundColor: "#F95F48",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8
  },
  allowBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600"
  }
})
