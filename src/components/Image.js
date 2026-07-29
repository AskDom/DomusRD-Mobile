import { Image as ExpoImage } from "expo-image";
import { cssInterop } from "nativewind";

// expo-image no es un componente core de RN, así que NativeWind no lo
// interpreta automáticamente — cssInterop mapea className -> style acá, una
// sola vez, para que se pueda seguir usando className como con el <Image>
// de siempre en todas las pantallas.
cssInterop(ExpoImage, { className: "style" });

export default ExpoImage;
