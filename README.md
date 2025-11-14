# GATE Mind Tracker 🎓

A comprehensive study tracking and progress monitoring application designed specifically for GATE (Graduate Aptitude Test in Engineering) exam preparation.

## ✨ Features

### 📚 Subject Management
- Create and manage subjects with topics/units
- Track completion status for each topic
- Set study duration and hours for each subject
- Color-coded subject cards for easy identification
- Delete subjects with confirmation

### 📊 Test Performance Tracking
- **Mock Tests**: Track full-length mock exam scores
- **Subject Tests**: Monitor subject-specific test performance
- **Unit Tests**: Track individual unit/topic test scores
- Performance trend visualization with charts
- Delete test records with confirmation
- Subject and unit selection from created subjects

### ⏱️ Study Time Logger
- **Manual Entry**: Log study hours directly
- **Stopwatch Timer**: Built-in timer that persists across tab switches
  - Continues running even when switching tabs
  - Only stops when explicitly paused or browser closed
  - Automatically calculates elapsed time on return
- Visual charts showing last 7 days study pattern
- Weekly study hour totals

### 🔥 Study Streak Calendar
- 30-day heatmap visualization
- Current streak counter
- Motivational streak tracking
- Visual feedback for study consistency

### 📈 Performance Analytics
- Overall progress tracking
- Subject-wise performance analysis
- Target vs. actual score comparison
- Performance status indicators

### 🎯 Dashboard Overview
- Study streak display
- Total study time (weekly)
- Average test score across all tests
- Topics completion progress
- Quick stats at a glance

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **Charts**: Recharts
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: React Hooks
- **Form Handling**: React Hook Form + Zod
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn or bun
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gate-mind-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase Database**

   Create a table named `student_progress` with the following schema:
   ```sql
   create table student_progress (
     id uuid default uuid_generate_v4() primary key,
     student_id uuid references auth.users not null,
     subject text not null,
     progress jsonb not null,
     created_at timestamp with time zone default timezone('utc'::text, now()) not null,
     updated_at timestamp with time zone default timezone('utc'::text, now()) not null
   );

   -- Enable Row Level Security
   alter table student_progress enable row level security;

   -- Create policy for users to only access their own data
   create policy "Users can only access their own progress"
     on student_progress for all
     using (auth.uid() = student_id);
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
gate-mind-tracker/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components (shadcn)
│   │   ├── Dashboard.tsx   # Dashboard overview
│   │   ├── SubjectTracker.tsx
│   │   ├── TestTracker.tsx
│   │   ├── StudyTimeLogger.tsx
│   │   ├── StreakCalendar.tsx
│   │   └── ...
│   ├── hooks/              # Custom React hooks
│   │   ├── AuthProvider.tsx
│   │   └── useSupabaseAuth.ts
│   ├── lib/                # Utility libraries
│   │   ├── progressApi.ts  # Database API functions
│   │   ├── supabaseClient.ts
│   │   └── utils/
│   │       └── calculations.ts  # Helper functions
│   ├── pages/              # Page components
│   │   └── Index.tsx       # Main application page
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts
│   └── main.tsx            # Application entry point
├── public/
├── index.html
└── package.json
```

## 🗄️ Database Schema

### `student_progress` table

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `student_id` | uuid | Foreign key to auth.users |
| `subject` | text | Data type identifier (subjects, mock_tests, study_sessions) |
| `progress` | jsonb | JSON data containing the actual records |
| `created_at` | timestamp | Creation timestamp |
| `updated_at` | timestamp | Last update timestamp |

### Data Types stored in `progress` column:

- **subjects**: Array of subject objects with topics, hours, dates
- **mock_tests**: Array of test objects with scores, dates, types
- **study_sessions**: Array of session objects with hours and dates

## 🔐 Authentication

The app uses Supabase Authentication:
- Email/Password authentication
- Secure session management
- Row-level security policies
- User-specific data isolation

## 🎨 Key Features Explained

### Persistent Stopwatch
The stopwatch uses `localStorage` to maintain state across tab switches and browser sessions. It calculates elapsed time based on the last saved timestamp when you return to the tab.

### Test Categories
Tests are organized into three types:
- **Mock**: Full practice exams (no subject selection)
- **Subject**: Subject-specific tests (select from your subjects)
- **Unit**: Topic/unit specific tests (select subject + unit)

### Data Persistence
All data is automatically synced to Supabase:
- Subjects are saved when added/modified/deleted
- Tests are saved immediately after creation/deletion
- Study sessions persist automatically
- Streak data is calculated from study sessions

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Code Style

The project uses:
- ESLint for code linting
- TypeScript for type safety
- Prettier (recommended)

## 🚀 Deployment

### Build the app
```bash
npm run build
```

The built files will be in the `dist/` directory, ready to deploy to any static hosting service (Vercel, Netlify, etc.).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Backend by [Supabase](https://supabase.com/)
- Icons from [Lucide](https://lucide.dev/)

---

**Happy Studying! Good luck with your GATE preparation! 🎯**
