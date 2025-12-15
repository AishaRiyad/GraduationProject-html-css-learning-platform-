// 📁 pages/LessonViewer5.js

import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TextInput,
} from "react-native";

import axios from "axios";
import { WebView } from "react-native-webview";
import LiveCodeEditorMobile from "../components/LiveCodeEditorMobile";
import QuizLesson5Mobile from "../components/QuizLesson5Mobile";

export default function LessonViewer5({ navigation }) {
  const API = "http://10.0.2.2:5000";

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  const [aiAnswer, setAiAnswer] = useState("");
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const [weather, setWeather] = useState(null);
  const [userCode, setUserCode] = useState("");
  const [aiReview, setAiReview] = useState("");
  const [nextEnabled, setNextEnabled] = useState(false);

  const [completedSections, setCompletedSections] = useState([]);

  useEffect(() => {
    const getLesson = async () => {
      try {
       const token = await AsyncStorage.getItem("token");


        const res = await axios.get(`${API}/api/lessons/content/31`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setLesson(res.data.content);
      } catch (err) {
        console.log("❌ Failed to fetch lesson", err);
      } finally {
        setLoading(false);
      }
    };

    getLesson();
  }, []);

  // ======================
  //  AI Ask for input types
  // ======================
  const askAI = async () => {
    if (!aiQuestion.trim()) return;

    setAiLoading(true);
    setAiAnswer("");

    try {
      const res = await axios.post(`${API}/api/ai-local/assist`, {
        question: `Generate only pure HTML code for a form using <${aiQuestion}> input type. No explanation.`,
      });

      setAiAnswer(res.data.answer);
    } catch (err) {
      setAiAnswer("Error contacting AI backend.");
    } finally {
      setAiLoading(false);
    }
  };

  // extract HTML only
  function cleanHTML(text) {
    if (!text) return "";
    const match = text.match(/<form[\s\S]*<\/form>|<input[\s\S]*?>/i);
    return match ? match[0] : text;
  }

  // ================
  // Weather API Demo
  // ================
  const fetchWeather = async (city) => {
    try {
      const res = await axios.get(`${API}/api/weather/${city}`);
      setWeather(res.data);
    } catch (err) {
      setWeather({ error: "Failed to load weather." });
    }
  };

  // ======================
  // AI review code project
  // ======================
  const reviewCode = async () => {
    try {
      const res = await axios.post(`${API}/api/ai-local/review-project`, {
        code: userCode,
      });

      setAiReview(res.data.review);
    } catch (err) {
      setAiReview("Error reviewing code.");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#facc15" />
        <Text style={{ marginTop: 10 }}>Loading lesson...</Text>
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "red", fontSize: 16 }}>
          Failed to load lesson.
        </Text>
      </View>
    );
  }

  // آخر كويز في الدرس
  const lastQuizIndex = lesson.sections
    .map((s, i) => (s.quiz ? i : -1))
    .filter((i) => i !== -1)
    .pop();

    const wrapHtml = (innerHtml) => `
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.2" />
      <style>
        body {
          padding: 12px;
          font-size: 15px;
          font-family: sans-serif;
        }
        input, button, select {
          padding: 12px;
          margin-top: 10px;
          font-size: 17px;
          width: 100%;
          border-radius: 8px;
          border: 1px solid #aaa;
        }
        button {
          background: #facc15;
          border: none;
          font-weight: bold;
        }
      </style>
    </head>

    <body>
      ${innerHtml}
    </body>
  </html>
`;
const wrapInputHtml = (innerHtml) => `
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        body {
          padding: 10px;
          font-size: 14px;
          font-family: sans-serif;
        }

        input, button {
          padding: 8px;
          margin: 4px 0;
          width: 100%;
          border-radius: 6px;
          border: 1px solid #ccc;
          font-size: 14px;
        }

        button {
          background: #facc15;
          border: none;
          font-weight: bold;
        }
      </style>
    </head>
    <body>${innerHtml}</body>
  </html>
`;



  return (
    <ScrollView style={styles.page} contentContainerStyle={{ padding: 16 }}>
      {/* ============================ */}
      {/*        عنوان الدرس            */}
      {/* ============================ */}
      <Text style={styles.title}>Lesson 5 — Forms & Inputs</Text>
      <Text style={styles.desc}>{lesson.description}</Text>

      {/* ============================ */}
      {/*       أقسام الدرس            */}
      {/* ============================ */}
      {lesson.sections.map((sec, i) => (
        <View key={i} style={styles.sectionBox}>
          <Text style={styles.sectionHeader}>{sec.heading}</Text>

          {/* المحتوى */}
          {sec.content && (
            <Text style={styles.sectionText}>{sec.content}</Text>
          )}

          {/* كود أول قسم live editor */}
          {sec.code && sec.id === "intro" && (
            <LiveCodeEditorMobile initialCode={sec.code} />
          )}

          {/* الكود العادي */}
          {sec.code && sec.id !== "intro" && (
            <View style={styles.codeBox}>
              <ScrollView horizontal>
                <Text style={styles.codeText}>{sec.code}</Text>
              </ScrollView>
            </View>
          )}

          {/* 🔹 Input Types — يدعم html بالـ WebView */}
       {sec.id === "input-types" && sec.inputs && (
  <View style={styles.demoBox}>
    {sec.inputs.map((item, ii) => (
      <View key={ii} style={styles.inputCard}>
        
        {/* عنوان النوع */}
        <Text style={styles.inputCardTitle}>{item.type}</Text>

        {/* الشرح */}
        <Text style={styles.inputCardDesc}>{item.description}</Text>

        {/* المعاينة */}
        <WebView
          source={{ html: wrapInputHtml(item.example) }}
          style={styles.inputWebview}
        />
      </View>
    ))}
  </View>
)}




     {sec.id === "attributes" && sec.attributes && (
  <View style={styles.demoBox}>
    {sec.attributes.map((item, ii) => (
      <View key={ii} style={styles.attrBlock}>
        
        {/* عنوان الخاصية */}
        <Text style={styles.attrTitle}>{item.name}</Text>

        {/* الشرح */}
        <Text style={styles.attrDescription}>{item.description}</Text>

        {/* كود HTML مثل الويب */}
        <View style={styles.codeBox}>
          <ScrollView horizontal>
            <Text style={styles.codeText}>{item.exampleCode}</Text>
          </ScrollView>
        </View>

        {/* المعاينة التفاعلية */}
        <WebView
          source={{
            html: wrapHtml(item.exampleCode),
          }}
          style={styles.attrWebview}
        />
      </View>
    ))}
  </View>
)}




          {/* Labels Demo */}
        {sec.id === "labels-accessibility" && (
  <View style={styles.exampleBlock}>
    <Text style={styles.exampleDescription}>{sec.content}</Text>

    <View style={styles.codeBox}>
      <ScrollView horizontal>
        <Text style={styles.codeText}>{sec.code}</Text>
      </ScrollView>
    </View>

    <WebView
      source={{
        html: wrapHtml(`
          <label for="email">Email</label>
          <input id="email" type="email" placeholder="Enter email"/>
        `),
      }}
      style={styles.bigWebview}
    />
  </View>
)}



          {/* Grouping Inputs Demo */}
          {sec.id === "grouping-inputs" && (
  <View style={styles.exampleBlock}>
    <Text style={styles.exampleDescription}>{sec.content}</Text>

    <View style={styles.codeBox}>
      <ScrollView horizontal>
        <Text style={styles.codeText}>{sec.code}</Text>
      </ScrollView>
    </View>

    <WebView
      source={{
        html: wrapHtml(`
          <fieldset style="border:2px solid #e5c100; padding:15px; border-radius:10px;">
            <legend>Personal Info</legend>
            <input placeholder="Name"/>
            <input type="email" placeholder="Email"/>
          </fieldset>
        `),
      }}
      style={styles.bigWebview}
    />
  </View>
)}



          {/* Form Validation Demo */}
        {sec.id === "form-validation" && (
  <View style={styles.exampleBlock}>
    <Text style={styles.exampleTitle}>{sec.heading}</Text>
    <Text style={styles.exampleDescription}>{sec.content}</Text>

    <View style={styles.codeBox}>
      <ScrollView horizontal>
        <Text style={styles.codeText}>{sec.code}</Text>
      </ScrollView>
    </View>

    <WebView
      source={{
        html: wrapHtml(`
          <form>
            <input type="email" required placeholder="Email"/>
            <input type="number" required min="1" max="10" placeholder="Age 1-10"/>
            <button>Submit</button>
          </form>
        `),
      }}
      style={styles.bigWebview}
    />
  </View>
)}



          {/* QUIZ */}
          {sec.quiz && (
            <QuizLesson5Mobile
              lessonId={31}
              quizData={{
                questions: [
                  {
                    question: sec.quiz.question,
                    options: sec.quiz.options,
                    correctIndex: sec.quiz.options.indexOf(sec.quiz.answer),
                  },
                ],
              }}
              isFinal={i === lastQuizIndex}
              onPassed={() => {
                const updated = [...completedSections, i];
                setCompletedSections(updated);

                if (
                  updated.length ===
                  lesson.sections.filter((s) => s.quiz).length
                ) {
                  setNextEnabled(true);
                }
              }}
            />
          )}

          {/* AI Assistant Section */}
          {sec.aiPrompt && (
            <View style={styles.aiBox}>
              <Text style={styles.aiTitle}>🤖 AI Form Assistant</Text>
              <Text style={styles.aiDesc}>
                Type an input type and AI will generate HTML for it.
              </Text>

              <TextInput
                value={aiQuestion}
                onChangeText={setAiQuestion}
                placeholder="email — number — date ..."
                style={styles.aiInput}
              />

              <TouchableOpacity
                onPress={askAI}
                style={[styles.aiBtn, aiLoading && { opacity: 0.6 }]}
                disabled={aiLoading}
              >
                <Text style={styles.aiBtnText}>
                  {aiLoading ? "Thinking..." : "Ask AI"}
                </Text>
              </TouchableOpacity>

              {aiLoading && (
                <Text style={styles.aiLoading}>AI is generating...</Text>
              )}

              {aiAnswer !== "" && !aiLoading && (
                <View style={styles.aiResultBox}>
                  <Text style={styles.aiResultTitle}>Generated HTML:</Text>

                  <ScrollView horizontal>
                    <Text style={styles.codeText}>
                      {cleanHTML(aiAnswer)}
                    </Text>
                  </ScrollView>

                  <WebView
                    source={{ html: cleanHTML(aiAnswer) }}
                    style={styles.demoWebview}
                  />
                </View>
              )}
            </View>
          )}

          {/* API WEATHER DEMO */}
          {sec.apiDemo && (
            <View style={styles.apiBox}>
              <Text style={styles.apiTitle}>🌤 Weather API Demo</Text>

              <TextInput
                placeholder="Enter a city..."
                style={styles.apiInput}
                onSubmitEditing={(e) => fetchWeather(e.nativeEvent.text)}
              />

              {weather && (
                <View style={styles.weatherBox}>
                  {weather.error ? (
                    <Text style={{ color: "red" }}>{weather.error}</Text>
                  ) : (
                    <>
                      <Text>City: {weather.city}</Text>
                      <Text>{weather.description}</Text>
                      <Text>Temp: {weather.temperature}°C</Text>
                    </>
                  )}
                </View>
              )}
            </View>
          )}

          {/* MINI PROJECT */}
          {sec.aiReview && (
            <View style={styles.projectBox}>
              <Text style={styles.projectTitle}>
                💻 Mini Project: Registration Form
              </Text>

              <Text style={styles.projectDesc}>{sec.task}</Text>

              <TextInput
                multiline
                value={userCode}
                onChangeText={setUserCode}
                style={styles.projectEditor}
                placeholder="Write your HTML here..."
              />

              <WebView
                source={{ html: userCode }}
                style={[styles.demoWebview, { height: 200 }]}
              />

              <TouchableOpacity
                onPress={reviewCode}
                style={styles.reviewBtn}
              >
                <Text style={styles.reviewBtnText}>Review with AI</Text>
              </TouchableOpacity>

              {aiReview !== "" && (
                <Text style={styles.reviewText}>{aiReview}</Text>
              )}
            </View>
          )}
        </View>
      ))}

      {/* Navigation Buttons */}
      <View style={styles.navButtons}>
        <TouchableOpacity
          onPress={() => navigation.navigate("LessonViewer4")}
          style={styles.prevBtn}
        >
          <Text style={styles.prevText}>⬅ Previous Lesson</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("LessonViewer6")}
          disabled={!nextEnabled}
          style={[styles.nextBtn, !nextEnabled && { opacity: 0.3 }]}
        >
          <Text style={styles.nextText}>Next Lesson ➡</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// =======================
