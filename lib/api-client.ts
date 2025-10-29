const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export class ApiClient {
  static async predictDisease(file: File): Promise<{
    prediction: string
    confidence: number
    all_predictions: Array<{ class: string; confidence: number }>
  }> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Prediction failed')
    }

    return response.json()
  }

  static async createReport(
    file: File,
    data: {
      crop: string
      county: string
      user_id: string
      latitude?: number
      longitude?: number
    }
  ): Promise<{
    report_id: string
    prediction: string
    confidence: number
    image_url: string
  }> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('crop', data.crop)
    formData.append('county', data.county)
    formData.append('user_id', data.user_id)

    if (data.latitude) formData.append('latitude', data.latitude.toString())
    if (data.longitude) formData.append('longitude', data.longitude.toString())

    const response = await fetch(`${API_BASE_URL}/report`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Report creation failed')
    }

    return response.json()
  }

  static async getAlerts(county?: string) {
    const url = county
      ? `${API_BASE_URL}/alerts/${county}`
      : `${API_BASE_URL}/alerts`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('Failed to fetch alerts')
    }

    return response.json()
  }

  static async computeRiskDaily() {
    const response = await fetch(`${API_BASE_URL}/compute-risk-daily`, {
      method: 'POST',
    })

    if (!response.ok) {
      throw new Error('Risk computation failed')
    }

    return response.json()
  }

  static async getReport(reportId: string) {
    const response = await fetch(`${API_BASE_URL}/reports/${reportId}`)

    if (!response.ok) {
      throw new Error('Failed to fetch report')
    }

    return response.json()
  }
}
