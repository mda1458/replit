import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bot, 
  Mic, 
  MicOff, 
  Send,
  Heart,
  Brain,
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  Smile,
  Meh,
  Frown,
  Coffee,
  Moon,
  Sun,
  Activity,
  MessageCircle,
  Zap,
  Target,
  TrendingUp,
  Calendar,
  Wind
} from "lucide-react";

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  emotion?: string;
}

interface MoodEntry {
  mood: string;
  emotions: string[];
  intensity: number;
  notes?: string;
  timestamp: string;
}

export default function AICompanion() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentMood, setCurrentMood] = useState('');
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [moodIntensity, setMoodIntensity] = useState(5);
  const [moodNotes, setMoodNotes] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechSynthesis = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    speechSynthesis.current = window.speechSynthesis;
    return () => {
      if (speechSynthesis.current) {
        speechSynthesis.current.cancel();
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get recent mood entries
  const { data: recentMoods = [] } = useQuery({
    queryKey: ['/api/ai-companion/recent-moods'],
  });

  // Get emotional insights
  const { data: emotionalInsights } = useQuery({
    queryKey: ['/api/ai-companion/emotional-insights'],
  });

  // Send chat message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('POST', '/api/ai-companion/chat', {
        message,
        context: {
          recentMoods,
          currentMood,
          emotions: selectedEmotions
        }
      });
      return response.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, 
        {
          id: Date.now(),
          role: 'user',
          content: inputMessage,
          timestamp: new Date().toISOString()
        },
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString(),
          emotion: data.detectedEmotion
        }
      ]);
      setInputMessage('');
      
      // Speak the response if enabled
      if (isSpeaking && speechSynthesis.current) {
        const utterance = new SpeechSynthesisUtterance(data.response);
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        speechSynthesis.current.speak(utterance);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Record mood mutation
  const recordMoodMutation = useMutation({
    mutationFn: async (moodData: any) => {
      const response = await apiRequest('POST', '/api/ai-companion/mood-check', moodData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Mood Recorded",
        description: "Your emotional state has been logged for insights.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ai-companion'] });
      setCurrentMood('');
      setSelectedEmotions([]);
      setMoodIntensity(5);
      setMoodNotes('');
    },
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    sendMessageMutation.mutate(inputMessage);
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast({
        title: "Voice Not Supported",
        description: "Voice input is not supported in this browser.",
        variant: "destructive",
      });
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast({
        title: "Voice Error",
        description: "Could not capture voice input. Please try again.",
        variant: "destructive",
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleRecordMood = () => {
    if (!currentMood) {
      toast({
        title: "Mood Required",
        description: "Please select your current mood first.",
        variant: "destructive",
      });
      return;
    }

    recordMoodMutation.mutate({
      mood: currentMood,
      emotions: selectedEmotions,
      intensity: moodIntensity,
      notes: moodNotes
    });
  };

  const moodOptions = [
    { value: 'joyful', label: 'Joyful', icon: <Smile className="w-5 h-5" />, color: 'text-yellow-500' },
    { value: 'peaceful', label: 'Peaceful', icon: <Heart className="w-5 h-5" />, color: 'text-green-500' },
    { value: 'reflective', label: 'Reflective', icon: <Brain className="w-5 h-5" />, color: 'text-blue-500' },
    { value: 'neutral', label: 'Neutral', icon: <Meh className="w-5 h-5" />, color: 'text-gray-500' },
    { value: 'sad', label: 'Sad', icon: <Frown className="w-5 h-5" />, color: 'text-blue-600' },
    { value: 'anxious', label: 'Anxious', icon: <Activity className="w-5 h-5" />, color: 'text-orange-500' },
    { value: 'angry', label: 'Angry', icon: <Zap className="w-5 h-5" />, color: 'text-red-500' },
    { value: 'tired', label: 'Tired', icon: <Moon className="w-5 h-5" />, color: 'text-purple-500' }
  ];

  const emotionOptions = [
    'hopeful', 'grateful', 'frustrated', 'lonely', 'excited', 'worried', 
    'content', 'confused', 'proud', 'disappointed', 'curious', 'overwhelmed'
  ];

  const breathingExercises = [
    { name: '4-7-8 Breathing', duration: '2 minutes', description: 'Inhale for 4, hold for 7, exhale for 8' },
    { name: 'Box Breathing', duration: '3 minutes', description: 'Equal counts of inhale, hold, exhale, hold' },
    { name: 'Belly Breathing', duration: '5 minutes', description: 'Deep diaphragmatic breathing for relaxation' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Your AI Healing Companion
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Personal emotional support and guidance on your forgiveness journey
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="mood">Mood Check</TabsTrigger>
            <TabsTrigger value="breathing">Breathing</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-4">
            <Card className="h-96">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Emotional Support Chat
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsSpeaking(!isSpeaking)}
                      className={isSpeaking ? 'text-blue-600' : 'text-gray-400'}
                    >
                      {isSpeaking ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setMessages([])}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-64 overflow-y-auto space-y-3">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Bot className="w-12 h-12 text-gray-400 mb-3" />
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      Hello! I'm here to support you on your forgiveness journey.
                    </p>
                    <p className="text-sm text-gray-500">
                      Share what's on your mind, ask questions, or tell me about your progress.
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        {message.emotion && (
                          <Badge variant="outline" className="mt-2 text-xs">
                            Detected: {message.emotion}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </CardContent>
            </Card>

            {/* Chat Input */}
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Share your thoughts or ask for guidance..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleVoiceInput}
                disabled={isListening}
                className={isListening ? 'animate-pulse text-red-500' : ''}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button 
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || sendMessageMutation.isPending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          {/* Mood Check Tab */}
          <TabsContent value="mood" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  How are you feeling right now?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Mood Selection */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Current Mood</label>
                  <div className="grid grid-cols-4 gap-3">
                    {moodOptions.map((mood) => (
                      <button
                        key={mood.value}
                        onClick={() => setCurrentMood(mood.value)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          currentMood === mood.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`${mood.color} mb-2 flex justify-center`}>
                          {mood.icon}
                        </div>
                        <p className="text-xs font-medium">{mood.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Emotion Tags */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Additional Emotions (optional)</label>
                  <div className="flex flex-wrap gap-2">
                    {emotionOptions.map((emotion) => (
                      <button
                        key={emotion}
                        onClick={() => {
                          if (selectedEmotions.includes(emotion)) {
                            setSelectedEmotions(selectedEmotions.filter(e => e !== emotion));
                          } else {
                            setSelectedEmotions([...selectedEmotions, emotion]);
                          }
                        }}
                        className={`px-3 py-1 rounded-full text-sm transition-all ${
                          selectedEmotions.includes(emotion)
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {emotion}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Intensity Scale */}
                <div>
                  <label className="text-sm font-medium mb-3 block">
                    Intensity Level: {moodIntensity}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={moodIntensity}
                    onChange={(e) => setMoodIntensity(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Mild</span>
                    <span>Intense</span>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Additional Notes (optional)</label>
                  <Textarea
                    value={moodNotes}
                    onChange={(e) => setMoodNotes(e.target.value)}
                    placeholder="Any specific thoughts or triggers you'd like to note..."
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={handleRecordMood}
                  disabled={!currentMood || recordMoodMutation.isPending}
                  className="w-full"
                >
                  {recordMoodMutation.isPending ? 'Recording...' : 'Record Mood & Get Insights'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Breathing Exercises Tab */}
          <TabsContent value="breathing" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {breathingExercises.map((exercise, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Wind className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">{exercise.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      {exercise.description}
                    </p>
                    <Badge variant="outline">{exercise.duration}</Badge>
                    <Button className="w-full mt-4" size="sm">
                      Start Exercise
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Calm Button */}
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold mb-4">Need Quick Calm?</h3>
                <div className="flex justify-center space-x-4">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    5-Minute Reset
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Guided Meditation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            {emotionalInsights ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Emotional Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">This Week's Trend</p>
                        <p className="font-semibold text-green-600">Improving ↗</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Most Common Mood</p>
                        <p className="font-semibold">Peaceful</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Progress Score</p>
                        <Progress value={73} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">73% positive emotions</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <Sparkles className="w-4 h-4 text-purple-500 mt-0.5" />
                        <p className="text-sm">Continue your morning journaling practice</p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Sparkles className="w-4 h-4 text-purple-500 mt-0.5" />
                        <p className="text-sm">Try the 4-7-8 breathing when feeling anxious</p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Sparkles className="w-4 h-4 text-purple-500 mt-0.5" />
                        <p className="text-sm">Consider sharing your progress in the community</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    Start Tracking Your Emotions
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Record your moods to get personalized insights and recommendations
                  </p>
                  <Button onClick={() => setActiveTab('mood')}>
                    Record Your First Mood
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}