//        STYLES
// =======================
const styles = StyleSheet.create({
  page: {
    backgroundColor: "#FFFBEA",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "#795548",
    marginBottom: 5,
  },

  desc: {
    textAlign: "center",
    fontSize: 15,
    color: "#555",
    marginBottom: 20,
  },

  sectionBox: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    borderLeftWidth: 5,
    borderColor: "#facc15",
  },

  sectionHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#8D6E63",
    marginBottom: 8,
  },

  sectionText: {
    fontSize: 15,
    color: "#555",
    marginBottom: 16,
    lineHeight: 22,
  },

  codeBox: {
    backgroundColor: "#FFF9C4",
    borderWidth: 1,
    borderColor: "#e5d387",
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },

  codeText: {
    fontFamily: "monospace",
    fontSize: 13,
    color: "#333",
  },

  demoBox: {
    marginTop: 5,
    marginBottom: 16,
  },

  demoWebview: {
    height: 200,
    borderRadius: 10,
    borderColor: "#ddd",
    borderWidth: 1,
    marginTop: 8,
  },

  demoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6A1B9A",
  },

  demoText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 6,
  },

  aiBox: {
    backgroundColor: "#FFF9E6",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f4d17a",
  },

  aiTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6A1B9A",
  },

  aiDesc: {
    color: "#555",
    fontSize: 14,
    marginBottom: 8,
  },

  aiInput: {
    borderWidth: 1,
    borderColor: "#e5c100",
    backgroundColor: "#fff9c4",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },

  aiBtn: {
    backgroundColor: "#facc15",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  aiBtnText: {
    color: "#4a3c0a",
    fontWeight: "700",
  },

  aiLoading: {
    marginTop: 5,
    textAlign: "center",
    color: "#7a6000",
  },

  aiResultBox: {
    marginTop: 10,
    backgroundColor: "white",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#f4d17a",
  },

  apiBox: {
    backgroundColor: "#E3F2FD",
    padding: 14,
    borderRadius: 12,
    marginTop: 16,
  },

  apiTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#01579B",
    marginBottom: 8,
  },

  apiInput: {
    borderWidth: 1,
    borderColor: "#90caf9",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "white",
  },

  weatherBox: {
    marginTop: 10,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#b3e5fc",
  },

  projectBox: {
    backgroundColor: "#F3E5F5",
    padding: 16,
    borderRadius: 12,
  },

  projectTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6A1B9A",
    marginBottom: 5,
  },

  projectDesc: {
    marginBottom: 10,
    fontSize: 14,
    color: "#555",
  },

  projectEditor: {
    height: 150,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ce93d8",
    backgroundColor: "white",
    marginBottom: 10,
  },

  reviewBtn: {
    backgroundColor: "#ab47bc",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 8,
  },

  reviewBtnText: {
    color: "white",
    fontWeight: "bold",
  },

  reviewText: {
    marginTop: 10,
    color: "#444",
  },

  navButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
    marginBottom: 30,
  },

  prevBtn: {
    backgroundColor: "#fde047",
    padding: 10,
    borderRadius: 8,
  },

  prevText: {
    fontWeight: "700",
    color: "#5D4037",
  },

  nextBtn: {
    backgroundColor: "#facc15",
    padding: 10,
    borderRadius: 8,
  },

  nextText: {
    fontWeight: "700",
    color: "white",
  },
  exampleBlock: {
  marginBottom: 24,
  backgroundColor: "#fff7cc",
  padding: 12,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: "#ffe28a",
},

