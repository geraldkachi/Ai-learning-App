
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NotFound from './pages/NotFound';
import Register from './pages/Auth/Register';
import Login from './pages/Auth/Login';
import Flashcards from './pages/Flashcards/Flashcards';
import Dashboard from './pages/Dashboard/Dashboard';
import Profile from './pages/Profile/Profile';
import DocumentsList from './pages/Documents/DocumentsList';
import DocumentsDetails from './pages/Documents/DocumentsDetails';
import FlashcardList from './pages/Flashcards/FlashcardList';
import QuizTake from './pages/Quizzies/QuizTake';
import QuizResults from './pages/Quizzies/QuizResults';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuth } from './context/AuthContext';




function App() {
  
  const { isAuthenticated, isLoading, } = useAuth();
  
  if(isLoading) {
    <div className='flex items-center justify-center'>
      <div>Loading...</div>
    </div>
  
  } 
  return (
    <Router>
      <Routes>
        <Route path="/" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/documents" element={<DocumentsList />} />
          <Route path="/documents/:id" element={<DocumentsDetails  />} />
          <Route path="/flashcards" element={<FlashcardList />} />
          <Route path="/documents/:id/flashcards" element={<Flashcards />} />
          <Route path="/quizzes/:quizId" element={<QuizTake />} />
          <Route path="/quizzes/:quizId/results" element={<QuizResults />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App
