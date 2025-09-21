# Line-by-Line 📝

A beautiful, minimalist journaling app focused on learning and reflection. Built with Next.js, TypeScript, OpenAI, and Tailwind CSS.

![Line-by-Line Screenshot](https://via.placeholder.com/800x400/1A2630/FFFFFF?text=Line-by-Line+Journaling+App)

## ✨ Features

- **Learning-Focused Reflection**: Start with the simple question "What stood out to you today?"
- **AI-Powered Follow-ups**: GPT-powered conversation to explore your thoughts deeper
- **Writing Prompt Generation**: Get 1-3 writing prompts for blog posts, social media, or internal sharing
- **Clean, Full-Screen Interface**: Minimal UI inspired by iA Writer
- **Save & Archive**: Keep track of your favorite writing ideas
- **Mobile Friendly**: Works beautifully on all devices

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone https://github.com/your-username/line-by-line.git
cd line-by-line
yarn install
```

### 2. Set Up Environment Variables
1. Get an OpenAI API key from [platform.openai.com](https://platform.openai.com)
2. Copy the environment template:
```bash
cp .env.example .env.local
```
3. Add your OpenAI API key to `.env.local`:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Start Reflecting!
```bash
yarn dev
```

Visit `http://localhost:3000` and start your reflection journey! 🎉

## 📝 How It Works

1. **Dashboard**: Start at your personal dashboard showing past reflections and saved prompts
2. **Reflect**: Answer the simple question "What stood out to you today?" in a clean, full-screen interface
3. **Explore**: Engage in a brief AI-powered conversation (2-3 exchanges) to dig deeper into your thoughts
4. **Create**: Receive 1-3 personalized writing prompts for blog posts, social media, or internal sharing
5. **Save & Return**: Save your favorite prompts and return to the dashboard to see your growing collection

## 🛠️ Development

### Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn lint` - Run ESLint

### Project Structure

```
line-by-line/
├── src/
│   ├── components/     # React components
│   │   ├── ui/        # Reusable UI components
│   │   ├── WritingInterface.tsx
│   │   ├── ChatInterface.tsx
│   │   ├── PromptsDisplay.tsx
│   │   └── JournalingApp.tsx
│   ├── lib/           # Utilities and OpenAI client
│   ├── pages/         # Next.js pages and API routes
│   └── styles/        # Global styles
└── public/            # Static assets
```

## 🧠 Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **AI**: OpenAI GPT-4o-mini for conversations and prompt generation
- **UI Components**: Custom components with Radix UI primitives
- **Styling**: Tailwind CSS with custom animations
- **Storage**: localStorage (Supabase integration ready for future)

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Set up your development environment: `yarn setup`
4. Make your changes
5. Test your changes: `yarn dev`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

## 📚 Documentation

- [Setup Guide](SETUP.md) - Detailed setup instructions
- [Database Schema](database-schema-plan.md) - Complete schema documentation
- [API Reference](docs/API.md) - API documentation
- [Deployment Guide](docs/DEPLOYMENT.md) - How to deploy

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add your Supabase environment variables
3. Deploy!

### Other Platforms
1. Set the environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Build and deploy: `yarn build && yarn start`

## 🐛 Troubleshooting

### Common Issues

**"Supabase CLI not found"**
```bash
yarn setup  # This will install it automatically
```

**"Database connection failed"**
1. Check your `.env.local` file has correct Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (for automated setup)
2. Verify database setup: `yarn db:verify`
3. Make sure your Supabase project is active

**"Environment variables not found"**
1. Ensure you have a `.env.local` file in the project root
2. Check that all required variables are set (no spaces around `=`)
3. Restart your development server after changing environment variables

**"Tables not found"**
```bash
yarn db:setup  # Re-run database setup
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Database powered by [Supabase](https://supabase.com/)
- Icons from [Lucide React](https://lucide.dev/)

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/line-by-line/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/line-by-line/discussions)
- **Documentation**: [Wiki](https://github.com/your-username/line-by-line/wiki)

---

Made with ❤️ for the learning community