exampleTitle: {
  fontSize: 18,
  fontWeight: "bold",
  color: "#7c4d00",
  marginBottom: 6,
},

exampleDescription: {
  fontSize: 14,
  color: "#555",
  marginBottom: 12,
  lineHeight: 20,
},

exampleWebview: {
  height: 200,
  borderWidth: 1,
  borderColor: "#ddd",
  borderRadius: 10,
  overflow: "hidden",
  backgroundColor: "white",
},
bigWebview: {
  height: 260,
  borderWidth: 1,
  borderColor: "#ddd",
  borderRadius: 10,
  backgroundColor: "white",
  marginTop: 6,
  marginBottom: 12,
  overflow: "hidden",
},
inputWebview: {
  height: 150,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: "#ddd",
  backgroundColor: "white",
  overflow: "hidden",
},



attrBlock: {
  backgroundColor: "#fff7cc",
  padding: 14,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: "#ffe28a",
  marginBottom: 20,
},

attrTitle: {
  fontSize: 18,
  fontWeight: "bold",
  color: "#7c4d00",
  marginBottom: 4,
},

attrDescription: {
  fontSize: 14,
  color: "#555",
  marginBottom: 10,
  lineHeight: 20,
},

attrWebview: {
  height: 260,
  borderWidth: 1,
  borderColor: "#ddd",
  backgroundColor: "white",
  borderRadius: 10,
  marginTop: 8,
  overflow: "hidden",
},
inputCard: {
  backgroundColor: "#fff7cc",
  padding: 14,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: "#ffe28a",
  marginBottom: 16,  // المسافة بين الكروت
},

inputCardTitle: {
  fontSize: 17,
  fontWeight: "bold",
  color: "#7c4d00",
  marginBottom: 6,
},

inputCardDesc: {
  fontSize: 14,
  color: "#555",
  marginBottom: 8,
  lineHeight: 20,
},

});
