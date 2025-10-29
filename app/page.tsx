'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, AlertTriangle, MapPin, BookOpen, TrendingUp, Users } from 'lucide-react'
import { arkansasData } from '@/lib/arkansas-data'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">CropIntel AR</h1>
          </div>
          <nav className="flex gap-4">
            <Link href="/snap">
              <Button variant="ghost">Snap & Diagnose</Button>
            </Link>
            <Link href="/alerts">
              <Button variant="ghost">Alerts</Button>
            </Link>
            <Link href="/about">
              <Button variant="ghost">About</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <section className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            AI-Powered Crop Disease Detection
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Protect Arkansas farms with real-time disease identification and county-level risk alerts
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/snap">
              <Button size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                <Camera className="mr-2 h-5 w-5" />
                Start Diagnosis
              </Button>
            </Link>
            <Link href="/alerts">
              <Button size="lg" variant="outline">
                <MapPin className="mr-2 h-5 w-5" />
                View Risk Map
              </Button>
            </Link>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Camera className="h-12 w-12 text-green-600 mb-2" />
              <CardTitle>Instant Detection</CardTitle>
              <CardDescription>
                Snap a photo and get AI-powered disease identification in seconds
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <AlertTriangle className="h-12 w-12 text-orange-600 mb-2" />
              <CardTitle>Risk Alerts</CardTitle>
              <CardDescription>
                County-level risk scores updated daily with weather data from NWS
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <MapPin className="h-12 w-12 text-blue-600 mb-2" />
              <CardTitle>Local Intelligence</CardTitle>
              <CardDescription>
                Arkansas-specific data for rice, soy, and cotton diseases
              </CardDescription>
            </CardHeader>
          </Card>
        </section>

        <section className="mb-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Arkansas Agriculture</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Rice Production
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-green-600">
                  {(arkansasData.rice_acres / 1000000).toFixed(2)}M
                </p>
                <p className="text-gray-600">acres cultivated</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-amber-600" />
                  Soybean Production
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-amber-600">
                  {(arkansasData.soy_acres / 1000000).toFixed(2)}M
                </p>
                <p className="text-gray-600">acres cultivated</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Coverage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-blue-600">
                  {arkansasData.counties.length}
                </p>
                <p className="text-gray-600">major counties</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-md p-8 mb-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-6 text-center">Detected Diseases</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(arkansasData.diseases).map(([key, disease]) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="text-lg">{disease.name}</CardTitle>
                  <CardDescription>Affects: {disease.crops.join(', ')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{disease.symptoms}</p>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`h-4 w-4 ${disease.severity === 'high' ? 'text-red-600' : 'text-orange-600'}`} />
                    <span className="text-sm font-medium">{disease.severity.toUpperCase()} severity</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="text-center bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg p-12">
          <BookOpen className="h-16 w-16 mx-auto mb-4" />
          <h3 className="text-3xl font-bold mb-4">Ready to Protect Your Crops?</h3>
          <p className="text-xl mb-8 opacity-90">
            Join Arkansas farmers using AI to detect and prevent crop diseases
          </p>
          <Link href="/snap">
            <Button size="lg" variant="secondary">
              Get Started Now
            </Button>
          </Link>
        </section>
      </main>

      <footer className="border-t bg-white mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>CropIntel AR - Powered by MobileNetV3, NWS Weather Data, and Supabase</p>
          <p className="text-sm mt-2">Data sources: UAEX, USDA, National Weather Service</p>
        </div>
      </footer>
    </div>
  )
}
