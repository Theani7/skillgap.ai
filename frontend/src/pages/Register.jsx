import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../services/env';
import { motion } from 'framer-motion';
import { User, Mail, Lock, UserPlus } from 'lucide-react';

const Register = () => {
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password, full_name: fullName })
            });

            const data = await res.json();

            if (res.ok) {
                navigate('/login');
            } else {
                const errorMsg = data.detail?.[0]?.msg || data.detail || 'Registration failed';
                setError(errorMsg);
            }
        } catch (err) {
            const errorMsg = err.response?.data?.detail || 'Unable to connect to server. Please try again.';
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
                                className="w-16 h-16 rounded-xl bg-accent-500 text-white flex items-center justify-center mx-auto mb-4 shadow-lg hover:bg-accent-600 transition"
                                style={{ cursor: 'pointer' }}
                            >
                                <UserPlus size={32} />
                            </div>
                        </Link>
                        <h2 className="text-3xl font-bold mb-2">Create Account</h2>
                        <p className="text-secondary">Start your career transformation</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-error-50 text-error-600 p-3 rounded-lg text-sm font-medium mb-6 text-center">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        {/* Full Name Input */}
                        <div>
                            <label className="block mb-2 font-semibold text-sm text-primary">
                                Full Name
                            </label>
                            <div className="relative">
                                <User size={20} className="absolute top-1/2 left-4 -translate-y-1/2 text-tertiary pointer-events-none" />
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    placeholder="Enter your full name"
                                    className="input pl-12"
                                />
                            </div>
                        </div>

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
                                    placeholder="Choose a username"
                                    className="input pl-12"
                                />
                            </div>
                        </div>

                        {/* Email Input */}
                        <div>
                            <label className="block mb-2 font-semibold text-sm text-primary">
                                Email
                            </label>
                            <div className="relative">
                                <Mail size={20} className="absolute top-1/2 left-4 -translate-y-1/2 text-tertiary pointer-events-none" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="Enter your email"
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
                                    placeholder="Create a password"
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
                                    Creating account...
                                </span>
                            ) : (
                                'Create Account'
                            )}
                        </button>

                        {/* Footer Link */}
                        <p className="text-center mt-4 text-secondary text-sm">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="text-primary-600 font-bold hover:text-primary-700 transition"
                            >
                                Sign In
                            </Link>
                        </p>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
