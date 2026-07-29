import { useCallback, useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { apiFetch } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import SectionHeader from "./SectionHeader";
import StarRating from "./StarRating";
import { colors } from "../theme/colors";

const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
const formatDate = (iso) => {
  const d = new Date(iso);
  return `${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
};

function ReviewCard({ review, isOwn, onDelete }) {
  const initial = review.user?.name?.trim()?.[0]?.toUpperCase() || "?";
  return (
    <View className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 mb-3">
      <View className="flex-row items-start justify-between gap-2">
        <View className="flex-row items-center gap-3 flex-1">
          <View className="w-9 h-9 rounded-full bg-brand-50 dark:bg-brand-900/30 items-center justify-center">
            <Text className="text-brand-700 dark:text-brand-300 font-bold text-sm">{initial}</Text>
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-gray-900 dark:text-white text-sm" numberOfLines={1}>
              {review.user?.name}
            </Text>
            <Text className="text-gray-400 dark:text-gray-500 text-xs">{formatDate(review.createdAt)}</Text>
          </View>
        </View>
        <StarRating value={review.rating} readOnly size={13} />
      </View>
      <Text className="text-gray-600 dark:text-gray-300 text-sm mt-3 leading-5">{review.comment}</Text>
      {isOwn && (
        <Pressable onPress={onDelete} className="self-start mt-2" hitSlop={6}>
          <Text className="text-red-500 text-xs font-medium">Eliminar</Text>
        </Pressable>
      )}
    </View>
  );
}

export default function ReviewSection({ propertyId, publishedById }) {
  const { currentUser } = useAuth();
  const { dark } = useTheme();

  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const isOwner = currentUser?.id === publishedById;
  const myReview = reviews.find((r) => r.userId === currentUser?.id);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch(`/api/reviews/${propertyId}`);
      setReviews(data.reviews);
      setAverage(data.average);
      setTotal(data.total);
      const mine = data.reviews.find((r) => r.userId === currentUser?.id);
      if (mine) {
        setMyRating(mine.rating);
        setMyComment(mine.comment);
      }
    } catch {
      // dejamos la lista como estaba si falla
    } finally {
      setLoading(false);
    }
  }, [propertyId, currentUser?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async () => {
    setError("");
    if (!myRating) {
      setError("Elegí una calificación.");
      return;
    }
    if (!myComment.trim()) {
      setError("Escribí un comentario.");
      return;
    }
    setSending(true);
    try {
      await apiFetch(`/api/reviews/${propertyId}`, {
        method: "POST",
        body: JSON.stringify({ rating: myRating, comment: myComment.trim() }),
      });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message || "No se pudo guardar la reseña.");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    try {
      await apiFetch(`/api/reviews/${propertyId}`, { method: "DELETE" });
      setMyRating(0);
      setMyComment("");
      setShowForm(false);
      load();
    } catch {
      // no-op — si falla, el botón sigue disponible para reintentar
    }
  };

  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    return { star, count, pct: total ? Math.round((count / total) * 100) : 0 };
  });

  return (
    <View className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
      <SectionHeader>Calificaciones y reseñas</SectionHeader>

      {!loading && total > 0 && (
        <View className="flex-row bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 mb-4">
          <View className="items-center justify-center pr-4 mr-4 border-r border-gray-200 dark:border-gray-700">
            <Text className="font-extrabold text-3xl text-gray-900 dark:text-white">{average}</Text>
            <StarRating value={Math.round(average)} readOnly size={13} />
            <Text className="text-gray-400 dark:text-gray-500 text-xs mt-1">
              {total} reseña{total !== 1 ? "s" : ""}
            </Text>
          </View>
          <View className="flex-1 justify-center" style={{ gap: 4 }}>
            {distribution.map(({ star, count, pct }) => (
              <View key={star} className="flex-row items-center gap-2">
                <Text className="text-gray-500 dark:text-gray-400 text-xs w-2">{star}</Text>
                <Ionicons name="star" size={10} color="#FBBF24" />
                <View className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <View className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                </View>
                <Text className="text-gray-400 dark:text-gray-500 text-xs w-4 text-right">{count}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {currentUser && !isOwner && (
        <View className="mb-4">
          {!showForm ? (
            <Pressable
              onPress={() => setShowForm(true)}
              className="flex-row items-center justify-center gap-2 border-2 border-brand-700 dark:border-brand-400 rounded-2xl py-3 active:bg-brand-50 dark:active:bg-brand-900/20"
            >
              <Ionicons name="star-outline" size={16} color={dark ? colors.brand400 : colors.brand700} />
              <Text className="text-brand-700 dark:text-brand-400 font-semibold">
                {myReview ? "Editar tu reseña" : "Escribir una reseña"}
              </Text>
            </Pressable>
          ) : (
            <View className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
              <Text className="font-semibold text-gray-900 dark:text-white mb-3">
                {myReview ? "Editar reseña" : "Tu reseña"}
              </Text>
              <StarRating value={myRating} onChange={setMyRating} size={28} />
              <TextInput
                value={myComment}
                onChangeText={setMyComment}
                placeholder="Compartí tu experiencia con esta propiedad..."
                placeholderTextColor={dark ? "#6B7280" : "#9CA3AF"}
                multiline
                numberOfLines={4}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-gray-900 dark:text-white mt-3"
                style={{ minHeight: 90, textAlignVertical: "top" }}
              />
              {error ? <Text className="text-red-600 dark:text-red-400 text-xs mt-2">{error}</Text> : null}
              <View className="flex-row items-center gap-3 mt-3">
                <Pressable
                  onPress={handleSubmit}
                  disabled={sending}
                  className="bg-brand-700 rounded-xl px-4 py-2.5 active:bg-brand-800 disabled:opacity-60"
                >
                  {sending ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text className="text-white font-semibold text-sm">
                      {myReview ? "Actualizar" : "Publicar"}
                    </Text>
                  )}
                </Pressable>
                <Pressable
                  onPress={() => {
                    setShowForm(false);
                    setError("");
                  }}
                  className="bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-2.5"
                >
                  <Text className="text-gray-700 dark:text-gray-300 font-semibold text-sm">Cancelar</Text>
                </Pressable>
                {myReview && (
                  <Pressable onPress={handleDelete} className="ml-auto" hitSlop={6}>
                    <Text className="text-red-500 text-sm font-medium">Eliminar</Text>
                  </Pressable>
                )}
              </View>
            </View>
          )}
        </View>
      )}

      {!currentUser && (
        <Text className="text-gray-500 dark:text-gray-400 text-sm italic mb-4">
          Iniciá sesión para dejar una reseña.
        </Text>
      )}
      {isOwner && (
        <Text className="text-gray-400 dark:text-gray-500 text-sm italic mb-4">
          No podés reseñar tu propia propiedad.
        </Text>
      )}

      {loading ? (
        <ActivityIndicator color={colors.brand700} />
      ) : reviews.length === 0 ? (
        <View className="items-center py-8">
          <Text className="text-3xl mb-2">💬</Text>
          <Text className="text-gray-400 dark:text-gray-500 text-sm">
            Sé el primero en reseñar esta propiedad.
          </Text>
        </View>
      ) : (
        reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            isOwn={review.userId === currentUser?.id}
            onDelete={handleDelete}
          />
        ))
      )}
    </View>
  );
}
