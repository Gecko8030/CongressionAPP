'use client'

import { useEffect } from 'react'
import { PushNotificationService } from '@/lib/push-notifications'

export default function PWAInitializer() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      PushNotificationService.register()
    }
  }, [])

  return null
}
