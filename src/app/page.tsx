import { createClient } from '@/utils/supabase/server'
import HomeClient from '@/components/HomeClient'
import type { EventWithDetails } from '@/types'

export default async function Home() {
  const supabase = await createClient()

  const { data: baby } = await supabase
    .from('babies')
    .select('id')
    .limit(1)
    .maybeSingle()

  let events: EventWithDetails[] = []

  if (baby) {
    const startOfToday = new Date()
    startOfToday.setUTCHours(0, 0, 0, 0)

    const { data } = await supabase
      .from('events')
      .select(
        `id, type, created_at,
        bottle_events(time, quantity_ml),
        diaper_events(time, type, poo_consistency),
        meal_events(time, meal_type, quantity_gr),
        sleep_events(start_time, end_time, type)`,
      )
      .eq('baby_id', baby.id as string)
      .gte('created_at', startOfToday.toISOString())
      .order('created_at', { ascending: false })
      .limit(10)

    events = (data as EventWithDetails[]) ?? []
  }

  return <HomeClient events={events} />
}
