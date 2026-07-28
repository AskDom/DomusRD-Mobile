# DomusRD Mobile

App móvil de DomusRD (Android + iOS) — Expo + React Native, JavaScript.

Consume el mismo backend que la web (`DomusRD-Backend`): auth (login/registro) y listado/detalle de propiedades. Favoritos, mensajes y perfil son pantallas placeholder por ahora.

## Correr el proyecto

```bash
npm install
cp .env.example .env
```

Editá `.env` y poné en `EXPO_PUBLIC_API_URL` una URL alcanzable **desde el teléfono**:

- Si el backend corre local (`npm run dev` en `DomusRD-Backend`) y el teléfono está en la misma red WiFi que la compu: usá la IP LAN de la compu, ej. `http://192.168.1.50:5000` (no `localhost`).
- Si ya hay un backend desplegado (Railway): usá esa URL de producción.

Después:

```bash
npx expo start
```

Escaneá el QR con la app **Expo Go** (Android/iOS) desde tu teléfono. También podés presionar `a` (emulador Android) o `i` (simulador iOS) si tenés Android Studio / Xcode instalados.

## Estructura

```
src/
├── api/client.js        # fetch centralizado: URL del backend + Bearer token desde SecureStore
├── context/AuthContext.js
├── navigation/           # RootNavigator (Auth vs App según sesión), AuthStack, AppTabs, HomeStack
└── screens/
    ├── auth/              # Login, Register
    ├── PropertyList.js    # GET /api/properties
    ├── PropertyDetail.js  # GET /api/properties/:id
    └── Placeholder.js     # Favoritos / Mensajes / Perfil (pendientes)
```

## Stack

- Expo (managed) + React Native, JavaScript
- NativeWind (Tailwind para RN) — misma tipografía y lenguaje visual que la web
- React Navigation (stack + bottom tabs)
- expo-secure-store para el JWT
