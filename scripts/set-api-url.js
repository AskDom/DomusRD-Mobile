#!/usr/bin/env node
// Se corre automáticamente antes de "expo start" (ver el "pre" script en
// package.json). Detecta la IP LAN actual de la compu y la escribe en
// .env — así no hay que acordarse de actualizarla a mano cada vez que
// cambia de red (WiFi del trabajo, hotspot del celular, etc.).
//
// Ojo: esto solo sirve si el teléfono y la compu están en la MISMA red
// local. Si la compu está con VPN y el teléfono en otra red (datos
// móviles, otro WiFi), ninguna IP local va a funcionar — hace falta un
// túnel público o un backend desplegado (ver README).

const fs = require("fs");
const os = require("os");
const path = require("path");

const ENV_PATH = path.join(__dirname, "..", ".env");
const BACKEND_PORT = 5000;

// Nombres de interfaz típicos de VPN — se excluyen porque esa IP solo es
// alcanzable dentro del túnel de la VPN, no desde el teléfono.
const VPN_INTERFACE_HINTS = ["tun", "wg", "ppp", "proton", "utun", "zt"];

function findLanIp() {
  const interfaces = os.networkInterfaces();
  const candidates = [];

  for (const [name, addrs] of Object.entries(interfaces)) {
    if (VPN_INTERFACE_HINTS.some((hint) => name.toLowerCase().includes(hint))) continue;
    for (const addr of addrs || []) {
      if (addr.family === "IPv4" && !addr.internal) {
        candidates.push({ name, address: addr.address });
      }
    }
  }

  // Preferimos wifi/ethernet típicos (wlan, wlp, en0, eth) si hay varias.
  const preferred = candidates.find((c) => /^(wlan|wlp|en|eth)/i.test(c.name));
  return (preferred || candidates[0])?.address || null;
}

function updateEnvFile(ip) {
  const url = `http://${ip}:${BACKEND_PORT}`;
  let content = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, "utf8") : "";

  if (/^EXPO_PUBLIC_API_URL=/m.test(content)) {
    content = content.replace(/^EXPO_PUBLIC_API_URL=.*$/m, `EXPO_PUBLIC_API_URL="${url}"`);
  } else {
    content += `${content.endsWith("\n") || !content ? "" : "\n"}EXPO_PUBLIC_API_URL="${url}"\n`;
  }

  fs.writeFileSync(ENV_PATH, content);
  return url;
}

const ip = findLanIp();
if (!ip) {
  console.warn(
    "⚠️  No se pudo detectar una IP LAN — revisá EXPO_PUBLIC_API_URL en .env a mano."
  );
  process.exit(0);
}

const url = updateEnvFile(ip);
console.log(`📡 EXPO_PUBLIC_API_URL actualizado a ${url}`);
