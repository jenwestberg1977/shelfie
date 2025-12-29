
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { X, Upload, Sparkles, Loader2, Play, ExternalLink, RefreshCw } from 'lucide-react';

interface VeoAnimatorProps {
  onClose: () => void;
  accentColor: string;
}

const VeoAnimator: React.FC<VeoAnimatorProps> = ({ onClose, accentColor }) => {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('Animate this book cover in a cinematic style, with subtle magic particles and atmospheric lighting.');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateVideo = async () => {
    if (!image) return;

    // Check for API key selection
    if (!(await (window as any).aistudio?.hasSelectedApiKey())) {
      await (window as any).aistudio?.openSelectKey();
      // Proceeding after triggering openSelectKey assuming success (race condition mitigation)
    }

    setLoading(true);
    setStatus('Initializing AI Generation...');
    
    try {
      // Corrected initialization to strictly follow @google/genai guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const base64Data = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];

      setStatus('Submitting job to Veo 3.1...');
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        image: {
          imageBytes: base64Data,
          mimeType: mimeType,
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      while (!operation.done) {
        setStatus('AI is dreaming... This can take a minute. (Polling progress)');
        await new Promise(resolve => setTimeout(resolve, 8000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      if (operation.response?.generatedVideos?.[0]?.video?.uri) {
        setStatus('Downloading video...');
        const downloadLink = operation.response.generatedVideos[0].video.uri;
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await response.blob();
        setVideoUrl(URL.createObjectURL(blob));
        setStatus('Complete!');
      } else {
        throw new Error('Video URI not found in response');
      }
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes("Requested entity was not found")) {
        alert("API Key error. Please re-select your key from a paid GCP project.");
        await (window as any).aistudio?.openSelectKey();
      } else {
        setStatus(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b flex items-center justify-between bg-gradient-to-r from-purple-50 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600 rounded-lg text-white">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-800 tracking-tight">AI Book Animator</h2>
              <p className="text-xs text-gray-500 font-medium">Powered by Veo 3.1 & Gemini</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 grid md:grid-cols-2 gap-8">
          {/* Upload / Input Column */}
          <div className="space-y-6">
            <div 
              className={`aspect-[4/3] rounded-2xl border-4 border-dashed transition-all flex flex-col items-center justify-center relative overflow-hidden group ${image ? 'border-transparent bg-gray-50' : 'border-gray-200 hover:border-purple-300 bg-gray-50'}`}
              onClick={() => !loading && fileInputRef.current?.click()}
            >
              {image ? (
                <>
                  <img src={image} alt="Preview" className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <RefreshCw className="w-10 h-10 text-white" />
                  </div>
                </>
              ) : (
                <div className="text-center p-6">
                  <Upload className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="font-bold text-gray-500">Click to Upload Book Cover</p>
                  <p className="text-xs text-gray-400 mt-2">PNG or JPEG supported</p>
                </div>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">Animation Style</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="How should the cover move?"
                className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-200 outline-none resize-none bg-gray-50 text-sm"
                rows={3}
              />
            </div>

            <button 
              onClick={generateVideo}
              disabled={!image || loading}
              className={`w-full py-4 rounded-xl font-black text-lg shadow-xl transition-all transform flex items-center justify-center gap-3 ${!image || loading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:scale-[1.02] active:scale-95'}`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  <span>Animate Now</span>
                </>
              )}
            </button>
            
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              className="block text-[10px] text-center text-gray-400 hover:underline"
            >
              Requires a paid Google AI Studio API Key (Check Billing Info)
            </a>
          </div>

          {/* Result Column */}
          <div className="flex flex-col gap-4">
            <div className="flex-1 rounded-2xl bg-black flex items-center justify-center relative shadow-inner">
              {videoUrl ? (
                <video src={videoUrl} controls autoPlay loop className="max-w-full max-h-full rounded-xl" />
              ) : (
                <div className="text-center p-8 space-y-4">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto">
                    <Play className="w-8 h-8 text-gray-600 ml-1" />
                  </div>
                  <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Preview Area</p>
                  {status && (
                    <div className="bg-gray-900 text-purple-400 p-3 rounded-lg text-[10px] font-mono animate-pulse border border-purple-900/50">
                      {status}
                    </div>
                  )}
                </div>
              )}
            </div>

            {videoUrl && (
              <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-green-800">Success!</p>
                  <p className="text-xs text-green-600">Video generated successfully.</p>
                </div>
                <button 
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = videoUrl;
                    a.download = 'book-animation.mp4';
                    a.click();
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  Download <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VeoAnimator;
