import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Mic, UserCheck } from 'lucide-react';

const JoinRoom = () => {
  const [name, setName] = useState('');
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOn(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  const toggleMic = async () => {
    if (isMicOn && micStream) {
      // Desactivar micrófono
      micStream.getTracks().forEach(track => track.stop());
      setMicStream(null);
      setIsMicOn(false);
    } else {
      try {
        // Activar micrófono
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicStream(stream);
        setIsMicOn(true);
      } catch (err) {
        console.error('Error accessing microphone:', err);
      }
    }
  };

  const handleJoin = () => {
    if (name && isCameraOn) {
      navigate('/room', { state: { name } });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Unirse a la Sala</h1>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tu Nombre
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Ingresa tu nombre"
          />
        </div>

        <div className="mb-6">
          <video
            ref={videoRef}
            autoPlay
            muted
            className="w-full h-48 bg-gray-100 rounded-md object-cover"
          />
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={startCamera}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md ${
              isCameraOn ? 'bg-green-500 text-white' : 'bg-gray-200'
            }`}
          >
            <Camera size={20} />
            Cámara
          </button>
          <button
            onClick={toggleMic}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
              isMicOn 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            <Mic size={20} />
            Micrófono (Opcional)
          </button>
        </div>

        <button
          onClick={handleJoin}
          disabled={!name || !isCameraOn}
          className="w-full bg-teal-600 text-white py-2 px-4 rounded-md flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <UserCheck size={20} />
          Entrar a la Sala
        </button>
      </div>
    </div>
  );
};

export default JoinRoom;