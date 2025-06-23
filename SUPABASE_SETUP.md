# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Create a new project
3. Wait for the project to be set up (this may take a few minutes)

## 2. Get Your Project Credentials

1. Go to your project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## 3. Configure Environment Variables

1. Create a `.env.local` file in your project root (if it doesn't exist)
2. Add the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace the values with your actual Supabase project credentials.

## 4. Enable Email Authentication

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. Optionally, you can disable email confirmation for development by going to **Authentication** → **Settings** → **Email Auth** and turning off "Enable email confirmations"

## 5. Test the Setup

1. Run your development server: `yarn dev`
2. Navigate to `/dashboard` - you should see the login form
3. Create an account or sign in
4. You should be redirected to the dashboard after successful authentication

## Next Steps

Once authentication is working, we'll need to:
1. Set up the database schema for journal entries
2. Create RLS (Row Level Security) policies
3. Update the app to use Supabase for data storage instead of localStorage

## Troubleshooting

- Make sure your environment variables are correctly set
- Check the browser console for any errors
- Verify that your Supabase project is active and not paused
- Ensure you're using the correct URL and anon key from your project settings 