import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from './pages/Signup';
import ForgotPassword from "./pages/ForgotPassword";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyOtp from "./pages/VerifyOtp";
import UserHome from "./pages/UserHome";
import Games from "./pages/Games";
import PlayGame from "./pages/PlayGame";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import Overview from "./pages/Overview";
import AIAnalysis from "./pages/AIAnalysis";
import Performance from "./pages/Performance";
import History from "./pages/History";
import Friends from "./pages/Friends";
import Achievements from "./pages/Achievements";
import ProtectedRoute from './components/ProtectedRoute'; 
import AdminGamesManagement from './pages/AdminGamesManagement';
import AdminWeeklyChallenges from './pages/AdminWeeklyChallenges';
import AdminPublicChallenges from "./pages/AdminPublicChallenges";
import AdminProfile from "./pages/AdminProfile";
import ChallengePage from "./pages/ChallengePage";
import SolveChallenge from "./pages/SolveChallenge";
import Leaderboard from "./pages/Leaderboard";
import WaitingRoomPage from "./pages/WaitingRoomPage";
import DashboardAdmin from './pages/DashboardAdmin'; 
import UserManagement from "./components/Admin/UserManagement";
import Notifications from "./components/Admin/Notifications";
import UserReport from './pages/UserReport';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} /> 
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/reset/:token" element={<ResetPasswordPage />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />

        <Route path="/home" element={<UserHome />} />
        <Route path="/games" element={<Games />} />
        <Route path="/play/:sessionId/:gameSlug" element={<PlayGame />} />
        <Route path="/play/:gameSlug" element={<PlayGame />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/overview" element={<Overview />} />
        <Route path="/ai-analysis" element={<AIAnalysis />} />
        <Route path="/performance" element={<Performance />} />
        <Route path="/history" element={<History />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/challenges" element={<ChallengePage />} />
        <Route path="/challenges/solve/:id" element={<SolveChallenge />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/waiting-room/:sessionId" element={<WaitingRoomPage />} />

        <Route element={<ProtectedRoute adminOnly={true} />}>
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/games" element={<AdminGamesManagement />} />
            <Route path="/admin/weekly-challenges" element={<AdminWeeklyChallenges />} />
            <Route path="/admin/notifications" element={<Notifications />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="/admin/dashboard" element={<DashboardAdmin />} />
            <Route path="/admin/users/report/:userId" element={<UserReport />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/public-challenges" element={<AdminPublicChallenges />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;