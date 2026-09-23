import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import { selectCurrentUser, selectCurrentToken } from '../features/auth/authSlice';
import { useLoginMutation } from '../features/auth/authApiSlice';
import { setCredentials } from '../features/auth/authSlice';

export const Login = () => {
   const navigate = useNavigate();
   
    
    // 1. Check for token to verify logged-in status
    const token = useSelector(selectCurrentToken);
    if(token){
         // Redirect the user to your dashboard or animal list here
          return <Navigate to="/" />;
    }
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const dispatch = useDispatch();


    const [login, { isLoading }] = useLoginMutation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        try {
            const userData = await login({ username, password }).unwrap();

            dispatch(setCredentials({
                user: username,
                accessToken: userData.access,
                refreshToken: userData.refresh
            }));

            setUsername('');
            setPassword('');

            return <Navigate to="/" />;

        } catch (err) {
            if (err.status === 401) {
                setErrorMsg('Invalid username or password');
            } else {
                setErrorMsg('Login failed. Please try again.');
            }
        }
    };   

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-sage/20">

                <div className="text-center mb-8">
                    <h2 className="text-4xl font-serif text-saddle-brown font-bold mb-2">
                        Welcome Back
                    </h2>
                    <p className="text-sage text-sm">
                        Sign in to access your dashboard
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {errorMsg && (
                        <div className="bg-rust/10 border-l-4 border-rust text-rust p-3 rounded-r-md text-sm">
                            {errorMsg}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-1" htmlFor="username">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-sage/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-saddle-brown focus:border-transparent transition-all bg-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-1" htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-sage/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-saddle-brown focus:border-transparent transition-all bg-white"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-2 bg-saddle-brown text-desert-sand font-medium py-3 px-4 rounded-xl hover:bg-charcoal transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-saddle-brown focus:ring-offset-desert-sand disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Logging in...' : 'Sign In'}
                    </button>
                </form>

            </div>
        </div>
    );
};

export default Login;