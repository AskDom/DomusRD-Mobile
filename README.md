# Domify Mobile

App móvil de Domify (Android + iOS) — Expo + React Native, JavaScript.

Consume el mismo backend que la web (`DomusRD-Backend`): auth, propiedades (listado/detalle/publicar), favoritos y mensajes.

## Correr el proyecto

```bash
npm install
cp .env.example .env
npm start
```

Usá siempre **`npm start`** (no `npx expo start` directo) — corre `scripts/set-api-url.js` antes de arrancar, que detecta la IP LAN actual de la compu y la escribe sola en `.env`. Así no hay que acordarse de actualizarla a mano cada vez que cambia de red.

Escaneá el QR con la app **Expo Go** (Android/iOS) desde tu teléfono. También podés presionar `a` (emulador Android) o `i` (simulador iOS) si tenés Android Studio / Xcode instalados.

### Si cambiás de red seguido (VPN, hotspot del celular)

El teléfono y la compu tienen que estar en la **misma red local** para que esto funcione — es una limitación de cómo Expo Go se conecta al servidor de desarrollo, no de la app. `npm start` resuelve el caso de "la IP cambió pero seguimos en la misma red". Lo que **no** resuelve es estar en redes distintas de verdad (ej. compu con VPN de trabajo y teléfono con datos móviles) — ahí ninguna IP local sirve. Opciones si te pasa:

- Conectá ambos a la misma red (el hotspot del celular sirve: conectá la compu a tu propio hotspot).
- Si hay un backend ya desplegado (Railway), apuntá `EXPO_PUBLIC_API_URL` en `.env` directo a esa URL en vez de al backend local — evita el problema de raíz.

## Estructura

```
src/
├── api/client.js        # fetch centralizado: URL del backend + Bearer token desde SecureStore
├── context/              # AuthContext, FavoritesContext, InboxContext
├── navigation/            # RootNavigator (Auth vs App según sesión), stacks por tab
├── theme/colors.js        # paleta brand/accent en hex, para componentes RN que no aceptan className
├── utils/propertyLabels.js
└── screens/
    ├── auth/              # Login, Register
    ├── PropertyList.js, PropertyDetail.js, Publish.js
    ├── Favoritos.js
    └── Mensajes.js, ConversationThread.js, Perfil.js
```

## Stack

- Expo SDK 54 (managed) + React Native, JavaScript
- NativeWind (Tailwind para RN) — misma tipografía y lenguaje visual que la web
- React Navigation (stack + bottom tabs)
- expo-secure-store para el JWT

## Por qué SDK 54 y no la última

El paquete `expo` de npm siempre resuelve a la versión más nueva publicada (hoy 57), pero **la app Expo Go que se baja de las tiendas va rezagada** respecto a eso. Antes de tocar la versión de `expo` en `package.json`, confirmá qué SDK corre realmente la Expo Go actual:

```bash
curl -s https://api.expo.dev/v2/versions/latest | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['expoGoSdkVersion'])"
```

Si necesitás cambiar de SDK: `npm install expo@<version>` y después `npx expo install --fix` para realinear el resto de los paquetes. Si el árbol de dependencias queda raro después de varios cambios de SDK seguidos, `rm -rf node_modules package-lock.json && npm install` limpio suele arreglarlo.
