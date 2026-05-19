export type EventType = 'bottle' | 'diaper' | 'veggie' | 'fruit' | 'sleep'
export type DiaperPooConsistency = 'normal' | 'soft' | 'liquid'
export type DiaperSubType = 'pee' | 'poo'
export type SleepSubType = 'nap' | 'night'
export type MealSubType = 'veggie' | 'fruit'

export interface EventWithDetails {
  id: string
  type: EventType
  created_at: string
  bottle_events: { time: string; quantity_ml: number } | null
  diaper_events: { time: string; type: DiaperSubType; poo_consistency: DiaperPooConsistency | null } | null
  meal_events: { time: string; meal_type: MealSubType; quantity_gr: number } | null
  sleep_events: { start_time: string; end_time: string | null; type: SleepSubType } | null
}
