import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create service role client to bypass RLS
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get the user from the request
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' })
    }

    const token = authHeader.split(' ')[1]
    
    // Verify the token and get the user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token or user not found' })
    }

    if (req.method === 'GET') {
      // Get user settings
      const { data, error } = await supabaseAdmin
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        return res.status(500).json({ error: error.message })
      }

      return res.status(200).json({ data: data || null })

    } else if (req.method === 'POST') {
      // Update or create user settings
      const { active_template_id } = req.body

      if (!active_template_id) {
        return res.status(400).json({ error: 'active_template_id is required' })
      }

      // Try to update existing settings first
      const { data: existing } = await supabaseAdmin
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      let result
      if (existing) {
        // Update existing settings
        const { data, error } = await supabaseAdmin
          .from('user_settings')
          .update({ active_template_id })
          .eq('user_id', user.id)
          .select()
          .single()

        if (error) {
          return res.status(500).json({ error: error.message })
        }
        result = data
      } else {
        // Create new settings
        const { data, error } = await supabaseAdmin
          .from('user_settings')
          .insert({
            user_id: user.id,
            active_template_id,
            streak_days: [1, 2, 3, 4, 5],
            default_questions: [
              "What did you learn today?",
              "What was most confusing or challenging today?",
              "What did you learn about how you learn?"
            ]
          })
          .select()
          .single()

        if (error) {
          return res.status(500).json({ error: error.message })
        }
        result = data
      }

      return res.status(200).json({ data: result })

    } else {
      return res.status(405).json({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}