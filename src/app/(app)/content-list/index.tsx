import KanjiWriter from "@components/KanjiWriter";
import { ThemedText } from "@components/ThemedText";
import { useLesson } from "@hooks/useLessons";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import * as Speech from "expo-speech";
import {
  ChevronLeft,
  Headphones,
  Pencil,
  Sparkles,
  X,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// Helper: Play audio from URL
const playAudio = async (url: string) => {
  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri: url },
      { shouldPlay: true }
    );
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (e) {
    console.warn("Audio playback error", e);
  }
};

// --- Modern Card Component (for expandable vocabulary) ---
const ModernCardExpandable = ({ children, style }: any) => (
  <Animated.View
    className="bg-white rounded-3xl shadow-xl mb-4"
    style={[
      {
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 10,
        minHeight: 220,
      },
      style,
    ]}
  >
    {children}
  </Animated.View>
);

// --- Modern Card Component (for list vocabulary) ---
const ModernCard = ({ children, style }: any) => (
  <View style={{ marginBottom: 12, padding: 2 }}>
    <Animated.View
      className="bg-white shadow-lg"
      style={[
        {
          borderRadius: 14,
          backgroundColor: "#FCD34D",
          padding: 2,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 5,
        },
      ]}
    >
      <View
        style={{
          borderRadius: 12,
          backgroundColor: "#ffffff",
          paddingTop: Platform.OS === "android" ? 30 : 26,
          paddingBottom: 20,
          paddingLeft: 16,
          paddingRight: 16,
          minHeight: 165,
        }}
      >
        {children}
      </View>
    </Animated.View>
  </View>
);

