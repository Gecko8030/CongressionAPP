'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Camera, Upload, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { ApiClient } from '@/lib/api-client'
import { arkansasData, getRiskColor, getRiskLevel } from '@/lib/arkansas-data'

export default function SnapPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [crop, setCrop] = useState<string>('')
  const [county, setCounty] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB')
        return
      }
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setError(null)
      setResult(null)
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCameraActive(true)
      }
    } catch (err) {
      setError('Could not access camera. Please check permissions.')
    }
  }

  const capturePhoto = useCallback(() => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0)
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' })
            setSelectedFile(file)
            setPreviewUrl(URL.createObjectURL(file))
            stopCamera()
          }
        }, 'image/jpeg', 0.95)
      }
    }
  }, [])

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      setIsCameraActive(false)
    }
  }

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please select an image')
      return
    }

    if (!crop || !county) {
      setError('Please select crop type and county')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const predictionResult = await ApiClient.predictDisease(selectedFile)
      setResult(predictionResult)
    } catch (err) {
      setError('Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getDiseaseInfo = (diseaseName: string) => {
    const diseaseKey = diseaseName.toLowerCase().replace(/ /g, '_')
    return arkansasData.diseases[diseaseKey as keyof typeof arkansasData.diseases]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-semibold">Back to Home</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Snap & Diagnose</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-6 w-6 text-green-600" />
              Upload or Capture Image
            </CardTitle>
            <CardDescription>
              Take a clear photo of the affected plant part for accurate diagnosis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isCameraActive && !previewUrl && (
              <div className="flex gap-4">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="flex-1"
                >
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Image
                </Button>
                <Button
                  onClick={startCamera}
                  variant="outline"
                  className="flex-1"
                >
                  <Camera className="mr-2 h-5 w-5" />
                  Use Camera
                </Button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {isCameraActive && (
              <div className="space-y-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg"
                />
                <div className="flex gap-4">
                  <Button onClick={capturePhoto} className="flex-1">
                    Capture Photo
                  </Button>
                  <Button onClick={stopCamera} variant="outline">
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {previewUrl && !isCameraActive && (
              <div className="space-y-4">
                <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <Button
                  onClick={() => {
                    setSelectedFile(null)
                    setPreviewUrl(null)
                    setResult(null)
                  }}
                  variant="outline"
                  size="sm"
                >
                  Choose Different Image
                </Button>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Crop Type</label>
                <Select value={crop} onValueChange={setCrop}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select crop" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rice">Rice</SelectItem>
                    <SelectItem value="soy">Soybean</SelectItem>
                    <SelectItem value="cotton">Cotton</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">County</label>
                <Select value={county} onValueChange={setCounty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select county" />
                  </SelectTrigger>
                  <SelectContent>
                    {arkansasData.counties.map((c) => (
                      <SelectItem key={c.name} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleAnalyze}
              disabled={!selectedFile || !crop || !county || loading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              size="lg"
            >
              {loading ? 'Analyzing...' : 'Analyze Crop'}
            </Button>

            {loading && (
              <div className="flex items-center justify-center gap-2 p-4">
                <Loader2 className="h-5 w-5 animate-spin text-green-600" />
                <p className="text-sm text-gray-600">
                  Running AI diagnosis...
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {result && (
          <Card className="border-2 border-green-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                Diagnosis Complete
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {result.prediction.replace(/_/g, ' ').toUpperCase()}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Confidence:</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-600"
                      style={{ width: `${result.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{(result.confidence * 100).toFixed(1)}%</span>
                </div>
              </div>

              {getDiseaseInfo(result.prediction) && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Disease Information</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Symptoms:</strong> {getDiseaseInfo(result.prediction)?.symptoms}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Management:</strong> {getDiseaseInfo(result.prediction)?.management}
                  </p>
                </div>
              )}

              {result.all_predictions && result.all_predictions.length > 1 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Other Possibilities</h4>
                  <div className="space-y-2">
                    {result.all_predictions.slice(0, 3).map((pred: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-sm text-gray-700 flex-1">
                          {pred.class.replace(/_/g, ' ')}
                        </span>
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-600"
                            style={{ width: `${pred.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-12 text-right">
                          {(pred.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <Link href="/alerts">
                  <Button variant="outline" className="w-full">
                    View Risk Alerts for {county}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
