import { useState } from "react";
import {
  Heart,
  Music,
  Calendar,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";

// GeminiClient.ts から API 呼び出し関数をインポート
import { getGeminiRecommendedSong } from "./API/GeminiClient";

const MindMusicBox = () => {
  const [currentView, setCurrentView] = useState("today");
  const [emotions, setEmotions] = useState({
    joy: 1,
    peace: 1,
    fear: 1,
    surprise: 1,
    sadness: 1,
    discomfort: 1,
    anger: 1,
    hope: 1,
  });
  const [memo, setMemo] = useState("");
  type Entry = {
    id: number;
    date: string;
    emotions: typeof emotions;
    memo: string;
    song: typeof currentSong;
  };
  const [entries, setEntries] = useState<Entry[]>([]);
  type Song = (typeof sampleSongs)[keyof typeof sampleSongs][number] | { title: string; artist: string; mood: string };
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const emotionLabels = {
    joy: { jp: "喜び", color: "from-yellow-400 to-orange-500", icon: "😊" },
    peace: { jp: "安心", color: "from-green-400 to-blue-500", icon: "😌" },
    fear: { jp: "恐れ", color: "from-purple-600 to-purple-800", icon: "😰" },
    surprise: { jp: "驚き", color: "from-pink-400 to-red-500", icon: "😲" },
    sadness: { jp: "悲しみ", color: "from-blue-600 to-indigo-700", icon: "😢" },
    discomfort: { jp: "不快", color: "from-gray-500 to-gray-700", icon: "😣" },
    anger: { jp: "怒り", color: "from-red-600 to-red-800", icon: "😠" },
    hope: { jp: "希望", color: "from-emerald-400 to-teal-600", icon: "✨" },
  };
  const sampleSongs = {
    high_positive: [
      { title: "Sunshine Melody", artist: "Peaceful Waves", mood: "uplifting" },
      { title: "Morning Light", artist: "Calm Spirits", mood: "energetic" },
    ],
    low_positive: [
      { title: "Gentle Rain", artist: "Nature Sounds", mood: "peaceful" },
      { title: "Soft Breeze", artist: "Meditation Music", mood: "calm" },
    ],
    high_negative: [
      {
        title: "Storm Release",
        artist: "Emotional Healing",
        mood: "cathartic",
      },
      {
        title: "Breaking Through",
        artist: "Powerful Journey",
        mood: "empowering",
      },
    ],
    low_negative: [
      { title: "Healing Waters", artist: "Comfort Zone", mood: "soothing" },
      { title: "Warm Embrace", artist: "Safe Harbor", mood: "comforting" },
    ],
  } as const;
  type SongCategory = keyof typeof sampleSongs;
  const saveEntry = () => {
    if (!Object.values(emotions).every((val) => val >= 1)) {
      alert("すべての感情の選択が必要です");
      return;
    }
    const newEntry = {
      id: Date.now(),
      date: new Date().toISOString().split("T")[0],
      emotions: { ...emotions },
      memo,
      song: currentSong,
    };
    setEntries((prev) => [newEntry, ...prev]);
    setMemo("");
    alert("記録を保存しました！");
  };

  const getRecommendedSong = () => {
    const avgPositive = (emotions.joy + emotions.peace + emotions.hope) / 3;
    const avgNegative =
      (emotions.fear +
        emotions.sadness +
        emotions.discomfort +
        emotions.anger) /
      4;
    const positivity = avgPositive - avgNegative;
    const intensity = Math.max(avgPositive, avgNegative);
    let category: SongCategory;
    if (positivity > 0 && intensity > 3) category = "high_positive";
    else if (positivity > 0) category = "low_positive";
    else if (intensity > 3) category = "high_negative";
    else category = "low_negative";
    const songs = sampleSongs[category];
    const song = songs[Math.floor(Math.random() * songs.length)];
    setCurrentSong(song);
  };
  
  // Gemini APIから楽曲を取得する非同期関数
  const getAISong = async () => {
    const prompt = `こんにちは。今日を1~5の数字で表すと、嬉しさが${emotions.joy}, 安心が${emotions.peace}, 恐れが${emotions.fear}, 驚きが${emotions.surprise}, 悲しみが${emotions.sadness}, 不快が${emotions.discomfort}, 怒りが${emotions.anger}, 希望が${emotions.hope}でした。これらの感情に基づいて、私にぴったりの曲を1つ、タイトルとアーティスト名、そして曲の雰囲気を簡潔に日本語で教えてください。例: タイトル: "空の彼方へ", アーティスト: "心の旅人", 雰囲気: "希望に満ちた"`;
    try {
      const aiSong = await getGeminiRecommendedSong(prompt);
      setCurrentSong(aiSong);
    } catch (error) {
      console.error("AIからの楽曲取得に失敗しました:", error);
      alert("AIからの楽曲取得に失敗しました。デフォルトの楽曲を探します。");
      getRecommendedSong(); // 失敗した場合のフォールバック
    }
  };

  type EmotionSliderProps = {
    emotion: keyof typeof emotionLabels;
    value: number;
    onChange: (value: number) => void;
  };
  const EmotionSlider = ({ emotion, value, onChange }: EmotionSliderProps) => {
    const emotionData = emotionLabels[emotion as keyof typeof emotionLabels];
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{emotionData.icon}</span>
            <span className="font-medium text-gray-800">{emotionData.jp}</span>
          </div>
          <span className="text-sm font-bold text-gray-600">{value}</span>
        </div>
        <div className="relative">
          <input
            type="range"
            min="1"
            max="5"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="w-full h-3 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, 
                ${value >= 1 ? "#e0e7ff" : "#f1f5f9"} 0%, 
                ${value >= 1 ? "#c7d2fe" : "#f1f5f9"} 20%, 
                ${value >= 2 ? "#a5b4fc" : "#f1f5f9"} 40%, 
                ${value >= 3 ? "#8b5cf6" : "#f1f5f9"} 60%, 
                ${value >= 4 ? "#7c3aed" : "#f1f5f9"} 80%, 
                ${value >= 5 ? "#6d28d9" : "#f1f5f9"} 100%)`,
            }}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>弱い</span>
            <span>強い</span>
          </div>
        </div>
      </div>
    );
  };
  const MusicPlayer = () => {
    if (!currentSong) return null;
    return (
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-4 text-white mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold">{currentSong.title}</h3>
            <p className="text-sm opacity-90">{currentSong.artist}</p>
            <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
              {currentSong.mood}
            </span>
          </div>
          <div className="text-3xl">🎵</div>
        </div>

        <div className="flex items-center justify-center gap-4 mb-3">
          <button className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors">
            <SkipBack size={20} />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-colors"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          <button className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors">
            <SkipForward size={20} />
          </button>
          <button className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors">
            <Volume2 size={20} />
          </button>
        </div>

        <div className="w-full bg-white bg-opacity-20 rounded-full h-1">
          <div className="bg-white h-1 rounded-full w-1/3"></div>
        </div>
      </div>
    );
  };
  type EntryCardProps = {
    entry: Entry;
  };
  const EntryCard = ({ entry }: EntryCardProps) => {
    const date = new Date(entry.date);
    const dominantEmotion = (
      Object.entries(entry.emotions) as [keyof typeof emotionLabels, number][]
    ).reduce((a, b) =>
      entry.emotions[a[0]] > entry.emotions[b[0]] ? a : b
    )[0];
    const emotionData = emotionLabels[dominantEmotion];
    return (
      <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{emotionData.icon}</span>
            <div>
              <p className="font-medium text-gray-800">
                {date.getMonth() + 1}月{date.getDate()}日
              </p>
              <p className="text-sm text-gray-600">
                主な気分: {emotionData.jp}
              </p>
            </div>
          </div>
          {entry.song && (
            <div className="text-right">
              <Music className="text-purple-600 mb-1" size={16} />
              <p className="text-xs text-gray-600">{entry.song.title}</p>
            </div>
          )}
        </div>

        {entry.memo && (
          <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
            {entry.memo}
          </p>
        )}

        <div className="grid grid-cols-4 gap-2 mt-3">
          {Object.entries(entry.emotions).map(([emotion, value]) => (
            <div key={emotion} className="text-center">
              <div className="text-xs text-gray-600">
                {emotionLabels[emotion as keyof typeof emotionLabels].jp}
              </div>
              <div className="flex justify-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i <= value ? "bg-purple-400" : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-md mx-auto bg-white shadow-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="text-pink-200" size={24} />
            <h1 className="text-xl font-bold">
              マインド・ミュージックボックス
            </h1>
            <Music className="text-purple-200" size={24} />
          </div>
          <p className="text-center text-purple-100 text-sm">
            今日の気持ちを音楽と一緒に記録しよう
          </p>
        </div>
        {/* Navigation */}
        <div className="flex bg-white border-b border-gray-200">
          <button
            onClick={() => setCurrentView("today")}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              currentView === "today"
                ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50"
                : "text-gray-600 hover:text-purple-600"
            }`}
          >
            今日の記録
          </button>
          <button
            onClick={() => setCurrentView("history")}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              currentView === "history"
                ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50"
                : "text-gray-600 hover:text-purple-600"
            }`}
          >
            過去の記録
          </button>
        </div>
        <div className="p-6">
          {currentView === "today" ? (
            <div>
              {/* Music Player */}
              <MusicPlayer />
              {/* Emotion Sliders */}
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-2xl">💭</span>
                  今日の気持ち
                </h2>

                {Object.entries(emotions).map(([emotion, value]) => (
                  <EmotionSlider
                    key={emotion}
                    emotion={emotion as keyof typeof emotionLabels}
                    value={value}
                    onChange={(newValue) =>
                      setEmotions((prev) => ({ ...prev, [emotion]: newValue }))
                    }
                  />
                ))}
              </div>
              {/* Memo Section */}
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-2xl">📝</span>
                  今日の出来事
                </h2>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="今日感じたことや出来事を自由に書いてください..."
                  className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                  rows={4}
                />
              </div>
              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={getAISong} // AI楽曲探索機能
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Music size={18} />
                  AIが探す
                </button>
                <button
                  onClick={saveEntry}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 px-4 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Heart size={18} />
                  記録を保存
                </button>
              </div>
              {/* Today's Emotional Summary */}
              <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
                <h3 className="font-medium text-gray-800 mb-2">
                  今日の感情バランス
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(emotions).map(([emotion, value]) => {
                    const emotionData =
                      emotionLabels[emotion as keyof typeof emotionLabels];
                    return (
                      <div key={emotion} className="text-center">
                        <div className="text-lg mb-1">{emotionData.icon}</div>
                        <div className="text-xs text-gray-600">
                          {emotionData.jp}
                        </div>
                        <div className="flex justify-center gap-0.5 mt-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full ${
                                i <= value ? "bg-purple-500" : "bg-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* History View */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Calendar className="text-purple-600" size={20} />
                  過去の記録
                </h2>
                <span className="text-sm text-gray-600">
                  {entries.length}件の記録
                </span>
              </div>
              {entries.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📔</div>
                  <p className="text-gray-600">まだ記録がありません</p>
                  <p className="text-sm text-gray-500 mt-2">
                    「今日の記録」から始めてみましょう
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {entries.map((entry) => (
                    <EntryCard key={entry.id} entry={entry} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        {/* Bottom Navigation */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex justify-center">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Heart size={16} className="text-red-400" />
                <span>愛情</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="flex items-center gap-1">
                <Music size={16} className="text-purple-400" />
                <span>音楽</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="flex items-center gap-1">
                <span className="text-yellow-400">✨</span>
                <span>習慣</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default MindMusicBox;  