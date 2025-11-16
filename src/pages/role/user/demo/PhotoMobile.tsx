// src/pages/role/user/demo/PhotoMobile.tsx
import React, { useRef, useState } from 'react';

const PhotoMobile: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [capturedImages, setCapturedImages] = useState<(string | null)[]>([null, null, null]);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const openCamera = async (index: number) => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
      setCurrentIndex(index);
      setShowCamera(true);
    } catch (err) {
      alert('ไม่สามารถเปิดกล้องได้');
    }
  };

  const capture = () => {
    if (!videoRef.current || !canvasRef.current || currentIndex === null) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const size = Math.min(video.videoWidth, video.videoHeight);
    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;

    canvas.width = size;
    canvas.height = size;
    ctx?.drawImage(video, sx, sy, size, size, 0, 0, size, size);

    const dataUrl = canvas.toDataURL('image/jpeg');
    const updatedImages = [...capturedImages];
    updatedImages[currentIndex] = dataUrl;
    setCapturedImages(updatedImages);
    stopCamera();
  };

  const stopCamera = () => {
    stream?.getTracks().forEach((track) => track.stop());
    setShowCamera(false);
  };

  const reset = () => {
    setCapturedImages([null, null, null]);
  };

  const submit = () => {
    if (capturedImages.includes(null)) {
      alert('⚠️ กรุณาถ่ายรูปให้ครบ');
      return;
    }
    alert('✅ บันทึกแล้ว'); // Replace with real upload logic
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4">
      <h2 className="text-2xl font-bold text-center mb-6">📱 ถ่ายรูป 3 รูป</h2>

      {[0, 1, 2].map((index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-4 mb-6 text-center">
          <div className="w-full aspect-square bg-gray-200 rounded overflow-hidden flex items-center justify-center">
            {capturedImages[index] ? (
              <img src={capturedImages[index]!} className="w-full h-full object-cover" alt={`Preview ${index + 1}`} />
            ) : (
              <p className="text-gray-500 text-lg">ยังไม่ได้ถ่ายรูปที่ {index + 1}</p>
            )}
          </div>
          <button
            className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            onClick={() => openCamera(index)}
          >
            📸 ถ่ายรูปที่ {index + 1}
          </button>
        </div>
      ))}

      <div className="flex justify-around mt-6">
        <button className="bg-green-600 text-white py-2 px-6 rounded hover:bg-green-700" onClick={submit}>
          ✅ บันทึก
        </button>
        <button className="bg-red-600 text-white py-2 px-6 rounded hover:bg-red-700" onClick={reset}>
          🗑 ล้างใหม่
        </button>
      </div>

      {showCamera && (
        <div className="fixed inset-0 bg-black flex flex-col justify-center items-center z-50">
          <video ref={videoRef} autoPlay playsInline className="w-screen h-screen object-cover" />
          <button
            className="absolute bottom-10 bg-green-600 text-white py-2 px-6 rounded text-xl"
            onClick={capture}
          >
            📸 ถ่าย
          </button>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default PhotoMobile;
