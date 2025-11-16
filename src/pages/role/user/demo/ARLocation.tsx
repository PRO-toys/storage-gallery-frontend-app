// src/pages/role/user/demo/ARLocation.tsx
import React, { useEffect } from 'react';

// ✅ Declare A-Frame elements inline so TypeScript understands them
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'a-scene': any;
      'a-marker': any;
      'a-entity': any;
      'a-image': any;
    }
  }
}

// 🖼️ Use full relative imports for images and marker files
import imageYamo from '../../../../assets/images/role/user/demo/ar/images/image1.jpg';
import imageWatbanrai from '../../../../assets/images/role/user/demo/ar/images/image2.jpg';
import markerPatt from '../../../../assets/images/role/user/demo/ar/markers/pattern-marker.patt?url';
import markerImg from '../../../../assets/images/role/user/demo/ar/markers/pattern-marker.png';

const ARLocation: React.FC = () => {
  useEffect(() => {
    // Load A-Frame
    const aframeScript = document.createElement('script');
    aframeScript.src = 'https://aframe.io/releases/1.2.0/aframe.min.js';
    aframeScript.async = true;
    document.body.appendChild(aframeScript);

    // Load AR.js
    const arjsScript = document.createElement('script');
    arjsScript.src = 'https://cdn.rawgit.com/jeromeetienne/AR.js/master/aframe/build/aframe-ar.min.js';
    arjsScript.async = true;
    document.body.appendChild(arjsScript);

    return () => {
      document.body.removeChild(aframeScript);
      document.body.removeChild(arjsScript);
    };
  }, []);

  const setLocation = (place: string) => {
    const imageEl = document.getElementById('ar-image');
    if (imageEl) {
      const src = place === 'watbanrai' ? imageWatbanrai : imageYamo;
      imageEl.setAttribute('src', src);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-6 text-center text-gray-800">
        <h1 className="text-2xl font-bold mb-4">🌐 AR Location Viewer – ย่าโม / วัดบ้านไร่</h1>

        {/* Download Marker */}
        <div className="mb-4">
          <a
            href={markerImg}
            download="pattern-marker.png"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            📥 ดาวน์โหลด Marker
          </a>
        </div>

        {/* Location Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <div className="text-center">
            <button
              onClick={() => setLocation('yamo')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              🛕 ย่าโม
            </button>
            <div className="text-sm text-gray-700 mt-2">
              อนุสาวรีย์ท้าวสุรนารี<br />
              14.975099953370801, 102.09817532679601
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => setLocation('watbanrai')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              🙏 วัดบ้านไร่
            </button>
            <div className="text-sm text-gray-700 mt-2">
              วัดบ้านไร่ หลวงพ่อคูณ<br />
              15.437819511656146, 101.77105082933898
            </div>
          </div>
        </div>

        {/* AR Scene */}
        <div className="relative w-full h-[70vh] rounded overflow-hidden bg-black">
          <a-scene
            embedded
            vr-mode-ui="enabled: false"
            arjs="sourceType: webcam; debugUIEnabled: false;"
          >
            <a-marker id="ar-marker" type="pattern" url={markerPatt}>
              <a-image
                id="ar-image"
                src={imageYamo}
                width="1"
                height="1"
                position="0 0.5 0"
                rotation="-90 0 0"
              ></a-image>
            </a-marker>
            <a-entity camera></a-entity>
          </a-scene>
        </div>
      </div>
    </div>
  );
};

export default ARLocation;
