import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
            alert('Please enter a valid email address.');
            return;
        }

        try {
            const response = await fetch(`http://18.141.34.124:7043/api/UserProfiles/GetProfileByEmail?email=${encodeURIComponent(email)}`);

            if (!response.ok) {
                if (response.status >= 500 && response.status <= 599) {
                    throw new Error('Internal Server Error');
                } else if (response.status === 404) {
                    navigate('/profile-setup');
                    return;
                } else {
                    throw new Error('An error occurred. Please try again.');
                }
            }

            const data = await response.json();
            if (data.email) {
                navigate(`/homepage?email=${encodeURIComponent(email)}`);
            }
        } catch (error) {
            console.error('There was an error checking the email!', error.message);
            alert(error.message === 'Internal Server Error'
                ? 'Internal Server Error. Please try again later.'
                : 'There was an error. Please try again.');
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Login</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }} htmlFor="email">Email *</label>
                        <input
                            style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '3px', boxSizing: 'border-box', marginBottom: '10px' }}
                            type="email"
                            id="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <button
                        style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '14px' }}
                        type="submit"
                    >
                        Login
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Login;
