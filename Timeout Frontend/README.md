# 🎯 TimeOut - Focus & Study App

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-teal.svg)](https://tailwindcss.com/)

A modern, full-featured study application that helps students maintain focus and collaborate through virtual study sessions. Built with React 18, TypeScript, and a robust tech stack for optimal performance and user experience.

## ✨ Features

### 🎥 **Group Study Sessions**
- Real-time video integration for virtual study groups
- Automated check-in system with photo capture
- Live participant tracking and status updates
- Session timer with persistent state management

### ⏱️ **Personal Study Timer**
- Customizable study session durations (15min, 25min, 45min, 1hr)
- Persistent progress tracking across browser sessions
- Audio notifications for session completion
- Automatic reset functionality

### 🔐 **Authentication System**
- Clerk-powered secure authentication
- Demo mode for immediate testing
- User profile management
- Role-based access control

### 📊 **Progress Tracking**
- Study session history and analytics
- Check-in completion tracking
- Time-based progress visualization
- Achievement system

### 🎨 **Modern UI/UX**
- Responsive design for all screen sizes
- Accessibility-first component architecture
- Dark/light theme support
- Clean, professional interface using shadcn/ui

## 🛠️ Technologies Used

### **Frontend Stack**
- **React 18** - Modern React with concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality, accessible component library

### **Authentication & Backend**
- **Clerk** - Complete authentication solution
- **Firebase Functions** - Serverless backend functions
- **Firestore** - NoSQL database for real-time data

### **Development Tools**
- **ESLint** - Code quality and consistency
- **PostCSS** - CSS processing and optimization
- **Vite Plugin React** - Optimized React development

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/timeout-study-app.git
cd timeout-study-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env.local` file in the root directory:
```env
# Authentication (Optional - app runs in demo mode without these)
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

# Firebase Configuration (Optional for demo)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

4. **Start development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build optimized production bundle |
| `npm run build:dev` | Build development bundle with source maps |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint code quality checks |

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/              # Authentication flows
│   ├── dashboard/         # Main dashboard and navigation
│   │   └── tabs/          # Study, Groups, Classes, Schedule tabs
│   ├── group/             # Group study session components
│   └── ui/                # Reusable UI components (shadcn/ui)
├── config/                # App configuration and constants
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and helpers
├── pages/                 # Top-level page components
└── assets/                # Static assets and images
```

## 🔧 Configuration

### Demo Mode
The app runs in demo mode by default, allowing immediate testing without authentication setup. Simply start the dev server and begin exploring features.

### Production Setup
For production deployment:

1. Set up Clerk authentication project
2. Configure Firebase project and functions
3. Add environment variables
4. Run `npm run build`
5. Deploy the `dist/` folder to your hosting platform

## 📱 Browser Support

- **Chrome** 88+
- **Firefox** 78+
- **Safari** 14+
- **Edge** 88+

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [shadcn/ui](https://ui.shadcn.com/) components
- Icons from [Lucide React](https://lucide.dev/)
- Authentication powered by [Clerk](https://clerk.com/)
- Backend services by [Firebase](https://firebase.google.com/)

---

<p align="center">Made with ❤️ for focused learning</p>