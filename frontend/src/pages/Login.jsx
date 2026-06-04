import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../services/env';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Zap } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        try {
            console.log('Attempting login to:', `${API_URL}/api/auth/login`);
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData.toString()
            });

            const data = await res.json();
            console.log('Login response:', res.status, data);

            if (res.ok) {
                login(data.access_token, data.role, data.username, data.full_name);
                navigate('/app');
            } else {
                const errorMsg = data.detail?.[0]?.msg || data.detail || 'Login failed';
                setError(errorMsg);
            }
        } catch (err) {
            console.error('Login error:', err);
            const errorMsg = err.message || 'Unable to connect to server. Please try again.';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="py-20 px-4 flex items-center justify-center min-h-[calc(100vh-200px)]">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                className="w-full max-w-[420px]"
            >
                <div className="card p-8 md:p-12">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-block no-underline">
                            <div
                                className="w-16 h-16 rounded-xl bg-primary-600 flex items-center justify-center mx-auto mb-4 shadow-lg hover:bg-primary-700 transition"
                                style={{ cursor: 'pointer' }}
                            >
                                <Zap size={32} fill="white" color="white" />
                            </div>
                        </Link>
                        <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
                        <p className="text-secondary">Sign in to continue your journey</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-error-50 text-error-600 p-3 rounded-lg text-sm font-medium mb-6 text-center">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        {/* Username Input */}
                        <div>
                            <label className="block mb-2 font-semibold text-sm text-primary">
                                Username
                            </label>
                            <div className="relative">
                                <User size={20} className="absolute top-1/2 left-4 -translate-y-1/2 text-tertiary pointer-events-none" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    placeholder="Enter your username"
                                    className="input pl-12"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block mb-2 font-semibold text-sm text-primary">
                                Password
                            </label>
                            <div className="relative">
                                <Lock size={20} className="absolute top-1/2 left-4 -translate-y-1/2 text-tertiary pointer-events-none" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="Enter your password"
                                    className="input pl-12"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                                    Signing in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>

                        {/* Footer Link */}
                        <p className="text-center mt-4 text-secondary text-sm">
                            Don't have an account?{' '}
                            <Link
                                to="/register"
                                className="text-primary-600 font-bold hover:text-primary-700 transition"
                            >
                                Register here
                            </Link>
                        </p>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
