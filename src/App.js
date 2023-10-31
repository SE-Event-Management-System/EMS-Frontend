import './App.css';
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import SignupPage from './pages/Signup';
import LoginPage from './pages/Login';
import Navbar from './components/NavBar';
import Dashboard from './components/EventsDashboard';
import OtpPage from './pages/Otp';

function App() {
  return (
    <>
    <BrowserRouter>
    <Navbar/>
        <Routes>
            <Route path="/events" element={<Dashboard/>}/>
            <Route path="/login" element={<LoginPage/>} />
            <Route path="/signup" element={<SignupPage/>} />
            <Route path="/verifyOtp" element={<OtpPage/>} />
        </Routes>
      </BrowserRouter>
  </>
  );
}

export default App;
