import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

interface StarSpec {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  maxOpacity: number;
  duration: number;
  delay: number;
}

interface NebulaSpec {
  id: number;
  x: number;
  y: number;
  radius: number;
  color: string;
  driftX: number;
  driftY: number;
  duration: number;
  delay: number;
}

const { width, height } = Dimensions.get('window');

const randomBetween = (min: number, max: number): number => Math.random() * (max - min) + min;

const buildStars = (): StarSpec[] =>
  Array.from({ length: 120 }, (_, index) => {
    const alpha = randomBetween(0.2, 0.7).toFixed(2);
    return {
      id: index,
      x: randomBetween(0, width),
      y: randomBetween(0, height),
      size: randomBetween(1, 3),
      color: `rgba(255,240,200,${alpha})`,
      maxOpacity: randomBetween(0.3, 0.9),
      duration: randomBetween(2000, 5000),
      delay: randomBetween(0, 4000),
    };
  });

const buildNebulas = (): NebulaSpec[] =>
  Array.from({ length: 6 }, (_, index) => {
    const radius = randomBetween(60, 120);
    return {
      id: index,
      x: randomBetween(-40, width - radius),
      y: randomBetween(-40, height - radius),
      radius,
      color:
        index % 2 === 0 ? 'rgba(212,168,83,0.06)' : 'rgba(123,94,167,0.05)',
      driftX: randomBetween(-18, 18),
      driftY: randomBetween(-18, 18),
      duration: randomBetween(8000, 15000),
      delay: randomBetween(0, 3000),
    };
  });

export default function CosmosBackground() {
  const stars = useMemo(() => buildStars(), []);
  const nebulas = useMemo(() => buildNebulas(), []);

  const starOpacities = useRef(stars.map(() => new Animated.Value(0.1))).current;
  const nebulaX = useRef(nebulas.map(() => new Animated.Value(0))).current;
  const nebulaY = useRef(nebulas.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const starAnimations: Animated.CompositeAnimation[] = [];

    starOpacities.forEach((opacity, index) => {
      const star = stars[index];
      const animation = Animated.loop(
        Animated.sequence([
          Animated.delay(star.delay),
          Animated.timing(opacity, {
            toValue: star.maxOpacity,
            duration: Math.round(star.duration * 0.55),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.1,
            duration: Math.round(star.duration * 0.45),
            useNativeDriver: true,
          }),
        ])
      );

      animation.start();
      starAnimations.push(animation);
    });

    return () => {
      starAnimations.forEach((animation) => animation.stop());
    };
  }, [starOpacities, stars]);

  useEffect(() => {
    const nebulaAnimations: Animated.CompositeAnimation[] = [];

    nebulas.forEach((blob, index) => {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.delay(blob.delay),
          Animated.parallel([
            Animated.timing(nebulaX[index], {
              toValue: blob.driftX,
              duration: Math.round(blob.duration),
              useNativeDriver: true,
            }),
            Animated.timing(nebulaY[index], {
              toValue: blob.driftY,
              duration: Math.round(blob.duration),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(nebulaX[index], {
              toValue: 0,
              duration: Math.round(blob.duration),
              useNativeDriver: true,
            }),
            Animated.timing(nebulaY[index], {
              toValue: 0,
              duration: Math.round(blob.duration),
              useNativeDriver: true,
            }),
          ]),
        ])
      );

      animation.start();
      nebulaAnimations.push(animation);
    });

    return () => {
      nebulaAnimations.forEach((animation) => animation.stop());
    };
  }, [nebulaX, nebulaY, nebulas]);

  return (
    <View pointerEvents="none" style={styles.container}>
      {nebulas.map((blob, index) => (
        <Animated.View
          key={`nebula-${blob.id}`}
          style={[
            styles.nebula,
            {
              top: blob.y,
              left: blob.x,
              width: blob.radius * 2,
              height: blob.radius * 2,
              borderRadius: blob.radius,
              backgroundColor: blob.color,
              transform: [{ translateX: nebulaX[index] }, { translateY: nebulaY[index] }],
            },
          ]}
        />
      ))}

      {stars.map((star, index) => (
        <Animated.View
          key={`star-${star.id}`}
          style={[
            styles.star,
            {
              top: star.y,
              left: star.x,
              width: star.size,
              height: star.size,
              borderRadius: star.size / 2,
              backgroundColor: star.color,
              opacity: starOpacities[index],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 0,
    overflow: 'hidden',
  },
  star: {
    position: 'absolute',
  },
  nebula: {
    position: 'absolute',
  },
});

