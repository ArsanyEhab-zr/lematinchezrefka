import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

let deferredPrompt: BeforeInstallPromptEvent | null = null
const listeners = new Set<() => void>()

const notify = () => {
  for (const listener of listeners) listener()
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferredPrompt = event as BeforeInstallPromptEvent
    notify()
  })
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null
    notify()
  })
}

const isStandaloneMode = (): boolean => {
  if (typeof window === 'undefined') return false
  const iosStandalone = Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)
  return iosStandalone || window.matchMedia('(display-mode: standalone)').matches
}

const detectIos = (): boolean => {
  if (typeof window === 'undefined') return false
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
}

export const usePwaInstall = () => {
  const [hasPrompt, setHasPrompt] = useState(() => deferredPrompt !== null)
  const [isInstalled, setIsInstalled] = useState(isStandaloneMode)
  const [isIos] = useState(detectIos)

  useEffect(() => {
    const sync = () => {
      setHasPrompt(deferredPrompt !== null)
      setIsInstalled(isStandaloneMode())
    }
    listeners.add(sync)
    sync()
    const media = window.matchMedia('(display-mode: standalone)')
    media.addEventListener('change', sync)
    return () => {
      listeners.delete(sync)
      media.removeEventListener('change', sync)
    }
  }, [])

  const promptInstall = async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!deferredPrompt) return 'unavailable'
    const current = deferredPrompt
    await current.prompt()
    const choice = await current.userChoice
    deferredPrompt = null
    notify()
    return choice.outcome
  }

  return {
    canNativeInstall: hasPrompt,
    isInstalled,
    isIos,
    promptInstall,
  }
}
