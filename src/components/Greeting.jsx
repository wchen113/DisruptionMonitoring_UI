import React, { useState } from 'react';

import './Greeting.css'; // Import the CSS file
import LogoutButton from '../pages/Logout';
import ProfileSetup from '../pages/ProfileSetupPage';

const Greeting = ({ userName }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleToggleDropdown = () => {
        setIsDropdownOpen(prevState => !prevState);
    };

    return (
        <div className="greeting-container">
            <div onClick={handleToggleDropdown} className="greeting">
                Hi, {userName}
            </div>
            {isDropdownOpen && (
                <div className="dropdown">
                    <LogoutButton />
                </div>
                
            )}
        </div>
    );
};

export default Greeting;
