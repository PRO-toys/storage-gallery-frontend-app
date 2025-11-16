// src/pages/module/comfyui/onex/anime/Page1.tsx
import React, { useState } from 'react';
import axios from 'axios';
import ModalLoading from '../../../../../components/modal/ModalLoading';
import { downloadFile } from '../../../../../utils/downLoad';
import config from '../../../../../config/config.json';

const Page1: React.FC = () => {
    const [prompt, setPrompt] = useState('Studio anime, a girl under cherry blossom, big expressive eyes');
    const [promptNegative, setPromptNegative] = useState(
        'blurry, grayscale, bad anatomy, child, extra fingers'
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
            const response = await axios.post(`${config.URL_MODULE}/api/comfyui/onex/ghibi/image-to-image`, {
                prompt_text: prompt,
                seed_mode: seedMode,
                prompt_negative: promptNegative,
                file_type: fileType,
            });

            if (response.data.status === 'error') {
                const ext = fileType.toLowerCase();
                setImageUrl(`${config.URL_MODULE}/resource/output/RenderImage1.jpg?v=${Date.now()}`);
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
            downloadFile(imageUrl, `anime-image.${ext}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            {loading && <ModalLoading />}
            <div className="w-full max-w-6xl bg-white p-6 rounded-2xl shadow-lg flex gap-8">
                {/* LEFT COLUMN */}
                <div className="w-1/2 flex flex-col">
                    <h1 className="text-3xl font-bold mb-4">anime - Image to Image</h1>
                    <p className="text-gray-600 mb-4">
                        Upload a reference image and describe the anime-style result you'd like to generate.
                    </p>

                    <label className="font-semibold">Upload Input Image</label>
                    <div className="flex items-center gap-4 mb-4">
                        <input
                            type="file"
                            accept=".jpg,.jpeg,.png"
                            onChange={handleUploadImage}
                            className="w-1/2 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {inputPreview && (
                            <div className="w-1/2 flex justify-center">
                                <img
                                    src={inputPreview}
                                    alt="Uploaded preview"
                                    className="max-h-32 w-auto rounded-md shadow object-contain border border-gray-200"
                                />
                            </div>
                        )}
                    </div>

                    <label className="font-semibold">Prompt</label>
                    <textarea
                        placeholder="Enter your anime-style prompt..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full p-3 h-28 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 resize-none"
                    />

                    <label className="font-semibold">Negative Prompt</label>
                    <textarea
                        placeholder="Things to avoid..."
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
                        {loading ? 'Generating...' : 'Generate anime Image'}
                    </button>
                </div>

                {/* RIGHT COLUMN - SETTINGS + IMAGE PREVIEW */}
                <div className="w-1/2 flex flex-col gap-6">
                    <div className="flex gap-6 w-full">
                        {/* SETTINGS */}
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
