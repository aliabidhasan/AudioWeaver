import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Summary, AudioNote } from "@/lib/types";
import { formatTime } from "@/lib/utils";
import { downloadAudio, saveAudioNote, getAudioNotes } from "@/lib/api";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface AudioPlayerProps {
  summary: Summary;
  onReflect: () => void;
}

export default function AudioPlayer({ summary, onReflect }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180); // Default 3-minute duration for prototype
  const [volume, setVolume] = useState(70);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const simulationTimerRef = useRef<number | null>(null);
  const { toast } = useToast();

  // State for audio notes
  const [audioNotes, setAudioNotes] = useState<AudioNote[]>([]);
  const [newNoteText, setNewNoteText] = useState<string>('');
  const [isAddingNote, setIsAddingNote] = useState<boolean>(false);
  
  useEffect(() => {
    // Create audio element
    const audio = new Audio(summary.audioUrl);
    audioRef.current = audio;
    
    // Event handlers
    const handleError = () => {
      console.log('Audio loading error - using simulated audio for prototype');
      setDuration(180); // 3 minutes default duration
    };
    
    const handleLoadedMetadata = () => {
      if (!audio.duration || isNaN(audio.duration)) {
        setDuration(180); // 3 minutes default duration
      } else {
        setDuration(audio.duration);
      }
    };
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
    };
    
    // Add event listeners
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    
    // Set volume
    audio.volume = volume / 100;
    
    // Cleanup function
    return () => {
      // Stop any playing audio
      audio.pause();
      audio.src = '';
      
      // Clear simulation timer if active
      if (simulationTimerRef.current) {
        clearInterval(simulationTimerRef.current);
        simulationTimerRef.current = null;
      }
      
      // Remove event listeners
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [summary.audioUrl, volume]);

  // Effect to fetch audio notes when summary ID changes
  useEffect(() => {
    if (!summary.id) return;

    const fetchNotes = async () => {
      try {
        const fetchedNotes = await getAudioNotes(summary.id.toString());
        setAudioNotes(fetchedNotes.sort((a, b) => a.timestamp - b.timestamp));
      } catch (error) {
        console.error("Failed to fetch audio notes:", error);
        toast({
          title: "Error",
          description: "Could not load audio notes for this summary.",
          variant: "destructive",
        });
      }
    };

    fetchNotes();
  }, [summary.id, toast]);
  
  // Handle play/pause
  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      // If currently playing, pause
      audioRef.current.pause();
      
      // Clear simulation timer if active
      if (simulationTimerRef.current) {
        clearInterval(simulationTimerRef.current);
        simulationTimerRef.current = null;
      }
      
      setIsPlaying(false);
    } else {
      // Try to play actual audio
      audioRef.current.play()
        .then(() => {
          // Audio successfully started playing
          setIsPlaying(true);
        })
        .catch(error => {
          console.log('Using simulated audio playback for prototype:', error);
          
          // Start a timer to simulate playback
          const timer = window.setInterval(() => {
            setCurrentTime(prevTime => {
              const newTime = Math.min(prevTime + 0.1, duration);
              
              // If reached the end, stop simulation
              if (newTime >= duration) {
                if (simulationTimerRef.current) {
                  clearInterval(simulationTimerRef.current);
                  simulationTimerRef.current = null;
                }
                setIsPlaying(false);
              }
              
              return newTime;
            });
          }, 100);
          
          // Store timer ID for cleanup
          simulationTimerRef.current = timer;
          
          // Set playing state
          setIsPlaying(true);
        });
    }
  };
  
  // Handle seeking
  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return;
    
    const seekTime = value[0];
    const newTime = (seekTime / 100) * duration;
    
    // Update the audio element if it's a real audio
    try {
      audioRef.current.currentTime = newTime;
    } catch (e) {
      // If direct seek fails, just update the state
      console.log('Direct seek failed, updating state only');
    }
    
    // Always update the state
    setCurrentTime(newTime);
  };
  
  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return;
    
    const newVolume = value[0];
    audioRef.current.volume = newVolume / 100;
    setVolume(newVolume);
  };
  
  // Handle download
  const handleDownload = async () => {
    try {
      const audioBlob = await downloadAudio(summary.id);
      const url = URL.createObjectURL(audioBlob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${summary.title}.mp3`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download audio:', error);
    }
  };

  const handleAddNote = async () => {
    if (!summary.id) return;
    const summaryIdStr = summary.id.toString();

    if (!newNoteText.trim()) {
      toast({
        title: "Error",
        description: "Note text cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    if (!audioRef.current) {
      toast({
        title: "Error",
        description: "Audio player not available.",
        variant: "destructive",
      });
      return;
    }

    const currentPlaybackTime = Math.round(audioRef.current.currentTime);
    setIsAddingNote(true);

    try {
      const savedNote = await saveAudioNote(summaryIdStr, {
        timestamp: currentPlaybackTime,
        text: newNoteText,
      });
      setAudioNotes(prevNotes => [...prevNotes, savedNote].sort((a, b) => a.timestamp - b.timestamp));
      setNewNoteText('');
      toast({
        title: "Note Added",
        description: `Note added at ${formatTime(currentPlaybackTime)}.`,
      });
    } catch (error) {
      console.error("Failed to add note:", error);
      toast({
        title: "Error",
        description: "Failed to add your note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleNoteClick = (note: AudioNote) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = note.timestamp;
    if (audioRef.current.paused) {
      audioRef.current.play().catch(e => console.error('Error playing audio on note click:', e));
    }
  };
  
  // Calculate progress percentage
  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;
  
  return (
    <section className="mb-8">
      <div className="bg-secondary text-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Your Audio Summary</h2>
            <span className="text-sm bg-primary/20 text-primary py-1 px-3 rounded-full">Summary</span>
          </div>
          
          <h3 className="text-2xl font-bold mb-4">{summary.title}</h3>
          <p className="text-gray-300 mb-8 leading-relaxed">{summary.description}</p>
          
          <div className="bg-black/30 rounded-lg p-4 mb-6">
            {/* Audio Player Controls */}
            <div className="flex items-center mb-4">
              <Button 
                variant="ghost" 
                className="text-white p-2 mr-4" 
                onClick={togglePlayPause}
              >
                {isPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                )}
              </Button>
              
              <div className="flex-1">
                <Slider
                  value={[progressPercentage]}
                  max={100}
                  step={0.1}
                  onValueChange={handleSeek}
                  className="h-1"
                />
                <div className="flex justify-between text-xs mt-2">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
              
              <div className="flex items-center ml-4">
                <Button variant="ghost" className="text-white p-2 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                  </svg>
                </Button>
                <Slider
                  value={[volume]}
                  max={100}
                  step={1}
                  onValueChange={handleVolumeChange}
                  className="w-20 h-1"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
              </svg>
              <span>1 Listen</span>
            </div>
            <div>
              <Button 
                variant="outline" 
                className="border-gray-600 text-white hover:border-gray-400 mr-2"
                onClick={handleDownload}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download
              </Button>
              <Button onClick={onReflect}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path>
                  <path d="M9 18h6"></path>
                  <path d="M10 22h4"></path>
                </svg>
                Reflect
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Document Summary Text */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <h3 className="text-xl font-semibold mb-4">Text Summary</h3>
          <div className="prose max-w-none text-accent">
            {summary.text.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Timestamped Notes Section */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <h3 className="text-xl font-semibold mb-4">Timestamped Notes</h3>

          {/* New Note Input Area */}
          <div className="mb-6 p-4 border rounded-lg">
            <Label htmlFor="new-note" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Add Note at {formatTime(currentTime)}
            </Label>
            <Textarea
              id="new-note"
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Type your note here..."
              className="mb-2"
            />
            <Button onClick={handleAddNote} disabled={isAddingNote} className="mt-2 w-full sm:w-auto">
              {isAddingNote ? 'Adding Note...' : 'Add Note'}
            </Button>
          </div>

          {/* Display Existing Notes */}
          <div className="space-y-3">
            {audioNotes.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400">No notes added yet. Add one above!</p>
            )}
            {audioNotes.map(note => (
              <div
                key={note.id}
                onClick={() => handleNoteClick(note)}
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md shadow-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <p className="text-sm font-semibold text-primary mb-1">
                  {formatTime(note.timestamp)}
                </p>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm">
                  {note.text}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
