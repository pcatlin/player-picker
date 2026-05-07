import { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  NativeSyntheticEvent,
  NativeTouchEvent,
  View as RNView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { TouchPoint, Winner } from "../state/usePickerState";

type TouchArenaProps = {
  touches: TouchPoint[];
  phase: "ready" | "holding" | "reveal";
  countdownSeconds: number;
  winner: Winner | null;
  playerColors: string[];
  onTouchesChanged: (touches: TouchPoint[]) => void;
};

type ColoredTouch = TouchPoint & { color: string };

const CIRCLE_SIZE = 92;
const WINNER_MARKER_SIZE = 72;

export const TouchArena = ({
  countdownSeconds,
  onTouchesChanged,
  phase,
  playerColors,
  touches,
  winner,
}: TouchArenaProps) => {
  const arenaRef = useRef<RNView | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fillAnim = useRef(new Animated.Value(0)).current;
  const maxRadiusRef = useRef(0);
  const arenaPageOffsetRef = useRef({ x: 0, y: 0 });

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    maxRadiusRef.current = Math.hypot(width, height);
    arenaRef.current?.measure((_x, _y, _width, _height, pageX, pageY) => {
      arenaPageOffsetRef.current = { x: pageX, y: pageY };
    });
  };

  useEffect(() => {
    if (phase !== "holding") {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          duration: 450,
          toValue: 1.1,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          duration: 450,
          toValue: 1,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();

    return () => loop.stop();
  }, [phase, pulseAnim]);

  useEffect(() => {
    if (phase !== "reveal" || !winner) {
      fillAnim.setValue(0);
      return;
    }

    Animated.timing(fillAnim, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [fillAnim, phase, winner]);

  const coloredTouches: ColoredTouch[] = useMemo(() => {
    const ordered = [...touches].sort((a, b) => a.id - b.id);
    return ordered.map((touch, index) => ({
      ...touch,
      color: playerColors[index] ?? "#6e64ff",
    }));
  }, [playerColors, touches]);

  const winnerMarkerPosition = useMemo(() => {
    if (!winner) {
      return null;
    }

    return {
      x: winner.x,
      y: winner.y,
    };
  }, [winner]);

  const onResponderEvent = (
    event: NativeSyntheticEvent<NativeTouchEvent>,
  ) => {
    const { touches } = event.nativeEvent;
    const { x: arenaPageX, y: arenaPageY } = arenaPageOffsetRef.current;

    const nextTouches: TouchPoint[] = touches
      .map((touch) => ({
        id: touch.identifier,
        x: touch.pageX - arenaPageX,
        y: touch.pageY - arenaPageY,
      }))
      .filter(
        (touch) =>
          Number.isFinite(touch.x) &&
          Number.isFinite(touch.y) &&
          touch.x >= 0 &&
          touch.y >= 0,
      );
    onTouchesChanged(nextTouches);
  };

  return (
    <View
      ref={arenaRef}
      onLayout={onLayout}
      onTouchStart={onResponderEvent}
      onTouchMove={onResponderEvent}
      onTouchEnd={onResponderEvent}
      onTouchCancel={onResponderEvent}
      style={styles.arena}
    >
      {phase === "holding" ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.countdownRing, { transform: [{ scale: pulseAnim }] }]}
        >
          <Text style={styles.countdownText}>{countdownSeconds}</Text>
        </Animated.View>
      ) : null}

      {phase !== "reveal"
        ? coloredTouches.map((touch) => (
            <View
              key={touch.id}
              pointerEvents="none"
              style={[
                styles.touchCircle,
                {
                  backgroundColor: touch.color,
                  left: touch.x - CIRCLE_SIZE / 2,
                  top: touch.y - CIRCLE_SIZE / 2,
                },
              ]}
            />
          ))
        : null}

      {phase === "reveal" && winner && winnerMarkerPosition ? (
        <>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.winnerFill,
              {
                backgroundColor: playerColors[winner.playerIndex] ?? "#6e64ff",
                borderRadius: maxRadiusRef.current,
                height: maxRadiusRef.current * 2,
                left: winner.x - maxRadiusRef.current,
                top: winner.y - maxRadiusRef.current,
                transform: [{ scale: fillAnim }],
                width: maxRadiusRef.current * 2,
              },
            ]}
          />
          <View
            pointerEvents="none"
            style={[
              styles.winnerMarker,
              {
                left: winnerMarkerPosition.x - WINNER_MARKER_SIZE / 2,
                top: winnerMarkerPosition.y - WINNER_MARKER_SIZE / 2,
              },
            ]}
          />
        </>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  arena: {
    flex: 1,
    overflow: "hidden",
  },
  countdownRing: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.9)",
    borderRadius: 64,
    borderWidth: 4,
    height: 128,
    justifyContent: "center",
    left: "50%",
    marginLeft: -64,
    marginTop: -64,
    position: "absolute",
    top: "42%",
    width: 128,
    zIndex: 5,
  },
  countdownText: {
    color: "#ffffff",
    fontSize: 54,
    fontWeight: "800",
  },
  touchCircle: {
    borderColor: "rgba(255,255,255,0.9)",
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 4,
    height: CIRCLE_SIZE,
    opacity: 0.94,
    position: "absolute",
    width: CIRCLE_SIZE,
  },
  winnerFill: {
    position: "absolute",
    zIndex: 20,
  },
  winnerMarker: {
    backgroundColor: "#ffffff",
    borderRadius: WINNER_MARKER_SIZE / 2,
    height: WINNER_MARKER_SIZE,
    position: "absolute",
    width: WINNER_MARKER_SIZE,
    zIndex: 30,
  },
});