// --- Expandable Vocabulary Card (Flip Card) ---
const ExpandableVocabularyCard = ({
  item,
  index,
}: {
  item: any;
  index: number;
}) => {
  const { t } = useTranslation();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const meanings = (item.meanings || [])
    .map((m: any) => (typeof m === "string" ? m : m.meaning || m.text || ""))
    .filter(Boolean);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const toValue = isFlipped ? 0 : 1;
    setIsFlipped(!isFlipped);

    Animated.spring(flipAnim, {
      toValue,
      tension: 65,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handleAudio = (e: any) => {
    e.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Ưu tiên dùng audioUrl từ BE
    if (item.audioUrl) {
      playAudio(item.audioUrl);
    } else {
      // Nếu không có audioUrl thì dùng text-to-speech
      const textToSpeak = item.wordJp || item.reading || "";
      if (textToSpeak) {
        if (isSpeaking) {
          Speech.stop();
          setIsSpeaking(false);
        } else {
          setIsSpeaking(true);
          Speech.speak(textToSpeak, {
            language: "ja-JP",
            onDone: () => {
              setIsSpeaking(false);
            },
            onStopped: () => {
              setIsSpeaking(false);
            },
            onError: () => {
              setIsSpeaking(false);
            },
          });
        }
      }
    }
  };

  // Cleanup speech when component unmounts
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });

  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
    opacity: frontOpacity,
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
    opacity: backOpacity,
  };

  return (
    <View style={{ width: "100%" }}>
      <View style={{ position: "relative", width: "100%", minHeight: 220 }}>
        {/* Front Side */}
        <Animated.View
          style={[
            {
              position: "absolute",
              width: "100%",
            },
            frontAnimatedStyle,
          ]}
          pointerEvents={isFlipped ? "none" : "auto"}
        >
          <ModernCardExpandable style={{ paddingTop: 24, paddingBottom: 24, paddingHorizontal: 20 }}>
            <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
              <View style={{ minHeight: 150, justifyContent: "center", paddingVertical: 12 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <View style={{ flex: 1, alignItems: "center", paddingRight: 8, minWidth: 0 }}>
                    <ThemedText style={{ fontSize: 30, fontWeight: "bold", color: "#4f46e5", textAlign: "center", flexShrink: 1, lineHeight: 38 }}>
                      {item.wordJp}
                    </ThemedText>
                    <ThemedText style={{ fontSize: 24, color: "#818cf8", marginTop: 6, fontWeight: "500", textAlign: "center", flexShrink: 1 }}>
                      {item.reading}
                    </ThemedText>
                  </View>
                  <TouchableOpacity
                    onPress={handleAudio}
                    className="bg-indigo-100 p-3 rounded-2xl"
                    style={{ flexShrink: 0 }}
                  >
                    <Headphones size={22} color="#4f46e5" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </ModernCardExpandable>
        </Animated.View>

        {/* Back Side */}
        <Animated.View
          style={[
            {
              position: "absolute",
              width: "100%",
            },
            backAnimatedStyle,
          ]}
          pointerEvents={isFlipped ? "auto" : "none"}
        >
          <ModernCardExpandable style={{ padding: 20 }}>
            <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
              <View
                style={{ minHeight: 180, justifyContent: "center", alignItems: "center", paddingVertical: 16 }}
              >
                <View style={{ width: "100%", paddingHorizontal: 16 }}>
                  {meanings.length > 0 ? (
                    meanings.map((m: string, i: number) => (
                      <View
                        key={i}
                        style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: i < meanings.length - 1 ? 16 : 0 }}
                      >
                        <ThemedText style={{ fontSize: 30, color: "#1f2937", fontWeight: "600", textAlign: "center", flex: 1, flexShrink: 1, lineHeight: 44 }}>
                          {m}
                        </ThemedText>
                      </View>
                    ))
                  ) : (
                    <ThemedText style={{ fontSize: 30, color: "#6b7280", textAlign: "center", lineHeight: 44 }}>
                      {t("lessons.no_meaning") || "Không có nghĩa"}
                    </ThemedText>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </ModernCardExpandable>
        </Animated.View>
      </View>
    </View>
  );
};

// --- Expandable Grammar Card (Flip Card) ---
const ExpandableGrammarCard = ({
  item,
  index,
}: {
  item: any;
  index: number;
}) => {
  const { t } = useTranslation();
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const toValue = isFlipped ? 0 : 1;
    setIsFlipped(!isFlipped);

    Animated.spring(flipAnim, {
      toValue,
      tension: 65,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });

  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
    opacity: frontOpacity,
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
    opacity: backOpacity,
  };

  return (
    <View style={{ width: "100%" }}>
      <View style={{ position: "relative", width: "100%", minHeight: 220 }}>
        {/* Front Side */}
        <Animated.View
          style={[
            {
              position: "absolute",
              width: "100%",
            },
            frontAnimatedStyle,
          ]}
          pointerEvents={isFlipped ? "none" : "auto"}
        >
          <ModernCardExpandable style={{ paddingTop: 28, paddingBottom: 28, paddingHorizontal: 20 }}>
            <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
              <View
                style={{ minHeight: 160, justifyContent: "center", alignItems: "center", paddingVertical: 16, paddingHorizontal: 12 }}
              >
                <ThemedText style={{ fontSize: 32, fontWeight: "bold", color: "#0891b2", textAlign: "center", flexShrink: 1, lineHeight: 42 }}>
                  {item.title}
                </ThemedText>
              </View>
            </TouchableOpacity>
          </ModernCardExpandable>
        </Animated.View>

        {/* Back Side */}
        <Animated.View
          style={[
            {
              position: "absolute",
              width: "100%",
            },
            backAnimatedStyle,
          ]}
          pointerEvents={isFlipped ? "auto" : "none"}
        >
          <ModernCardExpandable style={{ padding: 20 }}>
            <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
              <View style={{ minHeight: 180, justifyContent: "center", paddingVertical: 16 }}>
                <View style={{ width: "100%", paddingHorizontal: 16 }}>
                  {item.description && (
                    <ThemedText style={{ fontSize: 28, color: "#1f2937", fontWeight: "600", textAlign: "center", lineHeight: 42, marginBottom: 20, flexShrink: 1 }}>
                      {item.description}
                    </ThemedText>
                  )}
                  {item.usage && (
                    <View className="bg-cyan-50 p-6 rounded-2xl mt-4">
                      <ThemedText style={{ fontSize: 24, color: "#155e75", textAlign: "center", flexShrink: 1, lineHeight: 36 }}>
                        <ThemedText style={{ fontWeight: "bold" }}>
                          {t("lessons.usage")}:
                        </ThemedText>{" "}
                        {item.usage}
                      </ThemedText>
                    </View>
                  )}
                  {!item.description && !item.usage && (
                    <ThemedText style={{ fontSize: 28, color: "#6b7280", textAlign: "center", lineHeight: 42 }}>
                      {t("lessons.no_description") || "Không có mô tả"}
                    </ThemedText>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </ModernCardExpandable>
        </Animated.View>
      </View>
    </View>
  );
};

// --- Expandable Kanji Card (Flip Card) ---
const ExpandableKanjiCard = ({
  item,
  index,
  onWrite,
}: {
  item: any;
  index: number;
  onWrite?: (char: string) => void;
}) => {
  const { t } = useTranslation();
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const meaning =
    item.meaning?.split("##")[0] || item.meaning || t("lessons.no_meaning");

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const toValue = isFlipped ? 0 : 1;
    setIsFlipped(!isFlipped);

    Animated.spring(flipAnim, {
      toValue,
      tension: 65,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });

  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
    opacity: frontOpacity,
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
    opacity: backOpacity,
  };

  return (
    <View style={{ width: "100%" }}>
      <View style={{ position: "relative", width: "100%", minHeight: 220 }}>
        {/* Front Side */}
        <Animated.View
          style={[
            {
              position: "absolute",
              width: "100%",
            },
            frontAnimatedStyle,
          ]}
          pointerEvents={isFlipped ? "none" : "auto"}
        >
          <ModernCardExpandable style={{ paddingTop: 24, paddingBottom: 24, paddingHorizontal: 20 }}>
            <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
              <View
                style={{ minHeight: 150, justifyContent: "center", alignItems: "center", paddingVertical: 12 }}
              >
                <View className="bg-amber-100 rounded-3xl p-8">
                  <ThemedText style={{ fontSize: 56, fontWeight: "bold", color: "#b45309", lineHeight: 66 }}>
                    {item.character}
                  </ThemedText>
                </View>
              </View>
            </TouchableOpacity>
          </ModernCardExpandable>
        </Animated.View>

        {/* Back Side */}
        <Animated.View
          style={[
            {
              position: "absolute",
              width: "100%",
            },
            backAnimatedStyle,
          ]}
          pointerEvents={isFlipped ? "auto" : "none"}
        >
          <ModernCardExpandable style={{ padding: 20 }}>
            <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
              <View style={{ minHeight: 180, justifyContent: "center", alignItems: "center", paddingVertical: 16 }}>
                <View style={{ width: "100%", paddingHorizontal: 16 }}>
                  <ThemedText style={{ fontSize: 40, fontWeight: "bold", color: "#92400e", textAlign: "center", flexShrink: 1, lineHeight: 52 }}>
                    {meaning}
                  </ThemedText>
                </View>
              </View>
            </TouchableOpacity>
          </ModernCardExpandable>
        </Animated.View>
      </View>
    </View>
  );
};

// --- Vocabulary Card (Simple display with audio) ---
const VocabularyCard = ({ item, index }: { item: any; index: number }) => {
  const meanings = (item.meanings || [])
    .map((m: any) => (typeof m === "string" ? m : m.meaning || m.text || ""))
    .filter(Boolean);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleAudio = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Ưu tiên dùng audioUrl từ BE
    if (item.audioUrl) {
      playAudio(item.audioUrl);
    } else {
      // Nếu không có audioUrl thì dùng text-to-speech
      const textToSpeak = item.wordJp || item.reading || "";
      if (textToSpeak) {
        if (isSpeaking) {
          Speech.stop();
          setIsSpeaking(false);
        } else {
          setIsSpeaking(true);
          Speech.speak(textToSpeak, {
            language: "ja-JP",
            onDone: () => {
              setIsSpeaking(false);
            },
            onStopped: () => {
              setIsSpeaking(false);
            },
            onError: () => {
              setIsSpeaking(false);
            },
          });
        }
      }
    }
  };

  // Cleanup speech when component unmounts
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  return (
    <ModernCard>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <View style={{ flex: 1, marginRight: 12, minWidth: 0 }}>
          <ThemedText 
            style={{ 
              fontSize: 30, 
              fontWeight: "bold", 
              color: "#111827", 
              lineHeight: Platform.OS === "android" ? 60 : 58,
              marginBottom: 8,
              marginTop: Platform.OS === "android" ? 4 : 2,
            }}
          >
            {item.wordJp}
          </ThemedText>
          {item.reading && (
            <ThemedText style={{ fontSize: 18, color: "#4b5563", marginBottom: 8, lineHeight: 24, marginTop: 4 }}>
              {item.reading}
            </ThemedText>
          )}
          {meanings.length > 0 && (
            <ThemedText style={{ fontSize: 18, color: "#374151", lineHeight: 24 }}>
              {meanings[0]}
            </ThemedText>
          )}
        </View>
        <TouchableOpacity
          onPress={handleAudio}
          className="bg-indigo-100 p-3 rounded-2xl"
          activeOpacity={0.7}
          style={{ marginLeft: 8, flexShrink: 0, alignSelf: "flex-start", marginTop: 4 }}
        >
          <Headphones size={22} color="#4f46e5" />
        </TouchableOpacity>
      </View>
    </ModernCard>
  );
};

