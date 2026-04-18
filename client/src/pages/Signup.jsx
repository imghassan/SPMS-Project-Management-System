import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Input } from '../components/UI';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  Phone,
  MapPin,
  Briefcase,
  UserCheck,
  Layers,
  Building
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    location: '',
    department: '',
    role: '',
    skills: '',
    officeLocation: ''
  });
  const { register, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
    return () => clearError();
  }, [clearError]);

  const validateForm = () => {
    if (!formData.fullName.trim()) return "Full name is required";
    if (!formData.email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) return "Please enter a valid email address";
    if (formData.password.length < 8) return "Password must be at least 8 characters long";
    if (formData.phone && !/^[0-9+\-() ]+$/.test(formData.phone)) return "Invalid phone number format";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      useAuthStore.setState({ error: validationError });
      return;
    }
    const success = await register(formData);
    if (success) {
      navigate('/dashboard');
    }
  };

  const updateField = (field, value) => {
    if (field === 'phone') {
      // Allow only numbers, +, -, (), and spaces
      const filteredValue = value.replace(/[^0-9+\-() ]/g, '');
      setFormData(prev => ({ ...prev, [field]: filteredValue }));
      return;
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-bg-main text-white flex flex-col">
      {/* Header */}
      <header className="p-8 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className='p-3 bg-[#00D1FF] rounded-md'>
            <Layers size={24} className=" bg-[#00D1FF]" />
          </div>
          <span className="font-bold text-xl tracking-tight uppercase text-primary">SPMS</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          <div className="text-center mb-10">
            <h1 className="text-5xl font-bold mb-4 tracking-tight">Create your account</h1>
            <p className="text-text-muted text-lg max-w-sm mx-auto">
              Join SPMS to streamline your workflow and team collaboration.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            {/* Core Credentials */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-6 -translate-y-1/5 text-text-muted" size={18} />
                  <Input
                    type="text"
                    placeholder="Full Name"
                    className="w-full bg-bg-main/50 py-4 pl-12 pr-6 border-white/5 focus:border-primary/50"
                    value={formData.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted">Work Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-6 -translate-y-1/5 text-text-muted" size={18} />
                  <Input
                    type="email"
                    placeholder="name@company.com"
                    className="w-full bg-bg-main/50 py-4 pl-12 pr-6 border-white/5 focus:border-primary/50"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b border-white/5 font-bold text-primary tracking-wide uppercase text-xs">
                <span>Personal Information</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-muted">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-6 -translate-y-1/5 text-text-muted" size={18} />
                    <Input
                      type="tel"
                      placeholder="+92 3xx xxxxxxx"
                      className="w-full bg-bg-main/50 py-4 pl-12 pr-6 border-white/5 focus:border-primary/50"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-muted">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-6 -translate-y-1/5 text-text-muted" size={18} />
                    <Input
                      type="text"
                      placeholder="City, Country"
                      className="w-full bg-bg-main/50 py-4 pl-12 pr-6 border-white/5 focus:border-primary/50"
                      value={formData.location}
                      onChange={(e) => updateField('location', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Work Details */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b border-white/5 font-bold text-primary tracking-wide uppercase text-xs">
                <span>Work Details</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-muted">Department</label>
                  <div className="relative">
                    <Building className="absolute left-4 top-6 -translate-y-1/5 text-text-muted" size={18} />
                    <Input
                      type="text"
                      placeholder="e.g. Engineering"
                      className="w-full bg-bg-main/50 py-4 pl-12 pr-6 border-white/5 focus:border-primary/50"
                      value={formData.department}
                      onChange={(e) => updateField('department', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-muted">Job Title</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-6 -translate-y-1/5 text-text-muted" size={18} />
                    <Input
                      type="text"
                      placeholder="e.g. Senior Developer"
                      className="w-full bg-bg-main/50 py-4 pl-12 pr-6 border-white/5 focus:border-primary/50"
                      value={formData.role}
                      onChange={(e) => updateField('role', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-muted">Skills</label>
                  <div className="relative">
                    <Layers className="absolute left-4 top-6 -translate-y-1/5 text-text-muted" size={18} />
                    <Input
                      type="text"
                      placeholder="e.g. html, css, js"
                      className="w-full bg-bg-main/50 py-4 pl-12 pr-6 border-white/5 focus:border-primary/50"
                      value={formData.skills}
                      onChange={(e) => updateField('skills', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-muted">Office Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-6 -translate-y-1/5 text-text-muted" size={18} />
                    <Input
                      type="text"
                      placeholder="Remote / Local Office"
                      className="w-full bg-bg-main/50 py-4 pl-12 pr-6 border-white/5 focus:border-primary/50"
                      value={formData.officeLocation}
                      onChange={(e) => updateField('officeLocation', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-6 -translate-y-1/5 text-text-muted" size={18} />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  className="w-full bg-bg-main/50 py-4 pl-12 pr-12 border-white/5 focus:border-primary/50"
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-0 bottom-0 my-auto text-text-muted hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-[10px] text-text-muted mt-2">
                Must be at least 8 characters with one number and symbol.
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-5 text-lg font-bold bg-primary text-bg-main flex items-center justify-center gap-2 group mb-8"
              disabled={loading}
            >
              {loading && <Loader2 className="animate-spin" size={20} />}
              {loading ? 'Creating Account...' : 'Create Account'}
              {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
            </Button>
          </form>

          <div className="text-center text-sm text-text-muted mb-8">
            Already have an account? <Link to="/login" className="text-primary hover:underline ml-1 font-semibold">Login</Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Signup;
