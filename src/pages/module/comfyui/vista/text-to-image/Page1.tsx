// src/pages/module/comfyui/vista/text-to-image/Page1.tsx
import React, { useState } from 'react';
import axios from 'axios';
import ModalLoading from '../../../../../components/modal/ModalLoading';
import { downloadFile } from '../../../../../utils/downLoad';
import config from '../../../../../config/config.json';

// Preset resolutions (no ratio labels)
const resolutions = [
  { label: '704×1408', width: 704, height: 1408 },
  { label: '704×1344', width: 704, height: 1344 },
  { label: '768×1344', width: 768, height: 1344 },
  { label: '768×1280', width: 768, height: 1280 },
  { label: '832×1216', width: 832, height: 1216 },
  { label: '832×1152', width: 832, height: 1152 },
  { label: '896×1152', width: 896, height: 1152 },
  { label: '896×1088', width: 896, height: 1088 },
  { label: '960×1088', width: 960, height: 1088 },
  { label: '960×1024', width: 960, height: 1024 },
  { label: '1024×1024', width: 1024, height: 1024 }, // default
  { label: '1024×960', width: 1024, height: 960 },
  { label: '1088×960', width: 1088, height: 960 },
  { label: '1088×896', width: 1088, height: 896 },
  { label: '1152×896', width: 1152, height: 896 },
  { label: '1152×832', width: 1152, height: 832 },
  { label: '1216×832', width: 1216, height: 832 },
  { label: '1280×768', width: 1280, height: 768 },
  { label: '1344×768', width: 1344, height: 768 },
  { label: '1344×704', width: 1344, height: 704 },
  { label: '1408×704', width: 1408, height: 704 },
  { label: '1472×704', width: 1472, height: 704 },
  { label: '1536×640', width: 1536, height: 640 },
  { label: '1600×640', width: 1600, height: 640 },
  { label: '1664×576', width: 1664, height: 576 },
  { label: '1728×576', width: 1728, height: 576 },
];

const defaultIndex = 10; // 1024×1024

const Page1: React.FC = () => {
  const [prompt, setPrompt] = useState('vista a woman hold camera');
  const [promptNegative, setPromptNegative] = useState(
    'worst quality, low quality, normal quality, lowres, low details, oversaturated, undersaturated, overexposed, underexposed, grayscale, bad photo, bad photography'
  );
  const [seedMode, setSeedMode] = useState('fixed');
  const [fileType, setFileType] = useState('JPEG');
  const [dimensionWidth, setDimensionWidth] = useState(resolutions[defaultIndex].width);
  const [dimensionHeight, setDimensionHeight] = useState(resolutions[defaultIndex].height);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    try {
      setLoading(true);
      const response = await axios.post(`${config.URL_MODULE}/api/comfyui/vista/text-to-image`, {
        prompt_text: prompt,
        seed_mode: seedMode,
        prompt_negative: promptNegative,
        file_type: fileType,
        dimension_width: dimensionWidth,
        dimension_height: dimensionHeight,
      });
      if (response.data.status === 'success') {
        const ext = fileType.toLowerCase();
        setImageUrl(`${config.URL_MODULE}/resource/output/RenderImage1.${ext}?v=${Date.now()}`);
      }
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (imageUrl) {
      const ext = fileType.toLowerCase();
      downloadFile(imageUrl, `vista-image.${ext}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {loading && <ModalLoading />}
      <div className="w-full max-w-6xl bg-white p-6 rounded-2xl shadow-lg flex gap-8">
        {/* LEFT COLUMN - Prompt */}
        <div className="w-1/2 flex flex-col">
          <h1 className="text-3xl font-bold mb-4">VISTA - Text to Image</h1>
          <p className="text-gray-600 mb-4">
            Generate stunning images of VISTA using AI. Use descriptive prompts and choose options.
          </p>

          <label className="font-semibold">Prompt</label>
          <textarea
            placeholder="Enter your prompt..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-3 h-28 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 resize-none"
          />

          <label className="font-semibold">Negative Prompt</label>
          <textarea
            placeholder="Negative prompts..."
            value={promptNegative}
            onChange={(e) => setPromptNegative(e.target.value)}
            className="w-full p-3 h-24 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 mb-4 resize-none"
          />

          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full py-2 rounded-lg transition duration-200 ${
              loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
            } text-white`}
          >
            {loading ? 'Generating...' : 'Generate Image'}
          </button>
        </div>

        {/* RIGHT COLUMN - Settings + Image Preview SIDE BY SIDE */}
        <div className="w-1/2 flex flex-col gap-6">
          <div className="flex gap-6 w-full">
            {/* SETTINGS (left of right panel) */}
            <div className="w-1/2 bg-gray-50 border border-gray-200 p-4 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-3 text-gray-700">Settings</h2>

              <label className="block font-medium mb-1">Seed Mode</label>
              <select
                value={seedMode}
                onChange={(e) => setSeedMode(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              >
                <option value="fixed">Fixed</option>
                <option value="randomize">Randomize</option>
              </select>

              <label className="block font-medium mb-1">File Type</label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              >
                <option value="JPEG">JPEG</option>
                <option value="PNG">PNG</option>
              </select>

              <label className="block font-medium mb-1">Resolution</label>
              <select
                defaultValue={defaultIndex}
                onChange={(e) => {
                  const selected = resolutions[parseInt(e.target.value)];
                  setDimensionWidth(selected.width);
                  setDimensionHeight(selected.height);
                }}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
              >
                {resolutions.map((res, index) => (
                  <option key={index} value={index}>
                    {res.label}
                  </option>
                ))}
              </select>

              <p className="text-sm text-gray-500">
                Selected: {dimensionWidth} × {dimensionHeight}
              </p>
            </div>

            {/* IMAGE PREVIEW (right of right panel) */}
            <div className="w-1/2 flex flex-col items-center justify-start">
              {imageUrl ? (
                <>
                  <img
                    src={imageUrl}
                    alt="Generated"
                    className="w-full h-auto rounded-lg shadow-md border border-gray-300 mb-4"
                  />
                  <button
                    onClick={handleDownload}
                    className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-200"
                  >
                    Download Image
                  </button>
                </>
              ) : (
                <div className="text-gray-500 mt-4 text-center">Image will appear here</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page1;
