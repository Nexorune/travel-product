import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { createTrip } from './data'
import type { Preferences, Trip } from './types'

const emptyPreferences: Preferences = { origin:'', days:3, budget:'', interests:[], pace:'', companion:'' }

type Store = {
  preferences: Preferences
  trip: Trip | null
  setPreferences: (preferences: Preferences) => void
  setTrip: (trip: Trip) => void
  startTrip: (destinationId: string, days: 3 | 5) => void
  movePlace: (dayIndex: number, placeIndex: number, direction: -1 | 1) => void
  removePlace: (dayIndex: number, placeId: string) => void
  addPlace: (dayIndex: number, placeId: string) => void
  resetTrip: () => void
  clearAll: () => void
}

const safeStorage = {
  getItem: (name: string) => {
    try { return localStorage.getItem(name) } catch { return null }
  },
  setItem: (name: string, value: string) => {
    try { localStorage.setItem(name, value) } catch { /* current session still works */ }
  },
  removeItem: (name: string) => {
    try { localStorage.removeItem(name) } catch { /* no-op */ }
  },
}

const withUpdatedTrip = (trip: Trip, days: Trip['days']): Trip => ({...trip, days, updatedAt:new Date().toISOString()})

export const useTravelStore = create<Store>()(persist((set, get) => ({
  preferences: emptyPreferences,
  trip: null,
  setPreferences: (preferences) => set({preferences}),
  setTrip: (trip) => set({trip}),
  startTrip: (destinationId, days) => set({trip:createTrip(destinationId, days)}),
  movePlace: (dayIndex, placeIndex, direction) => {
    const trip = get().trip
    if (!trip) return
    const days = trip.days.map((day, index) => index === dayIndex ? {...day, placeIds:[...day.placeIds]} : day)
    const nextIndex = placeIndex + direction
    if (nextIndex < 0 || nextIndex >= days[dayIndex].placeIds.length) return
    ;[days[dayIndex].placeIds[placeIndex], days[dayIndex].placeIds[nextIndex]] = [days[dayIndex].placeIds[nextIndex], days[dayIndex].placeIds[placeIndex]]
    set({trip:withUpdatedTrip(trip, days)})
  },
  removePlace: (dayIndex, placeId) => {
    const trip = get().trip
    if (!trip) return
    const days = trip.days.map((day, index) => index === dayIndex ? {...day, placeIds:day.placeIds.filter((id) => id !== placeId)} : day)
    set({trip:withUpdatedTrip(trip, days)})
  },
  addPlace: (dayIndex, placeId) => {
    const trip = get().trip
    if (!trip || trip.days.some((day) => day.placeIds.includes(placeId))) return
    const days = trip.days.map((day, index) => index === dayIndex ? {...day, placeIds:[...day.placeIds, placeId]} : day)
    set({trip:withUpdatedTrip(trip, days)})
  },
  resetTrip: () => {
    const trip = get().trip
    if (trip) set({trip:createTrip(trip.destinationId, trip.daysCount)})
  },
  clearAll: () => set({preferences:emptyPreferences, trip:null}),
}), {
  name:'travel-demo-v1',
  storage:createJSONStorage(() => safeStorage),
  partialize:(state) => ({preferences:state.preferences, trip:state.trip}),
}))
