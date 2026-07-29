import { useEffect, useRef } from "react";
import { Animated, View, useWindowDimensions } from "react-native";

// Caja base que pulsa opacidad en loop — el bloque de construcción de todos
// los skeletons de abajo, cada uno solo define el layout (tamaños/posiciones)
// que imita a la pantalla real.
function SkeletonBox({ className = "", style }) {
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.45, duration: 650, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return <Animated.View style={[{ opacity }, style]} className={`bg-gray-200 dark:bg-gray-800 ${className}`} />;
}

// Mismo ancho que usa PropertyCard (HORIZONTAL_PADDING=32) para que el
// skeleton ocupe exactamente el mismo espacio que la tarjeta real.
export function PropertyCardSkeleton() {
  const { width } = useWindowDimensions();
  const size = width - 32;

  return (
    <View className="mb-7">
      <SkeletonBox className="rounded-2xl" style={{ width: size, height: size }} />
      <View className="pt-2.5">
        <SkeletonBox className="rounded-md" style={{ width: "60%", height: 16 }} />
        <SkeletonBox className="rounded-md mt-2" style={{ width: "40%", height: 13 }} />
        <SkeletonBox className="rounded-md mt-2" style={{ width: "30%", height: 16 }} />
      </View>
    </View>
  );
}

export function PropertyListSkeleton({ count = 3 }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </View>
  );
}

export function PropertyDetailSkeleton() {
  return (
    <View>
      <SkeletonBox style={{ width: "100%", height: 300 }} />
      <View className="p-4">
        <SkeletonBox className="rounded-md" style={{ width: "75%", height: 22 }} />
        <SkeletonBox className="rounded-md mt-2" style={{ width: "35%", height: 14 }} />

        <View className="flex-row mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
          <SkeletonBox className="rounded-md" style={{ width: 120, height: 30 }} />
        </View>

        <View className="flex-row flex-wrap gap-2 mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBox key={i} className="rounded-2xl" style={{ width: 84, height: 38 }} />
          ))}
        </View>
      </View>
    </View>
  );
}

export function MyPropertyRowSkeleton() {
  return (
    <View className="flex-row bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 mb-3 overflow-hidden">
      <SkeletonBox style={{ width: 96, height: 96 }} />
      <View className="flex-1 p-3">
        <SkeletonBox className="rounded-full" style={{ width: 60, height: 14 }} />
        <SkeletonBox className="rounded-md mt-2.5" style={{ width: "70%", height: 14 }} />
        <SkeletonBox className="rounded-md mt-2" style={{ width: "40%", height: 14 }} />
      </View>
    </View>
  );
}

export default SkeletonBox;
