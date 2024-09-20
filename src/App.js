import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProfileSetupPage from './pages/ProfileSetupPage';
import Login from './pages/LoginPage';
import Map from './components/MapComponents'
import HomePage from './pages/HomePage';
import LogoutButton from './pages/Logout';
import WorldMap from './pages/WorldMap';
import CitySearch from './components/CitySearch';
import CitySearchAndSupplier from './components/CitySearch';
import DisruptionMonitoring from './components/DisruptionMonitoring.jsx';

const App = () => {
    return (
        <Router>
            <div>
                <Routes>
                    <Route path="/profile-setup" element={<ProfileSetupPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="*" element={<Login />} /> 
                    <Route path="/logout" element={<LogoutButton />} />
                    <Route path="/homepage" element={<HomePage />} />
                    <Route path="/city-search" element={<CitySearchAndSupplier />} />
                    {/* <Route path="/map" element={<WorldMap />} /> */}
                    <Route path="/search" element={<CitySearch />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
