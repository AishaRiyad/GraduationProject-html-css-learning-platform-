// pages/LessonViewer6Mobile.js

import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
  ActivityIndicator,
  Dimensions,
  Alert,
  Switch,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { WebView } from "react-native-webview";
import { Video, Audio, AVPlaybackStatusSuccess } from "expo-av";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system";

// ✔ عدل المسار حسب مكان كومبوننت الكويز بالموبايل
import Quiz from "../components/Quiz";

const { width } = Dimensions.get("window");
const API = "http://10.0.2.2:5000"; // على الأندرويد بدل localhost

export default function LessonViewer6Mobile() {
  const navigation = useNavigation();
  const route = useRoute();
  const lessonIdParam = route?.params?.lessonId ?? 32;

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔊 TTS (AI)
  const [ttsText, setTtsText] = useState("");
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsAudioUri, setTtsAudioUri] = useState(null);
  const ttsSoundRef = useRef(null);

  // 🖼️ Image playground
  const [imageUrl, setImageUrl] = useState("");
  const [previewSrc, setPreviewSrc] = useState("");
  const [previewError, setPreviewError] = useState("");
  const [rounded, setRounded] = useState(true);
  const [borderVisible, setBorderVisible] = useState(true);
  const [grayscale, setGrayscale] = useState(false);

  // 🎧 Audio playground
  const [autoplay, setAutoplay] = useState(false);
  const [loop, setLoop] = useState(false);
  const [muted, setMuted] = useState(false);
  const audioSoundRef = useRef(null);

  // 🎥 Video playground
  const [videoSrc, setVideoSrc] = useState(
    "https://www.w3schools.com/html/mov_bbb.mp4"
  );
  const [videoAutoplay, setVideoAutoplay] = useState(false);
  const [videoLoop, setVideoLoop] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [videoControls, setVideoControls] = useState(true);
  const videoRef = useRef(null);

  // 🌐 Iframe (WebView)
  const [iframeType, setIframeType] = useState("youtube");
  const [iframeUrl, setIframeUrl] = useState(
    "https://www.youtube.com/embed/pQN-pnXPaVg"
  );
  const [showIframe, setShowIframe] = useState(false);

  // 🧠 Quiz
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [passed, setPassed] = useState(false);

  // 🔝 Tabs
  const [activeTab, setActiveTab] = useState("overview");

  // =========================
  // 🧲 Fetch Lesson Content
  // =========================
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const res = await axios.get(`${API}/api/lessons/content/32`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLesson(res.data.content);
      } catch (e) {
        console.error("❌ Failed to load lesson 6", e);
        Alert.alert("Error", "Failed to load lesson 6");
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [lessonIdParam]);

  // =========================
  // 🎧 Audio playground (HTML <audio> demo)
  // =========================
  const setupAudioSound = async () => {
    if (audioSoundRef.current) {
      await audioSoundRef.current.unloadAsync();
      audioSoundRef.current = null;
    }
    const { sound } = await Audio.Sound.createAsync(
      {
        uri: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      },
      {
        shouldPlay: autoplay,
        isMuted: muted,
        isLooping: loop,
      }
    );
    audioSoundRef.current = sound;
  };

  useEffect(() => {
    (async () => {
      await Audio.setAudioModeAsync({
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
      });
      await setupAudioSound();
    })();

    return () => {
      if (audioSoundRef.current) {
        audioSoundRef.current.unloadAsync();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (async () => {
      if (audioSoundRef.current) {
        await audioSoundRef.current.setIsMutedAsync(muted);
        await audioSoundRef.current.setIsLoopingAsync(loop);
        if (autoplay) {
          await audioSoundRef.current.replayAsync();
        }
      }
    })();
  }, [autoplay, loop, muted]);

  const handlePlayAudioDemo = async () => {
    try {
      if (audioSoundRef.current) {
        await audioSoundRef.current.replayAsync();
      } else {
        await setupAudioSound();
        await audioSoundRef.current.replayAsync();
      }
    } catch (err) {
      console.error("Audio play error", err);
    }
  };

  // =========================
  // 🖼️ Image preview
  // =========================
  const handlePreview = () => {
    if (!imageUrl.trim()) {
      setPreviewSrc(
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400"
      );
      setPreviewError("");
      return;
    }

    // في الموبايل ما بنقدر نجرّب الرابط بنفس طريقة الويب
    // رح نفترض الرابط صحيح ونعرضه، ولو ما اشتغل رح تظهر صورة مكسورة فقط
    setPreviewSrc(imageUrl.trim());
    setPreviewError("");
  };

  const buildImgHtmlCode = () => {
    const styleArr = [
      rounded ? "border-radius:20px;" : "",
      borderVisible ? "border:4px solid #FACC15;" : "",
      grayscale ? "filter:grayscale(100%);" : "",
      "width:400px;",
      "height:250px;",
      "object-fit:cover;",
    ]
      .filter(Boolean)
      .join(" ");
    return `<img src="${previewSrc}" alt="Preview Image"${
      styleArr ? ` style="${styleArr}"` : ""
    } />`;
  };

  const copyImgHtmlToClipboard = async () => {
    const html = buildImgHtmlCode();
    await Clipboard.setStringAsync(html);
    Alert.alert("Copied", "HTML code copied!");
  };

  // =========================
  // 🎥 Video playground
  // =========================
  const handleVideoStatusUpdate = (status) => {
    if (!status.isLoaded) return;
  };

  useEffect(() => {
    (async () => {
      if (videoRef.current) {
        await videoRef.current.setIsMutedAsync(videoMuted);
        await videoRef.current.setIsLoopingAsync(videoLoop);
        if (videoAutoplay) {
          const status = await videoRef.current.getStatusAsync();
        if (status && status.isLoaded) {
  await videoRef.current.replayAsync();
}

        }
      }
    })();
  }, [videoMuted, videoLoop, videoAutoplay, videoSrc]);

  const buildVideoHtmlCode = () => {
    return `<video width="400"${
      videoControls ? " controls" : ""
    }${videoAutoplay ? " autoplay" : ""}${videoLoop ? " loop" : ""}${
      videoMuted ? " muted" : ""
    } poster="preview.jpg">
  <source src="${videoSrc}" type="video/mp4">
  Your browser does not support the video tag.
</video>`;
  };

  const copyVideoHtmlToClipboard = async () => {
    await Clipboard.setStringAsync(buildVideoHtmlCode());
    Alert.alert("Copied", "HTML code copied!");
  };

  // =========================
  // 🌐 iframe (WebView) HTML code
  // =========================
  const buildIframeHtmlCode = () => {
    return `<iframe width="560" height="315" src="${iframeUrl}" title="${iframeType} embed" frameborder="0" allowfullscreen></iframe>`;
  };

  const copyIframeHtmlToClipboard = async () => {
    await Clipboard.setStringAsync(buildIframeHtmlCode());
    Alert.alert("Copied", "HTML code copied!");
  };

  // =========================
  // 🤖 AI TTS
  // =========================
  const generateSpeech = async () => {
    if (!ttsText.trim()) return;
    setTtsLoading(true);
    try {
      const res = await axios.post(`${API}/api/ai-local/text-to-speech`, {
        text: ttsText,
        asBase64: true,
      });

      const base64 = res.data.audioBase64;
      const fileUri = FileSystem.cacheDirectory + "tts-lesson6.mp3";
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      setTtsAudioUri(fileUri);
      Alert.alert("Done", "Audio generated successfully!");
    } catch (err) {
      console.error("❌ TTS Error:", err.message);
      Alert.alert("Error", "Failed to generate speech");
    } finally {
      setTtsLoading(false);
    }
  };

  const playTtsAudio = async () => {
    if (!ttsAudioUri) return;
    try {
      if (ttsSoundRef.current) {
        await ttsSoundRef.current.unloadAsync();
        ttsSoundRef.current = null;
      }
      const { sound } = await Audio.Sound.createAsync({ uri: ttsAudioUri });
      ttsSoundRef.current = sound;
      await sound.playAsync();
    } catch (err) {
      console.error("TTS play error", err);
    }
  };

  useEffect(() => {
    return () => {
      if (ttsSoundRef.current) {
        ttsSoundRef.current.unloadAsync();
      }
    };
  }, []);

  // =========================
  // 🧠 Quiz section ref
  // =========================
  const quizSection =
    lesson && Array.isArray(lesson.sections)
      ? lesson.sections.find((s) => s.id === "quiz")
      : null;

  // =========================
  // 🧭 Tabs Setup
  // =========================
  const buildTabs = () => {
    if (!lesson) return [];

    const tabs = [
      { key: "overview", label: "Intro Video" },
      // then dynamic sections
    ];

    lesson.sections.forEach((sec) => {
      tabs.push({
        key: sec.id,
        label: sec.heading,
      });
    });

    // quiz tab (مع أنه هو موجود كـ section id="quiz"، لكن نخليه برضه واضح)
    if (quizSection) {
      const exists = tabs.find((t) => t.key === "quiz");
      if (!exists) {
        tabs.push({ key: "quiz", label: "Quiz" });
      }
    }

    return tabs;
  };

  const tabs = buildTabs();

  if (loading || !lesson) {
    return (
      <LinearGradient
        colors={["#FFFBEA", "#FFF3C4"]}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color="#FACC15" />
        <Text style={styles.loadingText}>Loading lesson...</Text>
      </LinearGradient>
    );
  }

  // =========================
  // 🔄 Render content per tab
  // =========================
  const renderTabContent = () => {
    if (activeTab === "overview") {
      // نفس Intro Video Section لكن موبايل
      return (
        <View style={styles.introContainer}>
          <View style={styles.introVideoWrapper}>
            <Video
              ref={videoRef}
              style={styles.introVideo}
              source={require("../assets/multimedia-intro.mp4")}
              isMuted
              isLooping
              shouldPlay
              resizeMode="cover"
              onPlaybackStatusUpdate={handleVideoStatusUpdate}
            />
            <LinearGradient
              colors={["#000000b3", "#00000080", "transparent"]}
              style={styles.introOverlay}
            />
            <View style={styles.introTextContainer}>
              <Text style={styles.introTitle}>
                🎬 {lesson.title}
              </Text>
              <Text style={styles.introDescription}>
                {lesson.description}
              </Text>
            </View>
          </View>
        </View>
      );
    }

    // نجيب السيكشن الحالي
    const sec = lesson.sections.find((s) => s.id === activeTab);

    if (!sec && activeTab !== "quiz") {
      return (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Section not found</Text>
        </View>
      );
    }

    // intro (المقدمة النصية)
    if (sec?.id === "intro") {
      return (
        <View style={styles.sectionContainer}>
          <LinearGradient
            colors={["#FFF9C4", "#FFF3E0", "#F3E5F5"]}
            style={styles.introCard}
          >
            <View style={styles.introCardHeader}>
              <View style={styles.introIconBox}>
                <Text style={styles.introIcon}>📚</Text>
              </View>
              <Text style={styles.introHeading}>{sec.heading}</Text>
            </View>
            <Text style={styles.sectionContent}>{sec.content}</Text>
            <Text style={styles.threeDots}>• • •</Text>
          </LinearGradient>
        </View>
      );
    }

    // images playground
    if (sec?.id === "images") {
      return (
        <ScrollView style={styles.sectionScroll} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={styles.sectionContainer}>
            <LinearGradient
              colors={["#FFF9C4", "#F3E5F5"]}
              style={styles.imagesCard}
            >
              <Text style={styles.sectionTitle}>🖼️ {sec.heading}</Text>
              <Text style={styles.sectionContent}>{sec.content}</Text>
              {sec.code && (
                <View style={styles.codeBlock}>
                  <Text style={styles.codeText}>{sec.code}</Text>
                </View>
              )}

              {/* إدخال الرابط */}
              <View style={styles.imageInputRow}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter image URL or leave empty for default"
                  value={imageUrl}
                  onChangeText={setImageUrl}
                />
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handlePreview}
                >
                  <Text style={styles.primaryButtonText}>Show Image</Text>
                </TouchableOpacity>
              </View>

              {previewError ? (
                <Text style={styles.errorText}>{previewError}</Text>
              ) : previewSrc ? (
                <>
                  <Text style={styles.previewLabel}>📷 Preview</Text>
                  <View style={styles.previewImageWrapper}>
                    <Image
                      source={{ uri: previewSrc }}
                      style={[
                        styles.previewImage,
                        rounded ? { borderRadius: 20 } : { borderRadius: 6 },
                        borderVisible
                          ? { borderWidth: 4, borderColor: "#FACC15" }
                          : { borderWidth: 0 },
                        grayscale ? { opacity: 0.6 } : {},
                      ]}
                      resizeMode="cover"
                    />
                  </View>

                  {/* الأزرار */}
                  <View style={styles.toggleRow}>
                    <TouchableOpacity
                      style={styles.toggleButtonPurple}
                      onPress={() => setRounded(!rounded)}
                    >
                      <Text style={styles.toggleButtonTextPurple}>
                        {rounded ? "🔳 Square" : "🔘 Rounded"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.toggleButtonYellow}
                      onPress={() => setBorderVisible(!borderVisible)}
                    >
                      <Text style={styles.toggleButtonTextYellow}>
                        {borderVisible ? "❌ Hide Border" : "🟨 Show Border"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.toggleButtonGray}
                      onPress={() => setGrayscale(!grayscale)}
                    >
                      <Text style={styles.toggleButtonTextGray}>
                        {grayscale ? "🌈 Normal" : "⚫ Grayscale"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* كود HTML */}
                  <View style={styles.liveCodeBox}>
                    <View style={styles.liveCodeHeader}>
                      <Text style={styles.liveCodeTitle}>💻 Live HTML Code</Text>
                      <TouchableOpacity
                        style={styles.copyButton}
                        onPress={copyImgHtmlToClipboard}
                      >
                        <Text style={styles.copyButtonText}>Copy</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.liveCodeText}>{buildImgHtmlCode()}</Text>
                  </View>
                </>
              ) : null}
            </LinearGradient>
          </View>
        </ScrollView>
      );
    }

    // audio playground
    if (sec?.id === "audio") {
      return (
        <ScrollView style={styles.sectionScroll} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={styles.sectionContainer}>
            <LinearGradient
              colors={["#E8F5E9", "#FFFDE7"]}
              style={styles.audioCard}
            >
              <Text style={styles.audioTitle}>🎧 {sec.heading}</Text>
              <Text style={styles.sectionContent}>
                To include sound in your website, you can use the <Text style={styles.codeInline}>&lt;audio&gt;</Text> tag. Try enabling features like{" "}
                <Text style={styles.bold}>autoplay</Text>,{" "}
                <Text style={styles.bold}>loop</Text>, or{" "}
                <Text style={styles.bold}>muted</Text> to see how the audio behavior changes below.
              </Text>

              {/* الخيارات */}
              <View style={styles.switchRow}>
                <View style={styles.switchItem}>
                  <Switch
                    value={autoplay}
                    onValueChange={setAutoplay}
                    trackColor={{ true: "#66BB6A", false: "#C8E6C9" }}
                  />
                  <Text style={styles.switchLabel}>Autoplay</Text>
                </View>
                <View style={styles.switchItem}>
                  <Switch
                    value={loop}
                    onValueChange={setLoop}
                    trackColor={{ true: "#66BB6A", false: "#C8E6C9" }}
                  />
                  <Text style={styles.switchLabel}>Loop</Text>
                </View>
                <View style={styles.switchItem}>
                  <Switch
                    value={muted}
                    onValueChange={setMuted}
                    trackColor={{ true: "#66BB6A", false: "#C8E6C9" }}
                  />
                  <Text style={styles.switchLabel}>Muted</Text>
                </View>
              </View>

              {/* زر تشغيل الصوت */}
              <TouchableOpacity
                style={styles.primaryButtonGreen}
                onPress={handlePlayAudioDemo}
              >
                <Text style={styles.primaryButtonGreenText}>Play Audio</Text>
              </TouchableOpacity>

              {/* كود HTML */}
              <View style={styles.liveCodeBoxGreen}>
                <View style={styles.liveCodeHeader}>
                  <Text style={styles.liveCodeTitleGreen}>💻 Live HTML Code</Text>
                  <TouchableOpacity
                    style={styles.copyButtonGreen}
                    onPress={async () => {
                      const html = `<audio controls${
                        autoplay ? " autoplay" : ""
                      }${loop ? " loop" : ""}${muted ? " muted" : ""}>
  <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" type="audio/mpeg">
  <source src="song.ogg" type="audio/ogg">
  Your browser does not support the audio tag.
</audio>`;
                      await Clipboard.setStringAsync(html);
                      Alert.alert("Copied", "HTML code copied!");
                    }}
                  >
                    <Text style={styles.copyButtonText}>Copy</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.liveCodeTextGreen}>
{`<audio controls${autoplay ? " autoplay" : ""}${loop ? " loop" : ""}${muted ? " muted" : ""}>
  <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" type="audio/mpeg">
  <source src="song.ogg" type="audio/ogg">
  Your browser does not support the audio tag.
</audio>`}
                </Text>
              </View>
            </LinearGradient>
          </View>
        </ScrollView>
      );
    }

    // video playground
    if (sec?.id === "video") {
      return (
        <ScrollView style={styles.sectionScroll} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={styles.sectionContainer}>
            <LinearGradient
              colors={["#FFF8E1", "#FFF3E0"]}
              style={styles.videoCard}
            >
              <Text style={styles.videoTitle}>🎥 {sec.heading}</Text>
              <Text style={styles.sectionContent}>{sec.content}</Text>

              {/* خيارات التحكم */}
              <View style={styles.switchRow}>
                <View style={styles.switchItem}>
                  <Switch
                    value={videoControls}
                    onValueChange={setVideoControls}
                    trackColor={{ true: "#FF9800", false: "#FFE0B2" }}
                  />
                  <Text style={styles.switchLabel}>Controls</Text>
                </View>
                <View style={styles.switchItem}>
                  <Switch
                    value={videoAutoplay}
                    onValueChange={setVideoAutoplay}
                    trackColor={{ true: "#FF9800", false: "#FFE0B2" }}
                  />
                  <Text style={styles.switchLabel}>Autoplay</Text>
                </View>
                <View style={styles.switchItem}>
                  <Switch
                    value={videoLoop}
                    onValueChange={setVideoLoop}
                    trackColor={{ true: "#FF9800", false: "#FFE0B2" }}
                  />
                  <Text style={styles.switchLabel}>Loop</Text>
                </View>
                <View style={styles.switchItem}>
                  <Switch
                    value={videoMuted}
                    onValueChange={setVideoMuted}
                    trackColor={{ true: "#FF9800", false: "#FFE0B2" }}
                  />
                  <Text style={styles.switchLabel}>Muted</Text>
                </View>
              </View>

              {/* اختيار الفيديو */}
              <View style={styles.videoButtonsRow}>
                <TouchableOpacity
                  style={[
                    styles.videoSampleButton,
                    videoSrc.includes("bbb") && styles.videoSampleButtonActive,
                  ]}
                  onPress={() =>
                    setVideoSrc("https://www.w3schools.com/html/mov_bbb.mp4")
                  }
                >
                  <Text
                    style={[
                      styles.videoSampleButtonText,
                      videoSrc.includes("bbb") && styles.videoSampleButtonTextActive,
                    ]}
                  >
                    Sample 1
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.videoSampleButton,
                    videoSrc.includes("movie") && styles.videoSampleButtonActive,
                  ]}
                  onPress={() =>
                    setVideoSrc("https://www.w3schools.com/html/movie.mp4")
                  }
                >
                  <Text
                    style={[
                      styles.videoSampleButtonText,
                      videoSrc.includes("movie") &&
                        styles.videoSampleButtonTextActive,
                    ]}
                  >
                    Sample 2
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.videoSampleButton,
                    videoSrc.includes("sample_640") &&
                      styles.videoSampleButtonActive,
                  ]}
                  onPress={() =>
                    setVideoSrc(
                      "https://filesamples.com/samples/video/mp4/sample_640x360.mp4"
                    )
                  }
                >
                  <Text
                    style={[
                      styles.videoSampleButtonText,
                      videoSrc.includes("sample_640") &&
                        styles.videoSampleButtonTextActive,
                    ]}
                  >
                    Sample 3
                  </Text>
                </TouchableOpacity>
              </View>

              {/* الفيديو نفسه */}
              <View style={styles.videoWrapper}>
                <Video
                  ref={videoRef}
                  source={{ uri: videoSrc }}
                  style={styles.videoPlayer}
                  resizeMode="contain"
                  useNativeControls={videoControls}
                  isLooping={videoLoop}
                  isMuted={videoMuted}
                  shouldPlay={videoAutoplay}
                  onPlaybackStatusUpdate={handleVideoStatusUpdate}
                />
              </View>

              {/* كود HTML */}
              <View style={styles.liveCodeBoxYellow}>
                <View style={styles.liveCodeHeader}>
                  <Text style={styles.liveCodeTitleOrange}>
                    💻 Live HTML Code
                  </Text>
                  <TouchableOpacity
                    style={styles.copyButtonOrange}
                    onPress={copyVideoHtmlToClipboard}
                  >
                    <Text style={styles.copyButtonText}>Copy</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.liveCodeTextBrown}>
                  {buildVideoHtmlCode()}
                </Text>
              </View>
            </LinearGradient>
          </View>
        </ScrollView>
      );
    }

    // iframe / WebView playground
    if (sec?.id === "iframe") {
      return (
        <ScrollView style={styles.sectionScroll} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={styles.sectionContainer}>
            <LinearGradient
              colors={["#E3F2FD", "#E8F5E9"]}
              style={styles.iframeCard}
            >
              <Text style={styles.iframeTitle}>🌐 {sec.heading}</Text>
              <Text style={styles.sectionContent}>{sec.content}</Text>

              {/* اختيار النوع */}
              <View style={styles.iframeButtonsRow}>
                <TouchableOpacity
                  style={[
                    styles.iframeButtonBlue,
                    iframeType === "youtube" && styles.iframeButtonBlueActive,
                  ]}
                  onPress={() => {
                    setIframeType("youtube");
                    setIframeUrl("https://www.youtube.com/embed/pQN-pnXPaVg");
                  }}
                >
                  <Text
                    style={[
                      styles.iframeButtonBlueText,
                      iframeType === "youtube" &&
                        styles.iframeButtonBlueTextActive,
                    ]}
                  >
                    YouTube
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.iframeButtonGreen,
                    iframeType === "maps" && styles.iframeButtonGreenActive,
                  ]}
                  onPress={() => {
                    setIframeType("maps");
                    setIframeUrl(
                      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.238276147896!2d-122.08560852436184!3d37.42206513552125!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808fb0bffcb20363%3A0x84e3ebd2fbc0e94!2sGoogleplex!5e0!3m2!1sen!2sus!4v1700000000000"
                    );
                  }}
                >
                  <Text
                    style={[
                      styles.iframeButtonGreenText,
                      iframeType === "maps" &&
                        styles.iframeButtonGreenTextActive,
                    ]}
                  >
                    Google Maps
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.iframeButtonPurple,
                    iframeType === "spotify" && styles.iframeButtonPurpleActive,
                  ]}
                  onPress={() => {
                    setIframeType("spotify");
                    setIframeUrl(
                      "https://open.spotify.com/embed/track/7GhIk7Il098yCjg4BQjzvb"
                    );
                  }}
                >
                  <Text
                    style={[
                      styles.iframeButtonPurpleText,
                      iframeType === "spotify" &&
                        styles.iframeButtonPurpleTextActive,
                    ]}
                  >
                    Spotify
                  </Text>
                </TouchableOpacity>
              </View>

              {/* إدخال الرابط */}
              <View style={styles.imageInputRow}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter embed URL..."
                  value={iframeUrl}
                  onChangeText={setIframeUrl}
                />
                <TouchableOpacity
                  style={styles.primaryButtonBlue}
                  onPress={() => setShowIframe(true)}
                >
                  <Text style={styles.primaryButtonBlueText}>Embed</Text>
                </TouchableOpacity>
              </View>

              {/* عرض المحتوى */}
              {showIframe && (
                <View style={styles.webviewWrapper}>
                  <WebView
                    source={{ uri: iframeUrl }}
                    style={styles.webview}
                  />
                </View>
              )}

              {/* كود HTML */}
              {showIframe && (
                <View style={styles.liveCodeBoxBlue}>
                  <View style={styles.liveCodeHeader}>
                    <Text style={styles.liveCodeTitleBlue}>
                      💻 Live HTML Code
                    </Text>
                    <TouchableOpacity
                      style={styles.copyButtonBlue}
                      onPress={copyIframeHtmlToClipboard}
                    >
                      <Text style={styles.copyButtonText}>Copy</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.liveCodeTextBlue}>
                    {buildIframeHtmlCode()}
                  </Text>
                </View>
              )}
            </LinearGradient>
          </View>
        </ScrollView>
      );
    }

    // AI TTS
    if (sec?.id === "ai-tts") {
      return (
        <ScrollView style={styles.sectionScroll} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={styles.sectionContainer}>
            <LinearGradient
              colors={["#FFFBEB", "#F3E8FF"]}
              style={styles.aiCard}
            >
              <Text style={styles.aiTitle}>{sec.heading}</Text>
              <Text style={styles.sectionContent}>{sec.task}</Text>

              <TextInput
                style={[styles.textInput, { height: 100, textAlignVertical: "top" }]}
                multiline
                placeholder={sec.aiExample}
                value={ttsText}
                onChangeText={setTtsText}
              />

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={generateSpeech}
                disabled={ttsLoading}
              >
                <Text style={styles.primaryButtonText}>
                  {ttsLoading ? "Generating..." : "Convert to Speech"}
                </Text>
              </TouchableOpacity>

              {ttsAudioUri && (
                <TouchableOpacity
                  style={[styles.primaryButton, { marginTop: 16 }]}
                  onPress={playTtsAudio}
                >
                  <Text style={styles.primaryButtonText}>Play Generated Audio</Text>
                </TouchableOpacity>
              )}
            </LinearGradient>
          </View>
        </ScrollView>
      );
    }

    // Quiz tab (سواء من sec.id أو من key=quiz)
    if (activeTab === "quiz" || sec?.id === "quiz") {
      if (!quizSection || !Array.isArray(quizSection.quiz)) {
        return (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>No quiz found</Text>
          </View>
        );
      }

      return (
        <View style={styles.sectionContainer}>
          <Quiz
            lessonId={32}
            questions={quizSection.quiz}
            totalQuestions={quizSection.quiz.length}
            onPassed={() => {
              setQuizCompleted(true);
              setPassed(true);
            }}
            onFailed={() => {
              setQuizCompleted(true);
              setPassed(false);
            }}
          />

          {quizCompleted && (
            <View style={styles.quizButtonsRow}>
              {/* Previous Lesson */}
              <TouchableOpacity
                style={styles.prevButton}
                onPress={() =>
                  navigation.navigate("LessonViewer", { lessonId: 31 })
                }
              >
                <Text style={styles.prevButtonText}>⬅️ Previous Lesson</Text>
              </TouchableOpacity>

              {/* Next Lesson */}
              <TouchableOpacity
                style={[
                  styles.nextButton,
                  !passed && styles.nextButtonDisabled,
                ]}
                disabled={!passed}
                onPress={() => {
                  if (passed) {
                    navigation.navigate("LessonViewer", { lessonId: 33 });
                  }
                }}
              >
                <Text
                  style={[
                    styles.nextButtonText,
                    !passed && styles.nextButtonTextDisabled,
                  ]}
                >
                  Next Lesson ➡️
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      );
    }

    // باقي الأقسام العادية
    return (
      <ScrollView style={styles.sectionScroll} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{sec.heading}</Text>
          {sec.content && (
            <Text style={styles.sectionContent}>{sec.content}</Text>
          )}
          {sec.code && (
            <View style={styles.codeBlock}>
              <Text style={styles.codeText}>{sec.code}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    );
  };

  // =========================
  // 🏁 Render main layout
  // =========================
  return (
    <LinearGradient colors={["#FFFBEA", "#FFF3C4"]} style={styles.container}>
      {/* زر الرجوع لصفحة الدروس */}
      <View style={styles.backButtonWrapper}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("LessonViewer")}
        >
          <Text style={styles.backButtonIcon}>🏫</Text>
          <Text style={styles.backButtonText}>Back to Lessons</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.innerContainer}>
        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsWrapper}
          contentContainerStyle={styles.tabsContent}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabButton,
                activeTab === tab.key && styles.tabButtonActive,
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === tab.key && styles.tabButtonTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* محتوى التاب */}
        <View style={styles.contentWrapper}>{renderTabContent()}</View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#6B7280",
    fontSize: 16,
  },
  innerContainer: {
    flex: 1,
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  backButtonWrapper: {
    paddingHorizontal: 16,
    marginBottom: 8,
    alignItems: "flex-end",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9C4",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  backButtonIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  backButtonText: {
    color: "#6A1B9A",
    fontWeight: "700",
    fontSize: 13,
  },
  tabsWrapper: {
    maxHeight: 50,
  },
  tabsContent: {
    paddingHorizontal: 4,
    alignItems: "center",
  },
  tabButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.8)",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  tabButtonActive: {
    backgroundColor: "#FACC15",
    borderColor: "#D97706",
  },
  tabButtonText: {
    fontSize: 13,
    color: "#6B21A8",
    fontWeight: "500",
  },
  tabButtonTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  contentWrapper: {
    flex: 1,
    marginTop: 10,
  },

  // Intro
  introContainer: {
    flex: 1,
  },
  introVideoWrapper: {
    width: "100%",
    borderRadius: 24,
    overflow: "hidden",
    height: width * 0.7,
  },
  introVideo: {
    width: "100%",
    height: "100%",
  },
  introOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  introTextContainer: {
    position: "absolute",
    inset: 0,
    paddingHorizontal: 18,
    justifyContent: "center",
  },
  introTitle: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "800",
    marginBottom: 8,
  },
  introDescription: {
    fontSize: 14,
    color: "#F3F4F6",
    maxWidth: "90%",
  },

  // Sections generic
  sectionScroll: {
    flex: 1,
  },
  sectionContainer: {
    padding: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#4A148C",
    marginBottom: 6,
  },
  sectionContent: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
    marginBottom: 8,
  },
  codeBlock: {
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    padding: 10,
    marginTop: 4,
  },
  codeText: {
    fontSize: 12,
    color: "#4A148C",
  },

  // Intro text card
  introCard: {
    borderRadius: 24,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FDE68A",
    position: "relative",
  },
  introCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  introIconBox: {
    backgroundColor: "rgba(255,255,255,0.8)",
    padding: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  introIcon: {
    fontSize: 24,
  },
  introHeading: {
    fontSize: 20,
    fontWeight: "800",
    color: "#6A1B9A",
  },
  threeDots: {
    position: "absolute",
    right: 16,
    bottom: -4,
    fontSize: 32,
    color: "rgba(250,204,21,0.7)",
  },

  // Images
  imagesCard: {
    borderRadius: 24,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  imageInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  textInput: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    fontSize: 13,
  },
  primaryButton: {
    marginLeft: 8,
    backgroundColor: "#FACC15",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  previewLabel: {
    fontWeight: "700",
    color: "#6A1B9A",
    marginTop: 4,
    marginBottom: 4,
  },
  previewImageWrapper: {
    alignItems: "center",
  },
  previewImage: {
    width: width * 0.8,
    height: width * 0.5,
  },
  toggleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 10,
  },
  toggleButtonPurple: {
    backgroundColor: "#EDE9FE",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    margin: 3,
  },
  toggleButtonTextPurple: {
    color: "#6A1B9A",
    fontSize: 12,
    fontWeight: "500",
  },
  toggleButtonYellow: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    margin: 3,
  },
  toggleButtonTextYellow: {
    color: "#92400E",
    fontSize: 12,
    fontWeight: "500",
  },
  toggleButtonGray: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    margin: 3,
  },
  toggleButtonTextGray: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "500",
  },
  liveCodeBox: {
    marginTop: 12,
    borderRadius: 18,
    backgroundColor: "#FFFCF2",
    borderWidth: 1,
    borderColor: "#FDE68A",
    padding: 12,
  },
  liveCodeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  liveCodeTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6A1B9A",
  },
  copyButton: {
    backgroundColor: "#6A1B9A",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  copyButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  liveCodeText: {
    fontSize: 11,
    color: "#4A148C",
  },
  errorText: {
    color: "#DC2626",
    marginTop: 4,
    fontWeight: "600",
  },

  // Audio
  audioCard: {
    borderRadius: 24,
    padding: 14,
    borderWidth: 1,
    borderColor: "#A5D6A7",
  },
  audioTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2E7D32",
    marginBottom: 8,
  },
  codeInline: {
    fontFamily: "monospace",
    color: "#1F2933",
  },
  bold: {
    fontWeight: "700",
  },
  switchRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
    marginBottom: 10,
  },
  switchItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 6,
  },
  switchLabel: {
    marginLeft: 4,
    fontSize: 13,
    color: "#374151",
  },
  primaryButtonGreen: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  primaryButtonGreenText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  liveCodeBoxGreen: {
    marginTop: 4,
    borderRadius: 18,
    backgroundColor: "#F9FFF6",
    borderWidth: 1,
    borderColor: "#A5D6A7",
    padding: 12,
  },
  liveCodeTitleGreen: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2E7D32",
  },
  copyButtonGreen: {
    backgroundColor: "#2E7D32",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  liveCodeTextGreen: {
    fontSize: 11,
    color: "#33691E",
  },

  // Video
  videoCard: {
    borderRadius: 24,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FCD34D",
  },
  videoTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#E65100",
    marginBottom: 8,
  },
  videoButtonsRow: {
    flexDirection: "row",
    marginTop: 8,
    marginBottom: 10,
    flexWrap: "wrap",
  },
  videoSampleButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#FFEDD5",
    marginRight: 6,
    marginBottom: 6,
  },
  videoSampleButtonActive: {
    backgroundColor: "#FB923C",
  },
  videoSampleButtonText: {
    fontSize: 12,
    color: "#C05621",
    fontWeight: "600",
  },
  videoSampleButtonTextActive: {
    color: "#FFFFFF",
  },
  videoWrapper: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#FDE68A",
    marginBottom: 10,
  },
  videoPlayer: {
    width: "100%",
    height: width * 0.6,
    backgroundColor: "#000",
  },
  liveCodeBoxYellow: {
    borderRadius: 18,
    backgroundColor: "#FFFBEA",
    borderWidth: 1,
    borderColor: "#FDE68A",
    padding: 12,
  },
  liveCodeTitleOrange: {
    fontSize: 14,
    fontWeight: "700",
    color: "#E65100",
  },
  copyButtonOrange: {
    backgroundColor: "#E65100",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  liveCodeTextBrown: {
    fontSize: 11,
    color: "#4E342E",
  },

  // Iframe / WebView
  iframeCard: {
    borderRadius: 24,
    padding: 14,
    borderWidth: 1,
    borderColor: "#90CAF9",
  },
  iframeTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1565C0",
    marginBottom: 8,
  },
  iframeButtonsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  iframeButtonBlue: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#DBEAFE",
    marginRight: 6,
    marginBottom: 6,
  },
  iframeButtonBlueActive: {
    backgroundColor: "#3B82F6",
  },
  iframeButtonBlueText: {
    fontSize: 12,
    color: "#1D4ED8",
    fontWeight: "600",
  },
  iframeButtonBlueTextActive: {
    color: "#FFFFFF",
  },
  iframeButtonGreen: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#DCFCE7",
    marginRight: 6,
    marginBottom: 6,
  },
  iframeButtonGreenActive: {
    backgroundColor: "#22C55E",
  },
  iframeButtonGreenText: {
    fontSize: 12,
    color: "#15803D",
    fontWeight: "600",
  },
  iframeButtonGreenTextActive: {
    color: "#FFFFFF",
  },
  iframeButtonPurple: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#EDE9FE",
    marginRight: 6,
    marginBottom: 6,
  },
  iframeButtonPurpleActive: {
    backgroundColor: "#A855F7",
  },
  iframeButtonPurpleText: {
    fontSize: 12,
    color: "#6B21A8",
    fontWeight: "600",
  },
  iframeButtonPurpleTextActive: {
    color: "#FFFFFF",
  },
  primaryButtonBlue: {
    marginLeft: 8,
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  primaryButtonBlueText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  webviewWrapper: {
    marginTop: 10,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    height: width * 0.6,
  },
  webview: {
    flex: 1,
  },
  liveCodeBoxBlue: {
    marginTop: 12,
    borderRadius: 18,
    backgroundColor: "#F0F8FF",
    borderWidth: 1,
    borderColor: "#90CAF9",
    padding: 12,
  },
  liveCodeTitleBlue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1565C0",
  },
  copyButtonBlue: {
    backgroundColor: "#1565C0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  liveCodeTextBlue: {
    fontSize: 11,
    color: "#1A237E",
  },

  // AI
  aiCard: {
    borderRadius: 24,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  aiTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#6A1B9A",
    marginBottom: 6,
  },

  // Quiz buttons
  quizButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  prevButton: {
    flex: 1,
    backgroundColor: "#E5E7EB",
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 6,
    alignItems: "center",
  },
  prevButtonText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 13,
  },
  nextButton: {
    flex: 1,
    backgroundColor: "#FACC15",
    paddingVertical: 10,
    borderRadius: 10,
    marginLeft: 6,
    alignItems: "center",
  },
  nextButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  nextButtonTextDisabled: {
    color: "#6B7280",
  },
});