// --- Grammar Card (Simple display for vertical list) ---
const GrammarListCard = ({ item, index }: { item: any; index: number }) => {
  const { t } = useTranslation();

  return (
    <ModernCard>
      <View style={{ flex: 1, minWidth: 0 }}>
        <ThemedText style={{ fontSize: 24, fontWeight: "bold", color: "#0891b2", marginBottom: 8, flexShrink: 1 }}>
          {item.title}
        </ThemedText>
        {item.description && (
          <ThemedText style={{ fontSize: 18, color: "#374151", marginBottom: 8, flexShrink: 1 }}>
            {item.description}
          </ThemedText>
        )}
        {item.usage && (
          <View className="bg-cyan-50 p-3 rounded-xl mt-2">
            <ThemedText style={{ fontSize: 16, color: "#155e75", flexShrink: 1 }}>
              <ThemedText style={{ fontWeight: "bold" }}>
                {t("lessons.usage")}:
              </ThemedText>{" "}
              {item.usage}
            </ThemedText>
          </View>
        )}
      </View>
    </ModernCard>
  );
};

// --- Kanji Card (Simple display for vertical list) ---
const KanjiListCard = ({
  item,
  index,
  onWrite,
  onPress,
}: {
  item: any;
  index: number;
  onWrite?: (char: string) => void;
  onPress?: () => void;
}) => {
  const { t } = useTranslation();

  const meaning =
    item.meaning?.split("##")[0] || item.meaning || t("lessons.no_meaning");

  const handleWrite = (e: any) => {
    e.stopPropagation();
    if (onWrite) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onWrite(item.character);
    }
  };

  const handleCardPress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  return (
    <TouchableOpacity onPress={handleCardPress} activeOpacity={0.7}>
      <ModernCard>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View className="bg-amber-100 rounded-2xl p-4 mr-3" style={{ flexShrink: 0 }}>
            <ThemedText style={{ fontSize: 60, fontWeight: "bold", color: "#b45309" }}>
              {item.character}
            </ThemedText>
          </View>
          <View style={{ flex: 1, minWidth: 0, marginRight: 8 }}>
            <ThemedText style={{ fontSize: 20, fontWeight: "bold", color: "#92400e", marginBottom: 4, flexShrink: 1 }}>
              {meaning}
            </ThemedText>
            {(item.onReading || item.kunReading) && (
              <ThemedText style={{ fontSize: 16, color: "#d97706", marginBottom: 4, flexShrink: 1 }}>
                {item.onReading} • {item.kunReading}
              </ThemedText>
            )}
            {item.strokeCount && (
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                <Sparkles size={14} color="#f59e0b" />
                <ThemedText style={{ fontSize: 14, color: "#d97706", marginLeft: 4, flexShrink: 1 }}>
                  {item.strokeCount} {t("lessons.stroke")}
                </ThemedText>
              </View>
            )}
          </View>
          {onWrite && (
            <TouchableOpacity
              onPress={handleWrite}
              className="bg-amber-500 p-3 rounded-xl shadow-md"
              activeOpacity={0.8}
              style={{ flexShrink: 0, marginLeft: 8 }}
            >
              <Pencil size={18} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </ModernCard>
    </TouchableOpacity>
  );
};

// --- Main Screen ---
const VocabularyListScreen = () => {
  const { t } = useTranslation();
  const { id, activityType, contentType } = useLocalSearchParams<{
    id?: string;
    activityType?: string;
    contentType?: string;
  }>();
  const { data: lessonData, isLoading } = useLesson(id || "");
  const lesson: any = lessonData?.data || {};

  // State for Kanji Writer Modal
  const [showKanjiWriterModal, setShowKanjiWriterModal] = useState(false);
  const [selectedKanji, setSelectedKanji] = useState<string>("");

  // State for Kanji Explanation Modal
  const [showKanjiExplanationModal, setShowKanjiExplanationModal] =
    useState(false);
  const [selectedKanjiItem, setSelectedKanjiItem] = useState<any>(null);

  // Ref for horizontal scroll view
  const horizontalScrollRef = useRef<ScrollView>(null);

  // State for progress tracking
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [progressContainerWidth, setProgressContainerWidth] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Determine content type: vocabulary (default), grammar, or kanji
  const contentTypeValue = contentType || "vocabulary";

  // Get data based on content type
  const getContentData = () => {
    switch (contentTypeValue) {
      case "grammar":
        return lesson.grama || lesson.grammar || [];
      case "kanji":
        return lesson.kanji || [];
      default:
        return lesson.voca || lesson.vocabulary || [];
    }
  };

  const contentData: any[] = getContentData();

  // Calculate card width and padding for centering
  const cardSpacing = 22; // Spacing between cards
  const cardWidth = width - 80;
  // Parent View has p-6 (24px padding each side)
  // To center card on screen: card should be at (width - cardWidth) / 2 from screen left
  // ScrollView content starts at parent padding (24px), so we need to adjust
  // Padding in ScrollView = (screen center position) - (parent padding)
  const screenCenterOffset = (width - cardWidth) / 2;
  const parentPadding = 24;
  const horizontalPadding = screenCenterOffset - parentPadding;

  // Calculate snap offsets - each card snaps to its position
  // Offset accounts for card width and spacing between cards
  const snapOffsets = contentData.map((_, index) => {
    // Each card is spaced by cardWidth + cardSpacing (except spacing after last card)
    return index * (cardWidth + cardSpacing);
  });

  // Get activity type title
  const getActivityTitle = () => {
    const baseTitle =
      contentTypeValue === "grammar"
        ? "Ngữ pháp"
        : contentTypeValue === "kanji"
          ? "Kanji"
          : "Từ vựng";

    switch (activityType) {
      case "learn":
        return contentTypeValue === "grammar"
          ? "Học ngữ pháp"
          : contentTypeValue === "kanji"
            ? "Học Kanji"
            : "Học từ mới";
      case "match":
        return "Trò chơi ghép thẻ";
      case "test":
        return contentTypeValue === "grammar"
          ? "Kiểm tra ngữ pháp"
          : contentTypeValue === "kanji"
            ? "Kiểm tra Kanji"
            : "Kiểm tra từ mới";
      case "reflex":
        return "Luyện phản xạ";
      default:
        return `${baseTitle} trong bài`;
    }
  };

  // Get banner text
  const getBannerText = () => {
    switch (contentTypeValue) {
      case "grammar":
        return "Ngữ pháp trong bài";
      case "kanji":
        return "Kanji trong bài";
      default:
        return "Từ vựng trong bài";
    }
  };

  // Get empty message
  const getEmptyMessage = () => {
    switch (contentTypeValue) {
      case "grammar":
        return t("lessons.no_grammar") || "Không có ngữ pháp nào";
      case "kanji":
        return t("lessons.no_kanji") || "Không có Kanji nào";
      default:
        return t("lessons.no_vocabulary") || "Không có từ vựng nào";
    }
  };

  // Handle Kanji writing
  const handleWriteKanji = (character: string) => {
    setSelectedKanji(character);
    setShowKanjiWriterModal(true);
  };

  const handleCloseKanjiWriter = () => {
    setShowKanjiWriterModal(false);
    setSelectedKanji("");
  };

  // Handle Kanji explanation
  const handleShowKanjiExplanation = (item: any) => {
    setSelectedKanjiItem(item);
    setShowKanjiExplanationModal(true);
  };

  const handleCloseKanjiExplanation = () => {
    setShowKanjiExplanationModal(false);
    setSelectedKanjiItem(null);
  };

  // Reset progress when content data changes
  useEffect(() => {
    setCurrentCardIndex(0);
    progressAnim.setValue(0);
  }, [contentTypeValue, contentData.length, progressAnim]);

  // Handle scroll to update current card index
  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    // Find the closest snap offset
    let closestIndex = 0;
    let minDistance = Infinity;

    snapOffsets.forEach((offset, index) => {
      const distance = Math.abs(scrollPosition - offset);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    setCurrentCardIndex(closestIndex);
  };

  // Handle scroll end to update current index after snap
  const handleScrollEnd = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    let closestIndex = 0;
    let minDistance = Infinity;

    snapOffsets.forEach((offset, index) => {
      const distance = Math.abs(scrollPosition - offset);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    setCurrentCardIndex(closestIndex);
  };

  // Animate progress bar width when the active card changes
  useEffect(() => {
    if (progressContainerWidth === 0 || contentData.length === 0) {
      progressAnim.setValue(0);
      return;
    }

    const totalItems = contentData.length;
    const targetWidth =
      ((currentCardIndex + 1) / totalItems) * progressContainerWidth;

    Animated.timing(progressAnim, {
      toValue: targetWidth,
      duration: 280,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [
    currentCardIndex,
    contentData.length,
    progressContainerWidth,
    progressAnim,
  ]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="p-6">
          <View className="h-8 bg-gray-200 rounded-3xl mb-6 w-3/4" />
          <View className="h-32 bg-gray-100 rounded-3xl mb-4" />
          <View className="h-32 bg-gray-100 rounded-3xl mb-4" />
          <View className="h-32 bg-gray-100 rounded-3xl" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <LinearGradient
        colors={["#79B4C4", "#85C3C3", "#9BC7B9"]}
        style={{ flex: 1 }}
      >
        {/* Sticky Header */}
        <View className="bg-white border-b border-gray-100 px-6 py-4 flex-row rounded-b-3xl items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color="#6b7280" />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: "center" }}>
            <ThemedText style={{ fontSize: 20, fontWeight: "bold", color: "#1f2937" }}>
              {getActivityTitle()}
            </ThemedText>
          </View>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-6 pb-32">
            {/* === EXPANDABLE CONTENT CARDS (Horizontal Scroll) === */}
            <View className="mb-4">
              <ScrollView
                ref={horizontalScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-row rounded-3xl"
                {...(snapOffsets.length > 0 && { snapToOffsets: snapOffsets })}
                decelerationRate="fast"
                contentContainerStyle={{
                  paddingLeft: horizontalPadding,
                  paddingRight: horizontalPadding,
                }}
                pagingEnabled={false}
                onScroll={handleScroll}
                onMomentumScrollEnd={handleScrollEnd}
                scrollEventThrottle={16}
              >
                {contentData.map((item: any, i: number) => (
                  <View
                    key={i}
                    style={{
                      width: cardWidth,
                      marginRight: i < contentData.length - 1 ? cardSpacing : 0,
                    }}
                  >
                    {contentTypeValue === "grammar" ? (
                      <ExpandableGrammarCard item={item} index={i} />
                    ) : contentTypeValue === "kanji" ? (
                      <ExpandableKanjiCard
                        item={item}
                        index={i}
                        onWrite={handleWriteKanji}
                      />
                    ) : (
                      <ExpandableVocabularyCard item={item} index={i} />
                    )}
                  </View>
                ))}
              </ScrollView>

              {/* Progress Bar */}
              {contentData.length > 0 && (
                <View
                  className="items-center justify-center mt-6 mb-4"
                  style={{ paddingHorizontal: 24 }}
                >
                  <View
                    style={{
                      width: "100%",
                      maxWidth: width - 48,
                      height: 4,
                      borderRadius: 999,
                      backgroundColor: "rgba(126, 214, 255, 0.35)",
                      overflow: "hidden",
                    }}
                    onLayout={(event) => {
                      const newWidth = event.nativeEvent.layout.width;
                      if (newWidth !== progressContainerWidth) {
                        setProgressContainerWidth(newWidth);
                      }
                    }}
                  >
                    <Animated.View
                      style={{
                        height: "100%",
                        width: progressAnim,
                        borderRadius: 999,
                        overflow: "hidden",
                      }}
                    >
                      <LinearGradient
                        colors={["#3ce7ff", "#1fa5ff"]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={{ flex: 1 }}
                      />
                    </Animated.View>
                  </View>
                </View>
              )}
            </View>

            {/* === ACTIVITY BLOCKS === */}
            <View className="mb-6">
              <View
                className="flex-row flex-wrap justify-between"
                style={{ gap: 12 }}
              >
                {/* Học từ mới - Top Left */}
                <TouchableOpacity
                  onPress={() => {
                    Haptics.selectionAsync();
                    router.push({
                      pathname: "/(app)/content-list/flashcard",
                      params: {
                        id,
                        contentType: contentTypeValue,
                      },
                    });
                  }}
                  className="rounded-3xl p-6 shadow-lg"
                  style={{
                    width: (width - 48 - 12) / 2,
                    backgroundColor: "#E0F2FE",
                  }}
                >
                  <View className="items-center mb-3">
                    <View
                      className="rounded-full items-center justify-center"
                      style={{
                        width: 80,
                        height: 80,
                        backgroundColor: "#BAE6FD",
                      }}
                    >
                      <ThemedText style={{ fontSize: 36 }}>🏴‍☠️</ThemedText>
                    </View>
                  </View>
                  <ThemedText style={{ textAlign: "center", fontSize: 16, fontWeight: "bold", color: "#1e40af" }}>
                    Học từ mới
                  </ThemedText>
                </TouchableOpacity>

                {/* Kiểm tra từ mới - Bottom Left */}
                <TouchableOpacity
                  onPress={() => {
                    Haptics.selectionAsync();
                    router.setParams({ activityType: "test" });
                  }}
                  className="rounded-3xl p-6 shadow-lg"
                  style={{
                    width: (width - 48 - 12) / 2,
                    backgroundColor: "#FEF3C7",
                  }}
                >
                  <View className="items-center mb-3">
                    <View
                      className="rounded-full items-center justify-center"
                      style={{
                        width: 80,
                        height: 80,
                        backgroundColor: "#FDE68A",
                      }}
                    >
                      <ThemedText style={{ fontSize: 36 }}>🥷</ThemedText>
                    </View>
                  </View>
                  <ThemedText style={{ textAlign: "center", fontSize: 16, fontWeight: "bold", color: "#92400e" }}>
                    Kiểm tra từ mới
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            {/* === BANNER === */}
            <View className="mb-2" style={{ zIndex: 10, width: '85%', alignSelf: 'center' }}>
              {/* Lớp ngoài */}
              <View
              >
                {/* Ốc vít bên trái */}
                <View
                  style={{
                    position: 'absolute',
                    left: 30,
                    top: '70%',
                    transform: [{ translateY: -20 }],
                    width: 20,
                    height: 20,
                    borderRadius: 20,
                    backgroundColor: '#F5E6B3',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                  }}
                >
                  <View
                    style={{
                      width: 22,
                      height: 4,
                      backgroundColor: '#FCD34D',
                      transform: [{ rotate: '45deg' }],
                    }}
                  />
                </View>
                
                {/* Ốc vít bên phải */}
                <View
                  style={{
                    position: 'absolute',
                    right: 30,
                    top: '70%',
                    transform: [{ translateY: -20 }],
                    width: 20,
                    height: 20,
                    borderRadius: 20,
                    backgroundColor: '#F5E6B3',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex:10
                  }}
                >
               <View
                    style={{
                      width: 22,
                      height: 4,
                      backgroundColor: '#FCD34D',
                      transform: [{ rotate: '45deg' }],
                    }}
                  />
                </View>

                {/* Lớp trong */}
                <View
                  style={{
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    borderBottomLeftRadius: 6,
                    borderBottomRightRadius: 6,
                    backgroundColor: "#FCD34D",
                    paddingVertical: 13,
                    paddingHorizontal: 24,
                    alignItems: "center",
                  }}
                >
                  <ThemedText style={{ fontSize: 18, fontWeight: "bold", color: "#ffffff" }}>
                    {getBannerText()}
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* === CONTENT LIST === */}
            <View
              className="rounded-3xl p-4"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.3)",
                borderWidth: 4,
                borderColor: "rgba(255, 255, 255, 0.5)",
                marginTop: -30,
                paddingTop: 40,
              }}
            >
              {contentData.length === 0 ? (
                <View className="items-center justify-center py-20">
                  <ThemedText style={{ color: "#6b7280", fontSize: 18 }}>
                    {getEmptyMessage()}
                  </ThemedText>
                </View>
              ) : (
                contentData.map((item: any, i: number) => {
                  if (contentTypeValue === "vocabulary") {
                    return <VocabularyCard key={i} item={item} index={i} />;
                  } else if (contentTypeValue === "grammar") {
                    return <GrammarListCard key={i} item={item} index={i} />;
                  } else if (contentTypeValue === "kanji") {
                    return (
                      <KanjiListCard
                        key={i}
                        item={item}
                        index={i}
                        onWrite={handleWriteKanji}
                        onPress={() => handleShowKanjiExplanation(item)}
                      />
                    );
                  }
                  return null;
                })
              )}
            </View>
          </View>
        </ScrollView>

        {/* Kanji Writer Modal */}
        <Modal
          visible={showKanjiWriterModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={handleCloseKanjiWriter}
        >
          <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1">
              {/* Modal Header */}
              <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
                <ThemedText style={{ fontSize: 20, fontWeight: "bold", color: "#1f2937" }}>
                  {t("lessons.practice_writing") || "Luyện viết Kanji"}
                </ThemedText>
                <TouchableOpacity
                  onPress={handleCloseKanjiWriter}
                  className="p-2 rounded-full bg-gray-100"
                  activeOpacity={0.7}
                >
                  <X size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              {/* Kanji Writer Content */}
              <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 24 }}
                showsVerticalScrollIndicator={false}
              >
                {selectedKanji && (
                  <KanjiWriter
                    character={selectedKanji}
                    mode="practice"
                    onComplete={(totalMistakes) => {
                      console.log(
                        `Completed writing ${selectedKanji} with ${totalMistakes} mistakes`
                      );
                      Haptics.notificationAsync(
                        Haptics.NotificationFeedbackType.Success
                      );
                    }}
                    onCorrectStroke={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    onMistake={() => {
                      Haptics.notificationAsync(
                        Haptics.NotificationFeedbackType.Error
                      );
                    }}
                  />
                )}
              </ScrollView>
            </View>
          </SafeAreaView>
        </Modal>

        {/* Kanji Explanation Modal */}
        <Modal
          visible={showKanjiExplanationModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={handleCloseKanjiExplanation}
        >
          <SafeAreaView className="flex-1 bg-gray-50">
            <View className="flex-1">
              {/* Modal Header */}
              <View
                className="bg-white border-b border-gray-100 px-6 py-5 flex-row items-center justify-between"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <ThemedText style={{ fontSize: 24, fontWeight: "bold", color: "#111827" }}>
                  {t("lessons.kanji_explanation") || "Giải thích Kanji"}
                </ThemedText>
                <TouchableOpacity
                  onPress={handleCloseKanjiExplanation}
                  className="p-2 rounded-full bg-gray-100 active:bg-gray-200"
                  activeOpacity={0.7}
                >
                  <X size={22} color="#6b7280" />
                </TouchableOpacity>
              </View>

              {/* Kanji Explanation Content */}
              <ScrollView
                className="flex-1"
                contentContainerStyle={{
                  padding: 20,
                  paddingBottom: 40,
                }}
                showsVerticalScrollIndicator={false}
              >
                {selectedKanjiItem && (
                  <View className="space-y-6">
                    {/* Kanji Character */}
                    <View className="items-center justify-center py-6">
                      <LinearGradient
                        colors={["#FEF3C7", "#FDE68A"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                          borderRadius: 24,
                          padding: 48,
                          alignItems: "center",
                          justifyContent: "center",
                          shadowColor: "#f59e0b",
                          shadowOffset: { width: 0, height: 8 },
                          shadowOpacity: 0.2,
                          shadowRadius: 20,
                          elevation: 8,
                          minWidth: 180,
                          minHeight: 180,
                        }}
                      >
                        <ThemedText
                          style={{ fontSize: 96, fontWeight: "bold", color: "#b45309" }}
                        >
                          {selectedKanjiItem.character}
                        </ThemedText>
                      </LinearGradient>
                    </View>

                    {/* Kanji Image */}
                    {(selectedKanjiItem.imageUrl ||
                      selectedKanjiItem.image ||
                      selectedKanjiItem.imgUrl) && (
                      <View className="items-center justify-center">
                        <View
                          style={{
                            borderRadius: 20,
                            overflow: "hidden",
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.1,
                            shadowRadius: 12,
                            elevation: 6,
                            backgroundColor: "#fff",
                            padding: 8,
                          }}
                        >
                          <Image
                            source={{
                              uri:
                                selectedKanjiItem.imageUrl ||
                                selectedKanjiItem.image ||
                                selectedKanjiItem.imgUrl ||
                                "",
                            }}
                            style={{
                              width: width - 80,
                              height: (width - 80) * 0.6,
                              borderRadius: 16,
                            }}
                            contentFit="cover"
                            transition={200}
                          />
                        </View>
                      </View>
                    )}

                    {/* Explanation Meaning */}
                    {selectedKanjiItem.explanationMeaning &&
                      (() => {
                        const sections = selectedKanjiItem.explanationMeaning
                          .split("##")
                          .map((s: string) => s.trim())
                          .filter((s: string) => s.length > 0);
                        return (
                          <View
                            className="bg-white rounded-3xl"
                            style={{
                              shadowColor: "#000",
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.08,
                              shadowRadius: 12,
                              elevation: 5,
                              overflow: "hidden",
                            }}
                          >
                            <View style={{ padding: 24 }}>
                              {sections.map(
                                (section: string, index: number) => (
                                  <View
                                    key={index}
                                    style={{
                                      marginBottom:
                                        index < sections.length - 1 ? 20 : 0,
                                    }}
                                  >
                                    <ThemedText
                                      style={{
                                        color: "#1f2937",
                                        fontSize: 16,
                                        lineHeight: 28,
                                        letterSpacing: 0.2,
                                      }}
                                    >
                                      {section}
                                    </ThemedText>
                                  </View>
                                )
                              )}
                            </View>
                          </View>
                        );
                      })()}
                  </View>
                )}
              </ScrollView>
            </View>
          </SafeAreaView>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default VocabularyListScreen;
