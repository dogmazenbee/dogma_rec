import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Upload, Check, Calendar as CalendarIcon, X } from 'lucide-react';

interface VideoSchedule {
  [date: string]: {
    filename: string;
    url: string;
  };
}

const Calendar = () => {
  const [currentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [videoSchedule, setVideoSchedule] = useState<VideoSchedule>({});
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      
      // Validate file type
      if (!file.type.startsWith('video/')) {
        setUploadError('Por favor, sube solo archivos de video.');
        return;
      }

      // In a real app, you would upload to a server here
      // For demo, we'll create an object URL
      const url = URL.createObjectURL(file);
      
      setVideoSchedule(prev => ({
        ...prev,
        [format(date, 'yyyy-MM-dd')]: {
          filename: file.name,
          url: url
        }
      }));
      
      setSelectedDate(date);
      setUploadError(null);
    }
  };

  const removeVideo = (date: string) => {
    const newSchedule = { ...videoSchedule };
    URL.revokeObjectURL(newSchedule[date].url);
    delete newSchedule[date];
    setVideoSchedule(newSchedule);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <CalendarIcon className="text-teal-600" />
              Calendario de Videos
            </h1>
            <p className="text-lg text-gray-600">
              {format(currentDate, 'MMMM yyyy', { locale: es })}
            </p>
          </div>

          {uploadError && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
              <X size={20} />
              {uploadError}
            </div>
          )}

          <div className="grid grid-cols-7 gap-4">
            {/* Day headers */}
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
              <div
                key={day}
                className="text-center font-semibold text-gray-600 pb-2"
              >
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {daysInMonth.map(date => {
              const dateStr = format(date, 'yyyy-MM-dd');
              const hasVideo = dateStr in videoSchedule;
              
              return (
                <div
                  key={dateStr}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, date)}
                  className={`
                    relative aspect-square rounded-lg border-2 transition-all
                    ${isDragging ? 'border-teal-400 bg-teal-50' : 'border-gray-200'}
                    ${hasVideo ? 'bg-teal-50 border-teal-200' : 'hover:border-teal-200'}
                  `}
                >
                  <div className="absolute top-2 left-2 text-sm font-medium text-gray-700">
                    {format(date, 'd')}
                  </div>
                  
                  {hasVideo ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                      <Check className="text-teal-600 mb-1" size={20} />
                      <p className="text-xs text-center text-teal-700 truncate w-full px-2">
                        {videoSchedule[dateStr].filename}
                      </p>
                      <button
                        onClick={() => removeVideo(dateStr)}
                        className="mt-1 text-xs text-red-500 hover:text-red-600"
                      >
                        Eliminar
                      </button>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <div className="flex flex-col items-center text-teal-600">
                        <Upload size={20} />
                        <span className="text-xs mt-1">Subir video</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="mt-6 text-sm text-gray-600">
            Arrastra y suelta un archivo de video sobre cualquier día para programarlo.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Calendar;