import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET() {

  console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)

  const { data, error } = await supabase
    .from('users')
    .select('*')

  console.log("ERROR:", error)

  if (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    })
  }

  return NextResponse.json({
    success: true,
    data
  })
}
