import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import './SignForm.css';

export const SignForm = () => {
  const [isActive, setIsActive] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = (e) => {
    e.preventDefault();
    navigate('/mutualfund');
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    navigate('/mutualfund');
  };

  return (
    <div className={`container ${isActive ? 'active' : ''}`} id='container'>
      <div className='form-container sign-up'>
        <form onSubmit={handleSignUp}>
          <h1>Create Your Investor Account</h1>
          <span>or register using your email</span>
          <input type="text" placeholder='Full Name' required />
          <input type="email" placeholder='Email Address' required />
          <input type="password" placeholder='Create Password' required />
          <button type="submit">Sign Up</button>
        </form>
      </div>

      <div className='form-container sign-in'>
        <form onSubmit={handleSignIn}>
          <h1>Investor Login</h1>
          <span>or use your email to log in</span>
          <input type="email" placeholder='Email Address' required />
          <input type="password" placeholder='Password' required />
          <a href='#'>Forgot your password?</a>
          <button type="submit">Sign In</button>
        </form>
      </div>

      <div className="toggle-container">
        <div className="toggle">
          <div className='toggle-panel toggle-left'>
            <h1>Welcome Back, Investor!</h1>
            <p>Log in to continue tracking and managing your investments.</p>
            <button className='hidden' onClick={() => setIsActive(false)}>Sign In</button>
          </div>

          <div className='toggle-panel toggle-right'>
            <h1>New Here?</h1>
            <p>Join our investment platform and grow your portfolio today.</p>
            <button className='hidden' onClick={() => setIsActive(true)}>Sign Up</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignForm;