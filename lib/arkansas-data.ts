export const arkansasData = {
  rice_acres: 1430000,
  soy_acres: 3020000,
  cotton_acres: 640000,
  total_farm_acres: 13900000,
  top_pests: ['sheath_blight', 'rice_blast', 'fall_armyworm'],
  counties: [
    {
      name: 'Lonoke',
      coordinates: [34.7845, -91.8999],
      primaryCrop: 'rice',
      farmAcres: 425000,
    },
    {
      name: 'Stuttgart',
      coordinates: [34.5001, -91.5526],
      primaryCrop: 'rice',
      farmAcres: 380000,
    },
    {
      name: 'Poinsett',
      coordinates: [35.5643, -90.6734],
      primaryCrop: 'rice',
      farmAcres: 310000,
    },
    {
      name: 'Jefferson',
      coordinates: [34.2043, -91.9318],
      primaryCrop: 'soy',
      farmAcres: 290000,
    },
    {
      name: 'Arkansas',
      coordinates: [34.3143, -91.2068],
      primaryCrop: 'rice',
      farmAcres: 340000,
    },
    {
      name: 'Mississippi',
      coordinates: [35.7843, -90.1068],
      primaryCrop: 'cotton',
      farmAcres: 270000,
    },
  ],
  diseases: {
    sheath_blight: {
      name: 'Sheath Blight',
      crops: ['rice'],
      symptoms: 'Oval or elongated lesions on leaf sheaths with gray-green centers and brown margins',
      management: 'Fungicide application, proper water management, resistant varieties',
      severity: 'high',
    },
    rice_blast: {
      name: 'Rice Blast',
      crops: ['rice'],
      symptoms: 'Diamond-shaped lesions with gray centers and brown margins on leaves',
      management: 'Resistant varieties, balanced fertilization, fungicide application',
      severity: 'high',
    },
    fall_armyworm: {
      name: 'Fall Armyworm',
      crops: ['rice', 'soy', 'cotton'],
      symptoms: 'Defoliation, whorl damage in young plants, feeding on leaves and stems',
      management: 'Early detection, insecticide application, biological control agents',
      severity: 'medium',
    },
  },
}

export const getRiskColor = (riskScore: number): string => {
  if (riskScore >= 0.7) return '#dc2626'
  if (riskScore >= 0.5) return '#ea580c'
  if (riskScore >= 0.3) return '#f59e0b'
  return '#16a34a'
}

export const getRiskLevel = (riskScore: number): string => {
  if (riskScore >= 0.7) return 'HIGH'
  if (riskScore >= 0.5) return 'MODERATE'
  if (riskScore >= 0.3) return 'LOW-MODERATE'
  return 'LOW'
}
