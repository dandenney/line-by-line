# Line-by-Line 📝

A beautiful, minimalist daily journaling app that helps you reflect on your learning journey. Built with Next.js, TypeScript, and Supabase.

![Line-by-Line Screenshot](https://via.placeholder.com/800x400/1A2630/FFFFFF?text=Line-by-Line+Journaling+App)

## ✨ Features

- **Daily Reflections**: Answer three thoughtful questions each day
- **Streak Tracking**: Build momentum with visual streak tracking
- **Beautiful UI**: Clean, distraction-free interface
- **Cloud Sync**: Your entries are safely stored in the cloud
- **LLM Ready**: Flexible question system for future AI integration
- **Mobile Friendly**: Works great on all devices

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone https://github.com/your-username/line-by-line.git
cd line-by-line
yarn install
```

### 2. Set Up Supabase
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Get your project URL and anon key from Settings > API
3. Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ACCESS_TOKEN=your_supabase_access_token
```

**Note:**
- The service role key is required for automated database setup.
- The Supabase access token is required for automated migrations. You can generate one at [Supabase Account Tokens](https://app.supabase.com/account/tokens). Add it to your `.env.local` or export it in your shell:
  ```bash
  export SUPABASE_ACCESS_TOKEN=your_token_here
  ```

### 3. Set Up Database (Automated!)
```bash
yarn setup
```

This will automatically:
- Link your project to the Supabase CLI
- Run all migrations
- Set up all tables, functions, and security policies

**Alternative Manual Setup**: If you prefer not to use the service role key, you can manually run the SQL migration:
1. Go to your Supabase dashboard > SQL Editor
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and run it

### 4. Start Journaling!
```bash
yarn dev
```

Visit `http://localhost:3000` and start your daily reflection practice! 🎉

## 🛠️ Development

### Available Scripts

- `yarn setup` - Complete automated setup
- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn db:setup` - Set up database only
- `yarn db:verify` - Check database configuration
- `yarn lint` - Run ESLint

### Project Structure

```
line-by-line/
├── src/
│   ├── components/     # React components
│   ├── lib/           # Utilities and Supabase client
│   ├── pages/         # Next.js pages
│   └── types/         # TypeScript types
├── supabase/
│   └── migrations/    # Database migrations
├── scripts/           # Setup and utility scripts
└── public/            # Static assets
```

## 🗄️ Database Schema

The app uses a flexible schema designed for future LLM integration:

- **`entries`** - Daily journal entries with content
- **`user_settings`** - User preferences and streak days
- **`question_templates`** - Customizable question sets
- **`streak_analytics`** - Pre-calculated streak data

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
