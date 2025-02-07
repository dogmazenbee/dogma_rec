import React, { useState } from 'react';
import { Calendar, Upload } from 'lucide-react';
import { format } from 'date-fns';

const AdminPanel = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [uploadedVideos, setUploadedVideos] = useState<{[key: string]: string}>({});

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real application, you would upload the file to a server
      // For now, we'll just store the filename
      const dateKey = format(selectedDate, 'yyyy-MM-dd');
      setUploadedVideos(prev => ({
        ...prev,
        [dateKey]: file.name
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex gap-8">
            {/* Calendar */}
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar size={24} />
                Schedule Videos
              </h2>
              
              <div className="border rounded-lg p-4">
                {/* Simple calendar implementation */}
                <input
                  type="date"
                  value={format(selectedDate, 'yyyy-MM-dd')}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            {/* Upload Section */}
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Upload size={24} />
                Upload Video
              </h2>

              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-4">
                  Selected date: {format(selectedDate, 'MMMM d, yyyy')}
                </p>

                <label className="block">
                  <span className="sr-only">Choose video file</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-teal-50 file:text-teal-700
                      hover:file:bg-teal-100"
                  />
                </label>

                {uploadedVideos[format(selectedDate, 'yyyy-MM-dd')] && (
                  <p className="mt-4 text-sm text-green-600">
                    ✓ Video uploaded: {uploadedVideos[format(selectedDate, 'yyyy-MM-dd')]}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Video Schedule */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Scheduled Videos</h2>
          <div className="divide-y">
            {Object.entries(uploadedVideos).map(([date, filename]) => (
              <div key={date} className="py-3 flex justify-between items-center">
                <span>{format(new Date(date), 'MMMM d, yyyy')}</span>
                <span className="text-gray-600">{filename}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;