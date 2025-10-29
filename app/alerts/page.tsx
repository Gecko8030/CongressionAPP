'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, MapPin, AlertTriangle, Thermometer, Droplets, RefreshCw } from 'lucide-react'
import { ApiClient } from '@/lib/api-client'
import { Alert as AlertType } from '@/lib/supabase'
import { getRiskColor, getRiskLevel, arkansasData } from '@/lib/arkansas-data'

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null)

  const fetchAlerts = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await ApiClient.getAlerts(selectedCounty || undefined)
      setAlerts(data.alerts)
    } catch (err) {
      setError('Failed to load alerts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlerts()
  }, [selectedCounty])

  const groupedAlerts = alerts.reduce((acc, alert) => {
    if (!acc[alert.county]) {
      acc[alert.county] = []
    }
    acc[alert.county].push(alert)
    return acc
  }, {} as Record<string, AlertType[]>)

  const getHighestRisk = (countyAlerts: AlertType[]) => {
    return Math.max(...countyAlerts.map(a => a.risk_score))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-semibold">Back to Home</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Risk Alerts</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">County Risk Map</h2>
              <p className="text-gray-600">Real-time disease risk assessment powered by NWS weather data</p>
            </div>
            <Button onClick={fetchAlerts} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card
            className={`cursor-pointer transition-all hover:shadow-lg ${!selectedCounty ? 'ring-2 ring-green-600' : ''}`}
            onClick={() => setSelectedCounty(null)}
          >
            <CardContent className="pt-6">
              <MapPin className="h-8 w-8 text-green-600 mb-2" />
              <h3 className="font-semibold">All Counties</h3>
              <p className="text-sm text-gray-600">View statewide alerts</p>
            </CardContent>
          </Card>

          {arkansasData.counties.slice(0, 2).map((county) => {
            const countyAlerts = groupedAlerts[county.name] || []
            const maxRisk = countyAlerts.length > 0 ? getHighestRisk(countyAlerts) : 0
            return (
              <Card
                key={county.name}
                className={`cursor-pointer transition-all hover:shadow-lg ${selectedCounty === county.name ? 'ring-2 ring-green-600' : ''}`}
                onClick={() => setSelectedCounty(county.name)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <MapPin className="h-8 w-8" style={{ color: getRiskColor(maxRisk) }} />
                    <Badge style={{ backgroundColor: getRiskColor(maxRisk), color: 'white' }}>
                      {getRiskLevel(maxRisk)}
                    </Badge>
                  </div>
                  <h3 className="font-semibold">{county.name}</h3>
                  <p className="text-sm text-gray-600">{county.primaryCrop}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-green-600 mb-2" />
            <p className="text-gray-600">Loading alerts...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedAlerts).map(([county, countyAlerts]) => (
              <Card key={county}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        {county} County
                      </CardTitle>
                      <CardDescription>
                        {arkansasData.counties.find(c => c.name === county)?.primaryCrop} producing region
                      </CardDescription>
                    </div>
                    <Badge
                      className="text-base px-4 py-1"
                      style={{
                        backgroundColor: getRiskColor(getHighestRisk(countyAlerts)),
                        color: 'white'
                      }}
                    >
                      {getRiskLevel(getHighestRisk(countyAlerts))} RISK
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {countyAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="border rounded-lg p-4"
                      style={{ borderColor: getRiskColor(alert.risk_score) }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-lg capitalize">{alert.crop}</h4>
                          <p className="text-sm text-gray-600">{alert.message}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold" style={{ color: getRiskColor(alert.risk_score) }}>
                            {(alert.risk_score * 100).toFixed(0)}
                          </div>
                          <div className="text-xs text-gray-500">risk score</div>
                        </div>
                      </div>

                      {(alert.temperature || alert.humidity) && (
                        <div className="flex gap-6 text-sm text-gray-600 pt-3 border-t">
                          {alert.temperature && (
                            <div className="flex items-center gap-2">
                              <Thermometer className="h-4 w-4" />
                              <span>{alert.temperature}°F</span>
                            </div>
                          )}
                          {alert.humidity && (
                            <div className="flex items-center gap-2">
                              <Droplets className="h-4 w-4" />
                              <span>{alert.humidity}% humidity</span>
                            </div>
                          )}
                          {alert.conditions && (
                            <div className="flex items-center gap-2">
                              <span className="capitalize">{alert.conditions.replace(/_/g, ' ')}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="text-xs text-gray-500 mt-2">
                        Updated: {new Date(alert.updated_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-blue-600" />
              Understanding Risk Scores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#dc2626' }} />
              <span className="font-medium">HIGH (70-100):</span>
              <span className="text-sm text-gray-600">Immediate action recommended</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ea580c' }} />
              <span className="font-medium">MODERATE (50-69):</span>
              <span className="text-sm text-gray-600">Close monitoring required</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }} />
              <span className="font-medium">LOW-MODERATE (30-49):</span>
              <span className="text-sm text-gray-600">Regular observation</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#16a34a' }} />
              <span className="font-medium">LOW (0-29):</span>
              <span className="text-sm text-gray-600">Standard practices</span>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
