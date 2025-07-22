import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Save, 
  Trash2,
  Volume2,
  Heart,
  Brain,
  Smile,
  Frown,
  Meh,
  TrendingUp,
  Calendar,
  Clock,
  FileText,
  BarChart3,
  Wind,
  Headphones
} from "lucide-react";

interface VoiceEntry {
  id: number;
  title: string;
  content: string;
  audioUrl?: string;
  duration: number;
  sentimentScore: number;
  sentimentLabel: string;
  emotions: string[];
  stepId?: number;
  createdAt: string;
}

interface SentimentAnalysis {
  overall: number;
  emotions: {
    [emotion: string]: number;
  };
  trends: Array<{
    date: string;
    sentiment: number;
  }>;
  insights: string[];
}

export default function VoiceJournaling() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<VoiceEntry | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [filterSentiment, setFilterSentiment] = useState('all');
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathingCount, setBreathingCount] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const breathingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Get voice entries
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['/api/voice-journal/entries', filterSentiment],
  });

  // Get sentiment analysis
  const { data: sentimentAnalysis } = useQuery({
    queryKey: ['/api/voice-journal/sentiment-analysis'],
  });

  // Save entry mutation
  const saveEntryMutation = useMutation({
    mutationFn: async ({ content, audioBlob, title }: { content: string; audioBlob?: Blob; title?: string }) => {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('title', title || `Voice Entry ${new Date().toLocaleDateString()}`);
      if (audioBlob) {
        formData.append('audio', audioBlob, 'voice-entry.wav');
      }
      
      const response = await fetch('/api/voice-journal/entries', {
        method: 'POST',
        body: formData,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Entry Saved",
        description: "Your voice journal entry has been saved and analyzed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/voice-journal'] });
      setCurrentTranscript('');
      setRecordingTime(0);
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Unable to save your entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCurrentTranscript(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast({
          title: "Voice Recognition Error",
          description: "There was an issue with voice recognition. Please try again.",
          variant: "destructive",
        });
      };
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (breathingTimerRef.current) clearInterval(breathingTimerRef.current);
    };
  }, [toast]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      toast({
        title: "Recording Error",
        description: "Unable to access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);

      // Stop speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        if (currentTranscript.trim()) {
          saveEntryMutation.mutate({
            content: currentTranscript,
            audioBlob,
          });
        }
      };
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getSentimentColor = (score: number) => {
    if (score >= 0.5) return 'text-green-600 bg-green-100';
    if (score >= 0) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getSentimentIcon = (score: number) => {
    if (score >= 0.5) return <Smile className="h-4 w-4" />;
    if (score >= 0) return <Meh className="h-4 w-4" />;
    return <Frown className="h-4 w-4" />;
  };

  const startBreathingExercise = () => {
    setIsBreathing(true);
    setBreathingPhase('inhale');
    setBreathingCount(0);
    
    let currentPhase: 'inhale' | 'hold' | 'exhale' = 'inhale';
    let currentCount = 0;
    
    breathingTimerRef.current = setInterval(() => {
      currentCount++;
      setBreathingCount(currentCount);
      
      if (currentPhase === 'inhale' && currentCount === 4) {
        currentPhase = 'hold';
        setBreathingPhase('hold');
        currentCount = 0;
      } else if (currentPhase === 'hold' && currentCount === 4) {
        currentPhase = 'exhale';
        setBreathingPhase('exhale');
        currentCount = 0;
      } else if (currentPhase === 'exhale' && currentCount === 6) {
        currentPhase = 'inhale';
        setBreathingPhase('inhale');
        currentCount = 0;
      }
    }, 1000);
  };

  const stopBreathingExercise = () => {
    setIsBreathing(false);
    if (breathingTimerRef.current) {
      clearInterval(breathingTimerRef.current);
      breathingTimerRef.current = null;
    }
  };

  const getBreathingInstruction = () => {
    switch (breathingPhase) {
      case 'inhale': return `Breathe in slowly... ${breathingCount}/4`;
      case 'hold': return `Hold your breath... ${breathingCount}/4`;
      case 'exhale': return `Breathe out slowly... ${breathingCount}/6`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Voice Journaling & Mindfulness
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Express your feelings through voice and discover insights through AI sentiment analysis
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recording Interface */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="record">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="record">Record Entry</TabsTrigger>
                <TabsTrigger value="entries">My Entries</TabsTrigger>
                <TabsTrigger value="analytics">Insights</TabsTrigger>
              </TabsList>

              <TabsContent value="record" className="space-y-6">
                {/* Breathing Exercise */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wind className="h-5 w-5" />
                      Mindful Breathing
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!isBreathing ? (
                      <div className="text-center space-y-4">
                        <p className="text-muted-foreground">
                          Start with a breathing exercise to center yourself before journaling
                        </p>
                        <Button onClick={startBreathingExercise} className="gap-2">
                          <Wind className="h-4 w-4" />
                          Begin Breathing Exercise
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center space-y-6">
                        <div className={`w-32 h-32 mx-auto rounded-full border-4 flex items-center justify-center text-2xl font-bold transition-all duration-1000 ${
                          breathingPhase === 'inhale' ? 'border-blue-500 bg-blue-100 scale-110' :
                          breathingPhase === 'hold' ? 'border-purple-500 bg-purple-100 scale-100' :
                          'border-green-500 bg-green-100 scale-90'
                        }`}>
                          <Wind className="h-12 w-12" />
                        </div>
                        <div>
                          <p className="text-lg font-medium">{getBreathingInstruction()}</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            4-4-6 breathing pattern for relaxation
                          </p>
                        </div>
                        <Button onClick={stopBreathingExercise} variant="outline">
                          Complete Exercise
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Voice Recording */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mic className="h-5 w-5" />
                      Voice Journal Entry
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Recording Controls */}
                    <div className="text-center space-y-4">
                      <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center transition-all duration-300 ${
                        isRecording ? 'bg-red-500 animate-pulse' : 'bg-blue-500 hover:bg-blue-600'
                      }`}>
                        <button
                          onClick={isRecording ? stopRecording : startRecording}
                          className="text-white"
                          disabled={saveEntryMutation.isPending}
                        >
                          {isRecording ? (
                            <MicOff className="h-8 w-8" />
                          ) : (
                            <Mic className="h-8 w-8" />
                          )}
                        </button>
                      </div>
                      
                      <div>
                        <p className="text-lg font-medium">
                          {isRecording ? 'Recording...' : 'Tap to start recording'}
                        </p>
                        {isRecording && (
                          <p className="text-sm text-muted-foreground">
                            {formatTime(recordingTime)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Live Transcript */}
                    {currentTranscript && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Live Transcript</label>
                        <Textarea
                          value={currentTranscript}
                          onChange={(e) => setCurrentTranscript(e.target.value)}
                          placeholder="Your voice will be transcribed here..."
                          rows={6}
                          className="resize-none"
                        />
                      </div>
                    )}

                    {/* Manual Save */}
                    {currentTranscript && !isRecording && (
                      <Button 
                        onClick={() => saveEntryMutation.mutate({ content: currentTranscript })}
                        disabled={saveEntryMutation.isPending}
                        className="w-full gap-2"
                      >
                        {saveEntryMutation.isPending ? (
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        Save Entry
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="entries">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Voice Journal Entries</CardTitle>
                      <select 
                        value={filterSentiment}
                        onChange={(e) => setFilterSentiment(e.target.value)}
                        className="px-3 py-1 border rounded-md text-sm"
                      >
                        <option value="all">All Entries</option>
                        <option value="positive">Positive</option>
                        <option value="neutral">Neutral</option>
                        <option value="negative">Negative</option>
                      </select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                      </div>
                    ) : entries.length > 0 ? (
                      <div className="space-y-4">
                        {entries.map((entry: VoiceEntry) => (
                          <div key={entry.id} className="p-4 border rounded-lg space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{entry.title}</h4>
                              <div className="flex items-center space-x-2">
                                <Badge className={getSentimentColor(entry.sentimentScore)}>
                                  {getSentimentIcon(entry.sentimentScore)}
                                  {entry.sentimentLabel}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {formatTime(entry.duration)}
                                </span>
                              </div>
                            </div>
                            
                            <p className="text-gray-700 dark:text-gray-300 line-clamp-3">
                              {entry.content}
                            </p>
                            
                            {entry.emotions.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {entry.emotions.slice(0, 3).map((emotion, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {emotion}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                              <div className="flex items-center space-x-2">
                                {entry.audioUrl && (
                                  <Button variant="ghost" size="sm">
                                    <Headphones className="h-4 w-4 mr-1" />
                                    Listen
                                  </Button>
                                )}
                                <Button variant="ghost" size="sm">
                                  <FileText className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Mic className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                          No Voice Entries Yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          Start recording your thoughts and feelings to build your voice journal
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics">
                <div className="space-y-6">
                  {/* Sentiment Trends */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Emotional Wellness Trends
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">
                              {Math.round((sentimentAnalysis?.overall || 0) * 100)}%
                            </p>
                            <p className="text-sm text-muted-foreground">Overall Positivity</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">
                              {entries.length}
                            </p>
                            <p className="text-sm text-muted-foreground">Total Entries</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-purple-600">
                              {Math.round(entries.reduce((sum: number, entry: VoiceEntry) => sum + entry.duration, 0) / 60)} min
                            </p>
                            <p className="text-sm text-muted-foreground">Total Recording Time</p>
                          </div>
                        </div>
                        
                        {sentimentAnalysis?.insights && (
                          <div className="space-y-2">
                            <h4 className="font-medium">AI Insights</h4>
                            {sentimentAnalysis.insights.map((insight: string, index: number) => (
                              <div key={index} className="flex items-start space-x-2">
                                <Brain className="h-4 w-4 mt-1 text-purple-600" />
                                <p className="text-sm">{insight}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Meditation Mini-Module */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Mindfulness Modules
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Wind className="h-4 w-4 mr-2" />
                  Breathing Exercise
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Heart className="h-4 w-4 mr-2" />
                  Loving Kindness
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Brain className="h-4 w-4 mr-2" />
                  Body Scan
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Smile className="h-4 w-4 mr-2" />
                  Gratitude Practice
                </Button>
              </CardContent>
            </Card>

            {/* Recent Emotions */}
            {sentimentAnalysis?.emotions && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Emotion Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(sentimentAnalysis.emotions).slice(0, 5).map(([emotion, score]) => (
                      <div key={emotion} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{emotion}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${(score as number) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {Math.round((score as number) * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Quick Prompts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-left justify-start text-xs"
                  onClick={() => setCurrentTranscript("Today I'm feeling grateful for...")}
                >
                  Express gratitude
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-left justify-start text-xs"
                  onClick={() => setCurrentTranscript("One thing I forgive myself for is...")}
                >
                  Practice self-forgiveness
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-left justify-start text-xs"
                  onClick={() => setCurrentTranscript("A breakthrough I had today was...")}
                >
                  Share a breakthrough
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-left justify-start text-xs"
                  onClick={() => setCurrentTranscript("I'm struggling with... and I need...")}
                >
                  Process difficult feelings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}