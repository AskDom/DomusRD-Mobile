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

export default function ConversationThread({ route }) {
  const { otherId, otherName, propertyId, propertyTitle } = route.params;
  const { currentUser } = useAuth();
  const { messages, sendMessage, markAsRead } = useInbox();
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
      <SafeAreaView className="flex-1 bg-gray-50" edges={["bottom"]}>
        <Text className="text-gray-500 text-xs px-4 pt-2" numberOfLines={1}>
          {propertyTitle}
        </Text>

        <FlatList
          data={thread}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          ListEmptyComponent={
            <Text className="text-center text-gray-500 mt-10">Escribile el primer mensaje.</Text>
          }
          renderItem={({ item }) => {
            const mine = item.fromId === currentUser.id;
            return (
              <View className={mine ? "items-end mb-2" : "items-start mb-2"}>
                <View
                  className={
                    mine
                      ? "bg-blue-700 rounded-2xl rounded-br-sm px-3 py-2 max-w-[80%]"
                      : "bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-3 py-2 max-w-[80%]"
                  }
                >
                  <Text className={mine ? "text-white" : "text-gray-900"}>{item.text}</Text>
                </View>
              </View>
            );
          }}
        />

        <View className="flex-row items-center gap-2 p-3 border-t border-gray-200 bg-white">
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Escribí un mensaje..."
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2"
            multiline
          />
          <Pressable
            onPress={handleSend}
            disabled={sending || !text.trim()}
            className="bg-blue-700 rounded-xl px-4 py-2 disabled:opacity-50"
          >
            <Text className="text-white font-semibold">Enviar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
