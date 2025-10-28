# AI Fitness App

An AI-powered fitness and diet application built with React Native, Expo, and Supabase. The app analyzes user photos to provide personalized workout recommendations, diet plans, and progress tracking.

## 🚀 Features

- **Photo Analysis**: AI-powered body composition analysis and progress tracking
- **Personalized Workouts**: AI-generated workout plans based on user goals and equipment
- **Nutrition Planning**: Custom meal plans and nutrition tracking
- **Progress Analytics**: Visual progress tracking and performance metrics
- **Cross-Platform**: Works on iOS, Android, and Web

## 🛠 Tech Stack

- **Frontend**: React Native with Expo 54
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation
- **Styling**: React Native StyleSheet + Expo Linear Gradient
- **Testing**: Jest + React Native Testing Library
- **Code Quality**: ESLint + Prettier + TypeScript

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI
- Docker and Docker Compose (for local development)
- Supabase CLI (for database management)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd AIFitnessApp
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your Supabase credentials
nano .env
```

### 3. Start Local Development

#### Option A: Using Docker (Recommended)

```bash
# Start all services with Docker
npm run docker:up

# Check service status
npm run supabase:status
```

#### Option B: Using Supabase CLI

```bash
# Start Supabase locally
npm run supabase:start

# Apply database migrations
npm run supabase:db:push
```

### 4. Run the App

```bash
# Start Expo development server
npm start

# Run on specific platforms
npm run android
npm run ios
npm run web
```

## 🗄 Database Setup

### Supabase Project Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key
3. Update `.env` with your credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Schema

The database includes the following main tables:

- `user_profiles` - User information and preferences
- `user_photos` - Progress photos and analysis results
- `exercises` - Exercise database with instructions
- `workout_plans` - AI-generated workout plans
- `workout_sessions` - Workout execution tracking
- `meals` - Nutrition database
- `nutrition_plans` - AI-generated meal plans
- `nutrition_logs` - Meal consumption tracking
- `progress_analytics` - Progress metrics and analytics
- `ai_analysis_results` - AI analysis results storage

### Running Migrations

```bash
# Apply migrations to local database
npm run supabase:db:push

# Apply migrations to remote database
supabase db push --linked

# Generate new migration
supabase migration new migration_name
```

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run E2E tests (when implemented)
npm run test:e2e
```

## 🔧 Development

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check

# Type check
npm run type-check
```

### Database Management

```bash
# Start local Supabase
npm run supabase:start

# Stop local Supabase
npm run supabase:stop

# Reset database
npm run supabase:reset

# Check status
npm run supabase:status

# Generate database diff
npm run supabase:db:diff
```

### Docker Commands

```bash
# Start all services
npm run docker:up

# Stop all services
npm run docker:down

# View logs
npm run docker:logs

# Reset everything
npm run docker:reset
```

## 📁 Project Structure

```
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/         # Common components
│   │   ├── forms/          # Form components
│   │   └── ui/             # UI components
│   ├── screens/            # Screen components
│   │   ├── auth/           # Authentication screens
│   │   ├── onboarding/     # Onboarding flow
│   │   ├── workout/        # Workout screens
│   │   ├── nutrition/      # Nutrition screens
│   │   ├── progress/       # Progress tracking
│   │   └── profile/        # User profile
│   ├── navigation/         # Navigation configuration
│   ├── services/           # API and external services
│   │   ├── api/           # API services
│   │   ├── auth/          # Authentication service
│   │   └── storage/       # Storage service
│   ├── store/             # Redux store
│   │   ├── slices/        # Redux slices
│   │   └── middleware/    # Redux middleware
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── hooks/             # Custom React hooks
├── supabase/              # Supabase configuration
│   ├── migrations/        # Database migrations
│   ├── functions/         # Edge functions
│   └── seed/             # Seed data
├── .github/               # GitHub Actions workflows
├── docker-compose.yml     # Docker services
├── Dockerfile            # App containerization
└── README.md             # This file
```

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# App Configuration
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_API_URL=http://localhost:3000

# Development
EXPO_PUBLIC_DEBUG=true
```

## 🚀 Deployment

### Web Deployment

```bash
# Build for web
npm run build:web

# Deploy to your hosting platform
# (e.g., Vercel, Netlify, etc.)
```

### Mobile Deployment

```bash
# Build for Android
npm run build:android

# Build for iOS
npm run build:ios

# Submit to app stores
# (Follow Expo/EAS Build documentation)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@aifitnessapp.com or join our Slack channel.

## 🗺 Roadmap

- [ ] Photo analysis integration
- [ ] AI workout generation
- [ ] Nutrition planning
- [ ] Progress tracking
- [ ] Social features
- [ ] Wearable device integration
- [ ] Advanced analytics

---

Built with ❤️ using React Native, Expo, and Supabase