'use client';

import { useState } from 'react';
import { Upload, Image as ImageIcon, Video, Download, Sparkles, FileImage, FileVideo, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import imageCompression from 'browser-image-compression';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [compressedFile, setCompressedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [quality, setQuality] = useState([80]);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [activeTab, setActiveTab] = useState('image');

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setOriginalSize(file.size);
      setCompressedFile(null);
      setCompressedSize(0);
      setProgress(0);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const compressImage = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setProgress(10);

    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        quality: quality[0] / 100,
        onProgress: (progress) => {
          setProgress(progress);
        }
      };

      setProgress(30);
      const compressed = await imageCompression(selectedFile, options);
      setProgress(90);

      setCompressedFile(compressed);
      setCompressedSize(compressed.size);
      setProgress(100);
    } catch (error) {
      console.error('Error compressing image:', error);
      alert('Failed to compress image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const compressVideo = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setProgress(10);

    try {
      // For video compression, we'll use a simpler approach with quality reduction
      // This creates a smaller copy by re-encoding
      setProgress(30);

      const video = document.createElement('video');
      video.src = URL.createObjectURL(selectedFile);

      video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Reduce dimensions based on quality
        const scale = quality[0] / 100;
        canvas.width = video.videoWidth * scale;
        canvas.height = video.videoHeight * scale;

        setProgress(50);

        // For demo purposes, we'll create a compressed version notice
        // In production, you'd use FFmpeg.wasm or a server-side solution
        const blob = new Blob(
          ['Video compression requires server-side processing. This is a demo version.'],
          { type: 'text/plain' }
        );

        setCompressedFile(blob);
        setCompressedSize(blob.size);
        setProgress(100);

        alert('Video compression requires advanced processing. In a production app, this would use FFmpeg or a server-side solution.');
        URL.revokeObjectURL(video.src);
      };
    } catch (error) {
      console.error('Error compressing video:', error);
      alert('Failed to compress video. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompress = () => {
    if (activeTab === 'image') {
      compressImage();
    } else {
      compressVideo();
    }
  };

  const handleDownload = () => {
    if (!compressedFile) return;

    const url = URL.createObjectURL(compressedFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compressed-${selectedFile.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const compressionRate = originalSize > 0 ? Math.round((1 - compressedSize / originalSize) * 100) : 0;

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-8 md:py-12">
      {/* Hero Section */}
      <div className="w-full max-w-5xl text-center mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Fast & Secure Compression</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Compress Images & Videos
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Fast, secure, and completely free.
        </p>
      </div>

      {/* Main Compression Card */}
      <Card className="w-full max-w-5xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            Compress Your Images & Videos
          </CardTitle>
          <CardDescription>
            Upload a file to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="image" className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Images
              </TabsTrigger>
              <TabsTrigger value="video" className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                Videos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="image" className="space-y-6">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-muted rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/20">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileImage className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-medium mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-muted-foreground">
                      PNG, JPG, JPEG, WEBP up to 50MB
                    </p>
                  </div>
                </label>
              </div>
            </TabsContent>

            <TabsContent value="video" className="space-y-6">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-muted rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/20">
                <input
                  type="file"
                  id="video-upload"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileVideo className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-medium mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-muted-foreground">
                      MP4, MOV, AVI, WEBM up to 500MB
                    </p>
                  </div>
                </label>
              </div>
            </TabsContent>

            {/* Selected File Info */}
            {selectedFile && (
              <div className="space-y-6">
                <Card className="bg-muted/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          {activeTab === 'image' ? (
                            <ImageIcon className="w-5 h-5 text-primary" />
                          ) : (
                            <Video className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{selectedFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(originalSize)}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">Original</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Quality Slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Compression Quality</label>
                    <span className="text-sm text-muted-foreground">{quality[0]}%</span>
                  </div>
                  <Slider
                    value={quality}
                    onValueChange={setQuality}
                    max={100}
                    min={10}
                    step={10}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Higher quality = larger file size, Lower quality = smaller file size
                  </p>
                </div>

                {/* Compress Button */}
                <Button
                  onClick={handleCompress}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Compressing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Compress {activeTab === 'image' ? 'Image' : 'Video'}
                    </>
                  )}
                </Button>

                {/* Progress Bar */}
                {loading && (
                  <div className="space-y-2">
                    <Progress value={progress} className="w-full" />
                    <p className="text-sm text-center text-muted-foreground">
                      {progress}% complete
                    </p>
                  </div>
                )}

                {/* Compressed Result */}
                {compressedFile && !loading && (
                  <div className="space-y-4">
                    <Card className="bg-primary/5 border-primary/20">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Download className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">Compressed File</p>
                              <p className="text-sm text-muted-foreground">
                                {formatFileSize(compressedSize)}
                              </p>
                            </div>
                          </div>
                          <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                            -{compressionRate}%
                          </Badge>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 p-4 bg-background rounded-lg">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-primary">{compressionRate}%</p>
                            <p className="text-xs text-muted-foreground">Reduced</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold">{formatFileSize(originalSize)}</p>
                            <p className="text-xs text-muted-foreground">Original</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold">{formatFileSize(compressedSize)}</p>
                            <p className="text-xs text-muted-foreground">Compressed</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Button onClick={handleDownload} className="w-full" size="lg" variant="default">
                      <Download className="w-4 h-4 mr-2" />
                      Download Compressed File
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {/* Features Section */}
      <div className="w-full max-w-5xl mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Lightning Fast</CardTitle>
            <CardDescription>
              Compress files in seconds with our optimized algorithms. No waiting, no delays.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Secure</CardTitle>
            <CardDescription>
              All processing happens in E2B sandbox. Your have full control over it.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>High Quality</CardTitle>
            <CardDescription>
              Maintain excellent quality while reducing file size by up to 90%.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </main>
  );
}
