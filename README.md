# ⏰ TimeOut - Focus & Study App

A modern study application with timer functionality, group sessions, and clean green aesthetics.

## 🚀 Features

- **Focus Timer**: Pomodoro-style study sessions with persistence
- **Group Study**: Virtual study sessions with video integration
- **Clean Design**: Green theme (RGB 11, 110, 79) with glass effects
- **Demo Authentication**: Simple login for presentation purposes
- **Responsive**: Works on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for development and building
- **Tailwind CSS** for styling
- **Shadcn/ui** components
- **React Router** for navigation
- **Lucide React** for icons

### Backend (Optional)
- **Firebase Functions** with TypeScript
- **Firebase Firestore** for data storage
- **Express.js** for API endpoints

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Frontend Setup

```bash
cd "Timeout Frontend"
npm install
```

### Environment Variables
Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

### Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:8080`

## 🎯 Usage

### Demo Authentication
1. Click "Continue with Google" or "Sign in with Email"
2. Select your role (Student/Teacher)
3. Access the dashboard

### Study Timer
- Set focus duration (default: 25 minutes)
- Start/pause timer
- Timer persists across page refreshes
- Completion alerts and progress tracking

### Group Sessions
- Join virtual study rooms
- Camera integration (demo mode)
- Real-time participants display

## 🏗️ Project Structure

```
Timeout Frontend/
├── src/
│   ├── components/          # React components
│   │   ├── auth/           # Authentication components
│   │   ├── dashboard/      # Dashboard and tabs
│   │   └── ui/             # Reusable UI components
│   ├── config/             # Configuration files
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   └── pages/              # Page components
├── public/                 # Static assets
└── package.json           # Dependencies and scripts
```

## 🔧 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Design System

### Colors
- **Primary**: Green (RGB 11, 110, 79)
- **Background**: Ghost White (RGB 248, 248, 255)
- **Glass Effects**: Backdrop blur with transparency

### Components
The app uses a curated set of UI components:
- Buttons, Cards, Inputs, Labels
- Alerts, Badges, Dialogs
- Toast notifications, Tooltips

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Static Hosting
The built files in `dist/` can be deployed to:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting service

## 🔮 Future Enhancements

- [ ] Real authentication system
- [ ] Database persistence
- [ ] Calendar integration
- [ ] Study analytics
- [ ] Mobile app
- [ ] Collaborative features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- UI components by [shadcn/ui](https://ui.shadcn.com/)
- Design inspiration from modern study apps

---

**Note**: This is currently a demo application. For production use, implement proper authentication, database persistence, and security measures.