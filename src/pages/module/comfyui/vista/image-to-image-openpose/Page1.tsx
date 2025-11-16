// src/pages/module/comfyui/vista/image-to-image-openpose/Page1.tsx
import React, { useState } from 'react';
import axios from 'axios';
import ModalLoading from '../../../../../components/modal/ModalLoading';
import { downloadFile } from '../../../../../utils/downLoad';
import config from '../../../../../config/config.json';

const Page1: React.FC = () => {
    const [prompt, setPrompt] = useState('vista a woman hold camera');
    const [promptNegative, setPromptNegative] = useState(
        'worst quality, low quality, normal quality, lowres, low details, oversaturated, undersaturated, overexposed, underexposed, grayscale, bad photo, bad photography, bad art:1.4'
    );
    const [seedMode, setSeedMode] = useState('fixed');
    const [fileType, setFileType] = useState('JPEG');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [inputPreview, setInputPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [imageUploaded, setImageUploaded] = useState(false);

    const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setLoading(true);
            const res = await axios.post(`${config.URL_MODULE}/api/manage/upload-image`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (res.data.status === 'success') {
                const previewUrl = URL.createObjectURL(file);
                setInputPreview(previewUrl);
                setImageUploaded(true);
            } else {
                alert('Upload failed: ' + res.data.message);
            }
        } catch (error) {
            console.error('Upload error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!prompt.trim() || !imageUploaded) return;

        try {
            setLoading(true);
            const response = await axios.post(`${config.URL_MODULE}/api/comfyui/vista/image-to-image-openpose`, {
                prompt_text: prompt,
                seed_mode: seedMode,
                prompt_negative: promptNegative,
                file_type: fileType,
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
                {/* LEFT COLUMN */}
                <div className="w-1/2 flex flex-col">
                    <h1 className="text-3xl font-bold mb-4">VISTA - Image to Image OpenPose</h1>
                    <p className="text-gray-600 mb-4">
                        Upload a reference image and use prompts to generate AI images.
                    </p>

                    <label className="font-semibold">Upload Input Image</label>
                    <input
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        onChange={handleUploadImage}
                        className="mb-4 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {inputPreview && (
                        <div className="w-full flex justify-center mb-4">
                            <img
                                src={inputPreview}
                                alt="Uploaded preview"
                                className="max-h-48 w-auto rounded-md shadow object-contain border border-gray-200"
                            />
                        </div>
                    )}

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
                        disabled={loading || !imageUploaded}
                        className={`w-full py-2 rounded-lg transition duration-200 ${
                            loading || !imageUploaded
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600'
                        } text-white`}
                    >
                        {loading ? 'Generating...' : 'Generate Image'}
                    </button>
                </div>

                {/* RIGHT COLUMN - Settings + Image Preview SIDE BY SIDE */}
                <div className="w-1/2 flex flex-col gap-6">
                    <div className="flex gap-6 w-full">
                        {/* SETTINGS PANEL */}
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
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="JPEG">JPEG</option>
                                <option value="PNG">PNG</option>
                            </select>
                        </div>

                        {/* IMAGE PREVIEW */}
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
                                <div className="text-gray-500 mt-4 text-center">Generated image will appear here</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page1;
