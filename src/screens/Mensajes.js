import { useCallback } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

import { useInbox } from "../context/InboxContext";

export default function Mensajes({ navigation }) {
  const { getConversations, fetchMessages } = useInbox();
  const conversations = getConversations();

  useFocusEffect(
    useCallback(() => {
      fetchMessages();
    }, [fetchMessages])
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 pt-4 pb-1">
        <Text className="font-extrabold text-2xl text-gray-900">Mensajes</Text>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.key}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center px-10 pt-16">
            <Text className="text-5xl mb-3">💬</Text>
            <Text className="text-center text-gray-500">
              No tenés conversaciones todavía. Escribile a un vendedor desde el detalle de una
              propiedad.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const last = item.messages[0];
          const initial = item.otherName?.trim()?.[0]?.toUpperCase() || "?";
          return (
            <Pressable
              onPress={() =>
                navigation.navigate("ConversationThread", {
                  otherId: item.otherId,
                  otherName: item.otherName,
                  propertyId: item.propertyId,
                  propertyTitle: item.propertyTitle,
                })
              }
              className="flex-row bg-white rounded-2xl border border-gray-100 p-4 mb-3 shadow-sm active:opacity-90"
            >
              <View className="w-11 h-11 rounded-full bg-brand-700 items-center justify-center mr-3">
                <Text className="text-white font-bold">{initial}</Text>
              </View>

              <View className="flex-1">
                <View className="flex-row items-center justify-between">
                  <Text className="font-semibold text-gray-900 flex-1 pr-2" numberOfLines={1}>
                    {item.otherName}
                  </Text>
                  {item.unread > 0 && (
                    <View className="bg-accent-500 rounded-full min-w-[20px] h-5 px-1.5 items-center justify-center">
                      <Text className="text-white text-xs font-bold">{item.unread}</Text>
                    </View>
                  )}
                </View>
                <Text className="text-gray-500 text-xs mt-0.5" numberOfLines={1}>
                  {item.propertyTitle}
                </Text>
                <Text className="text-gray-700 mt-1" numberOfLines={1}>
                  {last?.text}
                </Text>
              </View>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}
