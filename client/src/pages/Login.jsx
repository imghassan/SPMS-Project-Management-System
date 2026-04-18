import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button, Input } from '../components/UI';
import useAuthStore from '../store/useAuthStore';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
    return () => clearError();
  }, [clearError]);

  const validateForm = () => {
    if (!formData.email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) return "Please enter a valid email address";
    if (!formData.password) return "Password is required";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      useAuthStore.setState({ error: validationError });
      return;
    }
    const success = await login(formData.email, formData.password);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="h-screen bg-bg-main text-white flex flex-col overflow-hidden">
      {/* Header - Absolute to allow perfect centering of main content */}
      <header className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center z-10">
        <Link to="/" className="flex items-center gap-2">
          <div className='p-3 bg-[#00D1FF] rounded-md'>
            <Layers size={24} className=" bg-[#00D1FF]" />
          </div>
          <span className="font-bold text-xl tracking-tight uppercase text-primary">SPMS</span>
        </Link>
      </header>
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-bg-section/50 p-10 rounded-3xl border border-white/5 shadow-2xl"
        >
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-3">Welcome Back</h1>
            <p className="text-text-muted">Log in to your SPMS account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-6 -translate-y-1/5 text-text-muted" size={18} />
                <Input
                  type="email"
                  placeholder="name@company.com"
                  className="w-full bg-bg-main/50 py-4 pl-12 pr-6 border-white/5 focus:border-primary/50"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-text-muted">Password</label>
                <button type="button" className="text-xs text-primary hover:underline">Forgot password?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-6 -translate-y-1/5 text-text-muted" size={18} />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full bg-bg-main/50 py-4 pl-12 pr-12 border-white/5 focus:border-primary/50"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-6 -translate-y-1/5 text-text-muted hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-4 text-lg font-bold bg-primary text-bg-main flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading && <Loader2 className="animate-spin" size={20} />}
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="text-center text-sm text-text-muted mt-8">
            Don't have an account? <Link to="/signup" className="text-primary hover:underline ml-1 font-semibold">Sign up</Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Login;
