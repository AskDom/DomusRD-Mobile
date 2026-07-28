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
      <View className="px-4 pt-4">
        <Text className="font-bold text-lg text-gray-900">Mensajes</Text>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.key}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text className="text-center text-gray-500 mt-10">
            No tenés conversaciones todavía. Escribile a un vendedor desde el detalle de una
            propiedad.
          </Text>
        }
        renderItem={({ item }) => {
          const last = item.messages[0];
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
              className="bg-white rounded-2xl border border-gray-200 p-4 mb-3"
            >
              <View className="flex-row items-center justify-between">
                <Text className="font-semibold text-gray-900 flex-1 pr-2" numberOfLines={1}>
                  {item.otherName}
                </Text>
                {item.unread > 0 && (
                  <View className="bg-blue-700 rounded-full min-w-[20px] h-5 px-1.5 items-center justify-center">
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
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}
