'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Database, Brain, Cloud, MapPin, Shield, Zap } from 'lucide-react'
import { arkansasData } from '@/lib/arkansas-data'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-semibold">Back to Home</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">About CropIntel AR</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <section className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            AI-Powered Crop Protection for Arkansas
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            CropIntel AR combines machine learning, real-time weather data, and local agricultural expertise
            to help Arkansas farmers detect and prevent crop diseases before they impact yields.
          </p>
        </section>

        <section className="grid md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <Brain className="h-10 w-10 text-green-600 mb-2" />
              <CardTitle>MobileNetV3 AI Model</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Trained on Arkansas-specific crop disease images with focus on rice, soybean, and cotton.
                Achieves 75%+ macro-F1 accuracy with inference under 1 second on mobile devices.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Cloud className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>NWS Weather Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Daily risk scores computed using National Weather Service data including temperature,
                humidity, and conditions optimized for disease development patterns.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Database className="h-10 w-10 text-purple-600 mb-2" />
              <CardTitle>Supabase Backend</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Secure data storage with Row Level Security, real-time updates, and seamless integration
                for storing reports, alerts, and user profiles.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-yellow-600 mb-2" />
              <CardTitle>FastAPI Backend</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                High-performance Python backend with endpoints for disease prediction, report management,
                and automated daily risk computation.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-6">Arkansas Coverage</h3>
          <Card>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {(arkansasData.rice_acres / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-gray-600">Rice Acres</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-amber-600 mb-2">
                    {(arkansasData.soy_acres / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-gray-600">Soybean Acres</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {arkansasData.counties.length}
                  </div>
                  <div className="text-gray-600">Major Counties</div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-semibold text-gray-900 mb-3">Covered Counties</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {arkansasData.counties.map((county) => (
                    <div key={county.name} className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-green-600" />
                      <span className="font-medium">{county.name}</span>
                      <span className="text-gray-500">({county.primaryCrop})</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-6">Detected Diseases</h3>
          <div className="space-y-4">
            {Object.entries(arkansasData.diseases).map(([key, disease]) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="text-xl">{disease.name}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    {disease.crops.map((crop) => (
                      <span
                        key={crop}
                        className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full"
                      >
                        {crop}
                      </span>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h5 className="font-semibold text-sm text-gray-700">Symptoms</h5>
                    <p className="text-sm text-gray-600">{disease.symptoms}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-sm text-gray-700">Management</h5>
                    <p className="text-sm text-gray-600">{disease.management}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
            <CardHeader>
              <Shield className="h-10 w-10 mb-2" />
              <CardTitle className="text-2xl">Data Sources & Standards</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="font-semibold">UAEX:</span>
                <span className="opacity-90">University of Arkansas Extension Service disease databases</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold">USDA:</span>
                <span className="opacity-90">United States Department of Agriculture crop statistics</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold">NWS:</span>
                <span className="opacity-90">National Weather Service real-time weather data (api.weather.gov)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold">Model:</span>
                <span className="opacity-90">MobileNetV3-Small trained on Arkansas crop disease dataset</span>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-6">Technical Architecture</h3>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="border-l-4 border-green-600 pl-4">
                  <h4 className="font-semibold text-gray-900">Frontend</h4>
                  <p className="text-sm text-gray-600">Next.js 13, React, TailwindCSS, shadcn/ui components</p>
                </div>
                <div className="border-l-4 border-blue-600 pl-4">
                  <h4 className="font-semibold text-gray-900">Backend</h4>
                  <p className="text-sm text-gray-600">FastAPI, Python, TensorFlow Lite, ONNX Runtime</p>
                </div>
                <div className="border-l-4 border-purple-600 pl-4">
                  <h4 className="font-semibold text-gray-900">Database</h4>
                  <p className="text-sm text-gray-600">Supabase PostgreSQL with Row Level Security</p>
                </div>
                <div className="border-l-4 border-orange-600 pl-4">
                  <h4 className="font-semibold text-gray-900">ML Model</h4>
                  <p className="text-sm text-gray-600">MobileNetV3-Small (224x224 input, 6 disease classes)</p>
                </div>
                <div className="border-l-4 border-red-600 pl-4">
                  <h4 className="font-semibold text-gray-900">PWA Support</h4>
                  <p className="text-sm text-gray-600">Offline diagnosis capability, web push notifications</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="text-center">
          <Card className="bg-emerald-50 border-emerald-200">
            <CardContent className="pt-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Protect Your Crops?
              </h3>
              <p className="text-gray-600 mb-6">
                Start using CropIntel AR today to detect diseases early and maximize your yields
              </p>
              <Link href="/snap">
                <Button size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                  Start Diagnosis
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
