import { useEffect, useState } from "react";
import { View, TextInput, Text, Pressable, ScrollView } from "react-native";

import { DOMINICAN_CITIES } from "../data/dominicanCities";

// Se puede escribir para filtrar, pero solo queda confirmado el valor si se
// elige una opción de la lista (o si lo escrito coincide exacto con una,
// sin importar mayúsculas, al salir del campo) — evita ciudades con typos
// o acentos inconsistentes que después no se pueden buscar bien.
export default function CityAutocomplete({ value, onChange, className, placeholderTextColor, placeholder = "Escribí para buscar..." }) {
  const [query, setQuery] = useState(value || "");
  const [open, setOpen] = useState(false);

  useEffect(() => setQuery(value || ""), [value]);

  // Sin límite artificial: la lista de abajo ya scrollea (max-h-56), y con
  // ~50 opciones cortar en 6 escondía casi toda la lista sin escribir nada
  // primero (arrancando en A/B, no se veían Santiago/Santo Domingo/etc).
  const suggestions = query.trim()
    ? DOMINICAN_CITIES.filter((c) => c.toLowerCase().includes(query.trim().toLowerCase()))
    : DOMINICAN_CITIES;

  const select = (city) => {
    setQuery(city);
    onChange(city);
    setOpen(false);
  };

  const handleBlur = () => {
    const exact = DOMINICAN_CITIES.find((c) => c.toLowerCase() === query.trim().toLowerCase());
    if (exact) {
      setQuery(exact);
      onChange(exact);
    }
    // Delay corto para que el toque en una opción alcance a registrarse
    // antes de que el blur del TextInput la haga desaparecer.
    setTimeout(() => setOpen(false), 150);
  };

  return (
    <View>
      <TextInput
        value={query}
        onChangeText={(t) => {
          setQuery(t);
          onChange(""); // no queda confirmada hasta elegir de la lista
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={handleBlur}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        className={className}
      />
      {open && suggestions.length > 0 && (
        <ScrollView
          className="mt-1.5 max-h-56 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl"
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >
          {suggestions.map((c, i) => (
            <Pressable
              key={c}
              onPress={() => select(c)}
              className={`px-4 py-3 ${i > 0 ? "border-t border-gray-100 dark:border-gray-800" : ""}`}
            >
              <Text className="text-gray-800 dark:text-gray-100 text-sm">{c}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
