import { useMemo } from "react";
import { View, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";

import { statusLabel } from "../utils/propertyLabels";
import { colors } from "../theme/colors";

// Mismos colores que el resto de la app: brand navy para Venta, verde para Renta.
const STATUS_COLOR = { Venta: colors.brand700, Renta: "#059669" };

const formatShortPrice = (price) => {
  if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`;
  if (price >= 1000) return `$${Math.round(price / 1000)}K`;
  return `$${price}`;
};

// República Dominicana centrada, para cuando no hay ninguna propiedad con ubicación.
const RD_CENTER = [18.7357, -70.1627];

function buildHtml(properties) {
  const points = properties
    .filter((p) => p.lat != null && p.lng != null)
    .map((p) => ({
      id: p.id,
      lat: p.lat,
      lng: p.lng,
      label: formatShortPrice(p.price),
      color: STATUS_COLOR[statusLabel(p.status)] || STATUS_COLOR.Venta,
    }));

  // Leaflet + tiles de OpenStreetMap — sin API key, misma librería que usa el web.
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; background: #E5E7EB; }
    .price-pin {
      background: var(--c); color: #fff; padding: 4px 10px; border-radius: 20px;
      font: 700 11px -apple-system, sans-serif; white-space: nowrap;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3); border: 2px solid white;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var points = ${JSON.stringify(points)};
    var map = L.map('map', { zoomControl: false, attributionControl: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 14);
    } else if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points.map(function (p) { return [p.lat, p.lng]; })), { padding: [40, 40] });
    } else {
      map.setView([${RD_CENTER[0]}, ${RD_CENTER[1]}], 8);
    }

    points.forEach(function (p) {
      var icon = L.divIcon({
        className: '',
        html: '<div class="price-pin" style="--c:' + p.color + '">' + p.label + '</div>',
        iconSize: [0, 0],
      });
      L.marker([p.lat, p.lng], { icon: icon }).addTo(map).on('click', function () {
        window.ReactNativeWebView.postMessage(JSON.stringify({ id: p.id }));
      });
    });
  </script>
</body>
</html>`;
}

export default function PropertyMap({ properties, onSelectProperty }) {
  const html = useMemo(() => buildHtml(properties), [properties]);
  // Fuerza que el WebView se recargue cuando cambia el set de propiedades
  // (no solo la cantidad) — un mismo conteo con propiedades distintas
  // también tiene que refrescar los marcadores.
  const mapKey = properties.map((p) => p.id).join(",");

  return (
    <View className="flex-1">
      <WebView
        key={mapKey}
        originWhitelist={["*"]}
        source={{ html }}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.id) onSelectProperty(data.id);
          } catch {
            // mensaje inesperado del WebView — lo ignoramos
          }
        }}
        startInLoadingState
        renderLoading={() => (
          <View className="absolute inset-0 items-center justify-center bg-gray-100 dark:bg-gray-900">
            <ActivityIndicator size="large" color={colors.brand700} />
          </View>
        )}
        style={{ flex: 1, backgroundColor: "transparent" }}
      />
    </View>
  );
}
