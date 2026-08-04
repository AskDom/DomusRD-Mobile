import { useMemo } from "react";
import { View, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";

import { statusLabel } from "../utils/propertyLabels";
import { colors } from "../theme/colors";

// Mismos colores que el resto de la app: brand navy para Venta, verde para Renta.
const STATUS_COLOR = { Venta: colors.brand700, Renta: "#059669" };

const formatShortPrice = (price, currency) => {
  // "$" a secas es ambiguo en RD (se lee como peso) — el resto de la app
  // ya marca el dólar como "US$", esto solo lo alinea.
  const symbol = currency === "DOP" ? "RD$" : "US$";
  if (price >= 1000000) return `${symbol}${(price / 1000000).toFixed(1)}M`;
  if (price >= 1000) return `${symbol}${Math.round(price / 1000)}K`;
  return `${symbol}${price}`;
};

// República Dominicana centrada, para cuando no hay ninguna propiedad con ubicación.
const RD_CENTER = [18.7357, -70.1627];

// Tiles a color de OpenStreetMap.org para modo claro (parques verdes, agua
// azul, calles distinguibles — el "light_all" de CARTO que se probó antes
// era una paleta grisácea tipo blanco y negro). Para modo oscuro no existe
// una versión oscura de estos mismos tiles gratis sin API key, así que ahí
// sí usamos el "dark_all" de CARTO (que solo se ve mientras la app está en
// modo oscuro, no reemplaza al mapa de siempre).
const TILE_URL = {
  light: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
};
const TILE_SUBDOMAINS = { light: "abc", dark: "abcd" };
const MAP_BG = { light: "#E5E7EB", dark: "#1F2937" };

function buildHtml(properties, dark) {
  const points = properties
    .filter((p) => p.lat != null && p.lng != null)
    .map((p) => ({
      id: p.id,
      lat: p.lat,
      lng: p.lng,
      label: formatShortPrice(p.price, p.currency),
      color: STATUS_COLOR[statusLabel(p.status)] || STATUS_COLOR.Venta,
    }));

  // Leaflet + Leaflet.markercluster — sin API key.
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha384-sHL9NAb7lN7rfvG5lfHpm643Xkcjzp4jFvuavGOndn6pjVqS6ny56CAt3nsEVT4H" crossorigin="anonymous" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css" integrity="sha384-pmjIAcz2bAn0xukfxADbZIb3t8oRT9Sv0rvO+BR5Csr6Dhqq+nZs59P0pPKQJkEV" crossorigin="anonymous" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; background: ${MAP_BG[dark ? "dark" : "light"]}; }
    .leaflet-control-zoom { border: none !important; margin: 12px !important; }
    .leaflet-control-zoom a {
      width: 32px !important; height: 32px !important; line-height: 32px !important;
      color: ${dark ? "#E5E7EB" : "#164060"} !important;
      background: ${dark ? "#111827" : "#FFFFFF"} !important;
      border-radius: 10px !important; margin-bottom: 6px !important;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15) !important; border: none !important;
    }
    .price-pin {
      background: var(--c); color: #fff; padding: 4px 10px; border-radius: 20px;
      font: 700 11px -apple-system, sans-serif; white-space: nowrap;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3); border: 2px solid white;
    }
    .cluster-pin {
      width: 40px; height: 40px; border-radius: 20px; background: ${colors.brand800};
      color: #fff; display: flex; align-items: center; justify-content: center;
      font: 800 13px -apple-system, sans-serif; border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.35);
    }
    .map-attr {
      position: absolute; left: 8px; bottom: 6px; z-index: 500;
      font: 500 9px -apple-system, sans-serif; color: ${dark ? "rgba(229,231,235,0.55)" : "rgba(55,65,81,0.55)"};
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <div class="map-attr">© OpenStreetMap, © CARTO</div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha384-cxOPjt7s7Iz04uaHJceBmS+qpjv2JkIHNVcuOrM+YHwZOmJGBXI00mdUXEq65HTH" crossorigin="anonymous"></script>
  <script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js" integrity="sha384-eXVCORTRlv4FUUgS/xmOyr66XBVraen8ATNLMESp92FKXLAMiKkerixTiBvXriZr" crossorigin="anonymous"></script>
  <script>
    var points = ${JSON.stringify(points)};
    var map = L.map('map', { zoomControl: true, attributionControl: false });
    L.tileLayer('${TILE_URL[dark ? "dark" : "light"]}', {
      subdomains: '${TILE_SUBDOMAINS[dark ? "dark" : "light"]}',
      maxZoom: 19,
    }).addTo(map);

    // Agrupa pines que están muy cerca (o exactamente superpuestos, como
    // varias unidades del mismo edificio) en una sola burbuja con el
    // conteo. Sin esto, con varias propiedades juntas los precios se
    // amontonaban unos sobre otros y no se podía leer ninguno.
    var clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      maxClusterRadius: 45,
      iconCreateFunction: function (cluster) {
        return L.divIcon({
          className: '',
          html: '<div class="cluster-pin">' + cluster.getChildCount() + '</div>',
          iconSize: [40, 40],
        });
      },
    });

    points.forEach(function (p) {
      var icon = L.divIcon({
        className: '',
        html: '<div class="price-pin" style="--c:' + p.color + '">' + p.label + '</div>',
        iconSize: [0, 0],
      });
      var marker = L.marker([p.lat, p.lng], { icon: icon }).on('click', function () {
        window.ReactNativeWebView.postMessage(JSON.stringify({ id: p.id }));
      });
      clusterGroup.addLayer(marker);
    });
    map.addLayer(clusterGroup);

    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 14);
    } else if (points.length > 1) {
      map.fitBounds(clusterGroup.getBounds(), { padding: [40, 40] });
    } else {
      map.setView([${RD_CENTER[0]}, ${RD_CENTER[1]}], 8);
    }
  </script>
</body>
</html>`;
}

export default function PropertyMap({ properties, onSelectProperty, dark }) {
  const html = useMemo(() => buildHtml(properties, dark), [properties, dark]);
  // Fuerza que el WebView se recargue cuando cambia el set de propiedades
  // (no solo la cantidad) — un mismo conteo con propiedades distintas
  // también tiene que refrescar los marcadores.
  const mapKey = properties.map((p) => p.id).join(",") + (dark ? ":dark" : ":light");

  return (
    <View className="flex-1">
      <WebView
        key={mapKey}
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
