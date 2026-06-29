import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function ProgressRing({
  size = 280,
  strokeWidth = 8,
  progress = 0,
  color = '#2DD4BF',
  trackColor = 'rgba(255,255,255,0.08)',
  children,
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - Math.min(progress, 1));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={styles.rings}>
        <View
          style={[
            styles.track,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: trackColor,
            },
          ]}
        />
        <View
          style={[
            styles.progress,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: color,
              borderTopColor: progress > 0 ? color : 'transparent',
              borderRightColor: progress > 0.25 ? color : 'transparent',
              borderBottomColor: progress > 0.5 ? color : 'transparent',
              borderLeftColor: progress > 0.75 ? color : 'transparent',
              transform: [{ rotate: '-90deg' }],
            },
          ]}
        />
      </View>
      <View style={styles.children}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  rings: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  track: {
    position: 'absolute',
  },
  progress: {
    position: 'absolute',
  },
  children: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
