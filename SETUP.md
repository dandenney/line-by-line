# Setup Guide

## Quick Start

1. **Install dependencies**
   ```bash
   yarn install
   ```

2. **Set up OpenAI API**
   - Get an API key from [platform.openai.com](https://platform.openai.com)
   - Copy the environment template:
     ```bash
     cp .env.example .env.local
     ```
   - Add your API key to `.env.local`:
     ```env
     OPENAI_API_KEY=your_openai_api_key_here
     ```

3. **Start the app**
   ```bash
   yarn dev
   ```

4. **Visit [http://localhost:3000](http://localhost:3000)**

## How It Works

1. **Write**: Answer "What stood out to you today?" in a clean, full-screen interface
2. **Chat**: Engage in a brief AI conversation to explore your thoughts deeper
3. **Collect**: Get personalized writing prompts for blog posts, social media, or internal sharing
4. **Save**: Keep your favorite prompts for later use

## Features

- ✨ **Full-screen writing mode** - Clean, distraction-free interface
- 🤖 **AI-powered conversations** - GPT-4o-mini asks thoughtful follow-ups
- 📝 **Smart prompt generation** - Get 1-3 writing ideas based on your reflection
- 💾 **Local storage** - Save and archive your favorite prompts
- 📱 **Mobile-friendly** - Works beautifully on all devices

## Troubleshooting

**"Failed to process request" error**
- Check that your `OPENAI_API_KEY` is correctly set in `.env.local`
- Ensure you have sufficient OpenAI credits
- Restart the development server after adding the API key

**Prompts not generating properly**
- The AI occasionally returns malformed JSON. The app handles this gracefully with fallbacks
- If prompts seem generic, try providing more specific details in your reflection

**Build errors**
- Run `yarn lint` to check for code issues
- Ensure all TypeScript types are properly defined

## Development

```bash
yarn dev     # Start development server
yarn build   # Build for production
yarn lint    # Run ESLint
```

## Technology Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **OpenAI GPT-4o-mini** - AI conversations
- **Radix UI** - UI primitives
- **localStorage** - Client-side storage