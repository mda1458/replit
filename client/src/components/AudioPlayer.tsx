import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";

interface AudioPlayerProps {
  audio: {
    id: string;
    title: string;
    instructor: string;
    duration: number;
    image: string;
  };
  isPlaying: boolean;
  onPlayPause: () => void;
  onProgress: (progress: number) => void;
}

export default function AudioPlayer({ audio, isPlaying, onPlayPause, onProgress }: AudioPlayerProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          const newProgress = (newTime / audio.duration) * 100;
          setProgress(newProgress);
          onProgress(newProgress);
          
          if (newTime >= audio.duration) {
            onPlayPause();
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, audio.duration, onProgress, onPlayPause]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = Math.floor((clickX / width) * audio.duration);
    setCurrentTime(newTime);
    setProgress((newTime / audio.duration) * 100);
  };

  return (
    <Card className="bg-gradient-to-r from-secondary/10 to-primary/10">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center text-2xl">
            {audio.image}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">{audio.title}</h3>
            <p className="text-sm text-gray-600">{audio.instructor}</p>
            <p className="text-xs text-gray-500">{formatTime(audio.duration)}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Button
              size="sm"
              variant="outline"
              className="w-10 h-10 rounded-full p-0"
              onClick={() => {
                const newTime = Math.max(0, currentTime - 15);
                setCurrentTime(newTime);
                setProgress((newTime / audio.duration) * 100);
              }}
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            
            <Button
              size="sm"
              onClick={onPlayPause}
              className="w-12 h-12 bg-primary rounded-full p-0 hover:bg-primary/90"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white" />
              )}
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              className="w-10 h-10 rounded-full p-0"
              onClick={() => {
                const newTime = Math.min(audio.duration, currentTime + 15);
                setCurrentTime(newTime);
                setProgress((newTime / audio.duration) * 100);
              }}
            >
              <SkipForward className="w-4 h-4" />
            </Button>
            
            <div className="flex-1">
              <div className="flex items-center space-x-1 h-8">
                {[20, 30, 25, 35, 15, 28].map((height, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all duration-200 ${
                      isPlaying ? 'bg-primary audio-wave' : 'bg-gray-300'
                    }`}
                    style={{
                      height: `${height}px`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            </div>
            
            <span className="text-sm text-gray-500">
              {formatTime(currentTime)} / {formatTime(audio.duration)}
            </span>
          </div>
          
          <div 
            className="w-full bg-gray-200 rounded-full h-2 cursor-pointer"
            onClick={handleSeek}
          >
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
