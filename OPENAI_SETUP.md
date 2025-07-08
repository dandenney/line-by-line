# OpenAI API Setup for Prompt Generation

This feature uses OpenAI's ChatGPT API to generate writing prompts based on your journal entries.

## Setup

### 1. Get an OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to [API Keys](https://platform.openai.com/api-keys)
4. Click "Create new secret key"
5. Copy the generated key (it starts with `sk-`)

### 2. Add to Environment Variables
Add your OpenAI API key to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=sk-your_openai_api_key_here
```

### 3. Restart Development Server
```bash
yarn dev
```

## How It Works

1. **Entry Content**: When you view an entry with content, you'll see a "Get Writing Ideas" button
2. **AI Analysis**: Clicking the button sends your entry content to ChatGPT
3. **Prompt Generation**: The AI analyzes your entry and suggests 1-3 writing prompts
4. **Display**: The prompts appear in a blue box below your entry content

## Features

- **Content-Based**: Only shows for entries with actual content
- **Secure**: Uses your Supabase authentication to verify ownership
- **Regeneratable**: You can generate new prompts if you want different ideas
- **Error Handling**: Shows clear error messages if something goes wrong

## API Usage

The feature uses OpenAI's `gpt-3.5-turbo` model with:
- **Max tokens**: 500 (to keep responses concise)
- **Temperature**: 0.7 (for creative but focused responses)
- **Cost**: Approximately $0.001-0.002 per request

## Troubleshooting

### "OpenAI API key not configured"
Make sure you've added `OPENAI_API_KEY` to your `.env.local` file and restarted the dev server.

### "Failed to generate prompts"
- Check your OpenAI API key is valid
- Ensure you have credits in your OpenAI account
- Try again - sometimes the API can be temporarily unavailable

### "Authentication required"
Make sure you're logged in to the app before trying to generate prompts.

## Privacy

- Your entry content is sent to OpenAI for analysis
- The content is not stored by OpenAI beyond the API request
- Only the generated prompts are returned and displayed
- You can review OpenAI's [privacy policy](https://openai.com/privacy) for more details 