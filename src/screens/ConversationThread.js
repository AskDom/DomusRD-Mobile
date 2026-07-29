import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../context/AuthContext";
import { useInbox } from "../context/InboxContext";
import { useTheme } from "../context/ThemeContext";

export default function ConversationThread({ route }) {
  const { otherId, otherName, propertyId, propertyTitle } = route.params;
  const { currentUser } = useAuth();
  const { messages, sendMessage, markAsRead } = useInbox();
  const { dark } = useTheme();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const thread = useMemo(() => {
    return messages
      .filter(
        (m) =>
          m.propertyId === propertyId &&
          ((m.fromId === currentUser.id && m.toId === otherId) ||
            (m.fromId === otherId && m.toId === currentUser.id))
      )
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [messages, propertyId, otherId, currentUser.id]);

  useEffect(() => {
    thread.forEach((m) => {
      if (m.toId === currentUser.id && !m.read) markAsRead(m.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread]);

  const handleSend = async () => {
    const value = text.trim();
    if (!value) return;
    setSending(true);
    setText("");
    try {
      await sendMessage({ toId: otherId, toName: otherName, propertyId, propertyTitle, text: value });
    } catch {
      // el mensaje optimista ya se saca solo en el context si falla
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950" edges={["bottom"]}>
        <View className="px-4 pt-2 pb-2 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          <Text className="text-gray-500 dark:text-gray-400 text-xs" numberOfLines={1}>
            {propertyTitle}
          </Text>
        </View>

        <FlatList
          data={thread}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          ListEmptyComponent={
            <Text className="text-center text-gray-500 dark:text-gray-400 mt-10">
              Escribile el primer mensaje.
            </Text>
          }
          renderItem={({ item }) => {
            const mine = item.fromId === currentUser.id;
            return (
              <View className={mine ? "items-end mb-2" : "items-start mb-2"}>
                <View
                  className={
                    mine
                      ? "bg-brand-700 rounded-2xl rounded-br-sm px-3.5 py-2.5 max-w-[80%] shadow-sm"
                      : "bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl rounded-bl-sm px-3.5 py-2.5 max-w-[80%] shadow-sm"
                  }
                >
                  <Text className={mine ? "text-white" : "text-gray-900 dark:text-white"}>
                    {item.text}
                  </Text>
                </View>
              </View>
            );
          }}
        />

        <View className="flex-row items-end gap-2 p-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Escribí un mensaje..."
            placeholderTextColor={dark ? "#6B7280" : "#9CA3AF"}
            className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2.5 max-h-28 text-gray-900 dark:text-white"
            multiline
          />
          <Pressable
            onPress={handleSend}
            disabled={sending || !text.trim()}
            className="bg-brand-700 rounded-2xl px-4 py-3 active:bg-brand-800 disabled:opacity-40"
          >
            <Text className="text-white font-semibold">Enviar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
