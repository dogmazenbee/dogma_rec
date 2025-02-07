import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Camera, Mic, MicOff, CameraOff, Volume2, VolumeX } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  joinedAt: Date;
  audioStream?: MediaStream;
}

const VideoRoom = () => {
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isMainVideoLoading, setIsMainVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isMainVideoMuted, setIsMainVideoMuted] = useState(false);
  const [volume, setVolume] = useState(50); // Volumen inicial al 50%
  const [isVolumeControlVisible, setIsVolumeControlVisible] = useState(false);
  const mainVideoRef = useRef<HTMLVideoElement>(null);
  const userVideoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const userName = location.state?.name || 'Anonymous';

  useEffect(() => {
    audioContextRef.current = new AudioContext();

    const now = new Date();
    const hours = now.getHours();
    if (hours < 7 || hours >= 21) {
      navigate('/');
      return;
    }

    const currentUser: Participant = {
      id: 'current-user',
      name: userName,
      joinedAt: new Date()
    };
    setParticipants([currentUser]);

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [userName, navigate]);

  useEffect(() => {
    startUserMedia();

    if (mainVideoRef.current) {
      mainVideoRef.current.src = "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
      mainVideoRef.current.loop = true;
      mainVideoRef.current.muted = false;
      mainVideoRef.current.volume = volume / 100; // Convertir porcentaje a decimal
      
      const video = mainVideoRef.current;
      
      const handleCanPlay = () => {
        setIsMainVideoLoading(false);
        setVideoError(null);
        video.play().catch(error => {
          setVideoError('Error reproduciendo el video. Por favor, recarga la página.');
          console.error('Error playing video:', error);
        });
      };

      const handleError = (error: Event) => {
        setIsMainVideoLoading(false);
        setVideoError('Error cargando el video. Por favor, verifica tu conexión a internet e intenta de nuevo.');
        console.error('Error loading video:', error);
      };

      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('error', handleError);

      return () => {
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('error', handleError);
        video.pause();
        video.src = '';
        video.load();
      };
    }
  }, []);

  // Actualizar el volumen cuando cambie
  useEffect(() => {
    if (mainVideoRef.current) {
      mainVideoRef.current.volume = volume / 100;
    }
  }, [volume]);

  const startUserMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = stream;
      }

      if (audioContextRef.current) {
        const source = audioContextRef.current.createMediaStreamSource(stream);
        const gainNode = audioContextRef.current.createGain();
        gainNode.gain.value = 1.0;
        source.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);
      }
    } catch (err) {
      console.error('Error accessing media devices:', err);
    }
  };

  const toggleCamera = () => {
    if (userVideoRef.current && userVideoRef.current.srcObject) {
      const stream = userVideoRef.current.srcObject as MediaStream;
      stream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsCameraOn(!isCameraOn);
    }
  };

  const toggleMic = () => {
    if (userVideoRef.current && userVideoRef.current.srcObject) {
      const stream = userVideoRef.current.srcObject as MediaStream;
      stream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMicOn(!isMicOn);
    }
  };

  const toggleMainVideoAudio = () => {
    if (mainVideoRef.current) {
      mainVideoRef.current.muted = !mainVideoRef.current.muted;
      setIsMainVideoMuted(!isMainVideoMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
  };

  return (
    <div className="min-h-screen bg-[#1a4a4a] bg-gradient-to-br from-[#1a4a4a] via-[#1a4a4a] to-[#0d2828] p-8">
      <div className="flex-1 flex flex-col space-y-12">
        <div className="relative w-full aspect-video bg-gray-800 rounded-3xl overflow-hidden">
          {isMainVideoLoading && !videoError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
            </div>
          )}
          {videoError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="text-white text-center px-4">
                <p className="text-red-400 mb-2">⚠️</p>
                <p>{videoError}</p>
              </div>
            </div>
          )}
          <video
            ref={mainVideoRef}
            className="w-full h-full object-cover"
            playsInline
            preload="auto"
          />
          
          {/* Control de Volumen */}
          <div 
            className="absolute bottom-6 right-6 flex items-center gap-2"
            onMouseEnter={() => setIsVolumeControlVisible(true)}
            onMouseLeave={() => setIsVolumeControlVisible(false)}
          >
            <div className={`transition-all duration-300 ${isVolumeControlVisible ? 'opacity-100 w-32' : 'opacity-0 w-0'}`}>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <button
              onClick={toggleMainVideoAudio}
              className="p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
            >
              {isMainVideoMuted ? 
                <VolumeX size={24} className="text-white" /> : 
                <Volume2 size={24} className="text-white" />
              }
            </button>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-6 px-12">
          <div className="relative animate-fadeIn">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-teal-400 shadow-lg">
              <video
                ref={userVideoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
            </div>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full text-sm shadow-md">
              {userName}
            </div>
          </div>

          {participants.slice(1).map((participant) => (
            <div key={participant.id} className="relative animate-fadeIn">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/30 shadow-lg">
                <img
                  src={`https://source.unsplash.com/random/200x200?portrait&sig=${participant.id}`}
                  alt={participant.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full text-sm shadow-md">
                {participant.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex justify-center gap-4">
        <button
          onClick={toggleCamera}
          className={`p-4 rounded-lg transition-colors ${
            isCameraOn ? 'bg-[#2a5a5a] hover:bg-[#1a4a4a]' : 'bg-red-500 hover:bg-red-600'
          }`}
        >
          {isCameraOn ? <Camera size={24} className="text-white" /> : <CameraOff size={24} className="text-white" />}
        </button>
        <button
          onClick={toggleMic}
          className={`p-4 rounded-lg transition-colors ${
            isMicOn ? 'bg-[#2a5a5a] hover:bg-[#1a4a4a]' : 'bg-red-500 hover:bg-red-600'
          }`}
        >
          {isMicOn ? <Mic size={24} className="text-white" /> : <MicOff size={24} className="text-white" />}
        </button>
        <button
          onClick={() => navigate('/')}
          className="p-4 rounded-lg bg-red-500 hover:bg-red-600 transition-colors"
        >
          <LogOut size={24} className="text-white" />
        </button>
      </div>
    </div>
  );
};

export default VideoRoom;