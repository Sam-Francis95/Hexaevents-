import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Zap, Mail, Lock, User, Building2, Trophy, Users, Award } from 'lucide-react';
import { useAuth } from '../../../../shared/hooks/useAuth';
import { useToast } from '../../../../shared/hooks/useToast';
import { Input } from '../../../../shared/components/common/Input';
import { Button } from '../../../../shared/components/common/Button';
import { isValidEmail, isRequired, validate } from '../../../../shared/utils/validators';
import { ROUTES } from '../../../../shared/utils/constants';
import { USE_MOCK } from '../../../../shared/services/apiClient';

const GOOGLE_CONFIGURED = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

export default function Login() {
  const { login, register, loginGoogle, isAuthenticated, role } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [values, setValues] = useState({
    name: '', email: '', password: '', department: '', college: '', batch: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    const from = location.state?.from?.pathname || (role === 'participant' ? ROUTES.PARTICIPANT.DASHBOARD : '/');
    return <Navigate to={from} replace />;
  }

  function handleChange(field) {
    return (e) => setValues((v) => ({ ...v, [field]: e.target.value }));
  }

  function goToDashboard(name) {
    toast.success(mode === 'signup' ? `Welcome, ${name.split(' ')[0]}.` : `Welcome back, ${name.split(' ')[0]}.`);
    navigate(ROUTES.PARTICIPANT.DASHBOARD, { replace: true });
  }

  async function handleLoginSubmit(e) {
    e.preventDefault();
    const fieldErrors = validate(values, {
      email: (v) => (!isRequired(v) ? 'Email is required.' : !isValidEmail(v) ? 'Enter a valid email address.' : null),
      password: (v) => (!isRequired(v) ? 'Password is required.' : null),
    });
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setIsSubmitting(true);
    const res = await login(values.email, values.password);
    setIsSubmitting(false);

    if (!res.success) {
      toast.error(res.message);
      return;
    }
    goToDashboard(res.data.name);
  }

  async function handleSignupSubmit(e) {
    e.preventDefault();
    const fieldErrors = validate(values, {
      name: (v) => (!isRequired(v) ? 'Name is required.' : null),
      email: (v) => (!isRequired(v) ? 'Email is required.' : !isValidEmail(v) ? 'Enter a valid email address.' : null),
      password: (v) => (!isRequired(v) ? 'Password is required.' : v.length < 8 ? 'Use at least 8 characters.' : null),
    });
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setIsSubmitting(true);
    const res = await register(values);
    setIsSubmitting(false);

    if (!res.success) {
      toast.error(res.message);
      return;
    }
    goToDashboard(res.data.name);
  }

  async function handleGoogleSuccess(credentialResponse) {
    const res = await loginGoogle(credentialResponse.credential);
    if (!res.success) {
      toast.error(res.message);
      return;
    }
    goToDashboard(res.data.name);
  }

  const isSignup = mode === 'signup';

  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden p-10 text-white lg:flex" style={{background: 'linear-gradient(145deg, #0C1F4A 0%, #0D2B6B 40%, #1a1060 70%, #0C1F4A 100%)'}}>
        {/* Decorative blobs */}
        <div className="absolute -right-16 -top-16 size-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 size-64 rounded-full bg-purple-600/15 blur-3xl" />
        <div className="absolute right-0 top-1/2 size-48 rounded-full bg-blue-400/10 blur-2xl" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0056D2_0%,#7C3AED_100%)] text-white shadow-lg">
            <Zap className="size-5" strokeWidth={2.5} />
          </span>
          <div>
            <p className="text-[13px] font-bold tracking-[0.14em] text-white">HEXAEVENTS</p>
            <p className="text-[10px] font-medium tracking-[0.1em] text-white/50">Discover • Participate • Excel</p>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative space-y-5 max-w-md">
          <p className="text-3xl font-bold leading-tight tracking-tight">
            Your journey to build,{' '}
            <span className="text-blue-300">compete</span>{' '}and{' '}
            <span className="text-purple-300">win</span>{' '}starts here.
          </p>
          <p className="text-base text-white/70 leading-relaxed">
            Discover hackathons, ideathons, and competitions curated for builders like you.
            Register in minutes, track your progress, and collect your achievements.
          </p>
          {/* Stats row */}
          <div className="flex gap-6 pt-2">
            {[
              { icon: Trophy, value: '500+', label: 'Events Hosted' },
              { icon: Users, value: '50K+', label: 'Participants' },
              { icon: Award, value: '₹2Cr+', label: 'Prize Pool' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon className="size-4 text-blue-300" />
                <div>
                  <p className="text-base font-bold text-white">{value}</p>
                  <p className="text-[11px] text-white/50">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-white/30 font-mono">HexaEvents · Participant Portal</p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#0056D2_0%,#7C3AED_100%)] text-white">
              <Zap className="size-4" strokeWidth={2.5} />
            </span>
            <div>
              <p className="text-[12px] font-bold tracking-[0.14em] text-ink-900">HEXAEVENTS</p>
              <p className="text-[9px] font-medium tracking-[0.1em] text-ink-400">Discover • Participate • Excel</p>
            </div>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
            {isSignup ? 'Create your account' : 'Log in to your account'}
          </h1>
          <p className="mt-1.5 text-sm text-ink-500">
            {isSignup ? 'Join thousands of builders, creators and innovators — takes a minute.' : 'Sign in to discover hackathons, ideathons and competitions.'}
          </p>

          {GOOGLE_CONFIGURED ? (
            <div className="mt-6">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Google sign-in failed. Please try again.')}
                width="100%"
                text={isSignup ? 'signup_with' : 'signin_with'}
              />
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-dashed border-border-strong bg-canvas px-3.5 py-3 text-xs text-ink-500">
              Google sign-in isn't configured yet (missing VITE_GOOGLE_CLIENT_ID) — use email and password below.
            </div>
          )}

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-ink-300">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={isSignup ? handleSignupSubmit : handleLoginSubmit} noValidate className="flex flex-col gap-4">
            {isSignup && (
              <Input
                label="Full name"
                placeholder="Your name"
                icon={<User />}
                value={values.name}
                onChange={handleChange('name')}
                error={errors.name}
                required
              />
            )}

            <Input
              label="Email"
              type="email"
              placeholder="you@company.com"
              icon={<Mail />}
              value={values.email}
              onChange={handleChange('email')}
              error={errors.email}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={<Lock />}
              value={values.password}
              onChange={handleChange('password')}
              error={errors.password}
              hint={isSignup ? 'At least 8 characters.' : undefined}
              required
              autoComplete={isSignup ? 'new-password' : 'current-password'}
            />

            {isSignup && (
              <Input
                label="College or department"
                placeholder="e.g. Product Engineering, or your college name"
                icon={<Building2 />}
                value={values.department || values.college}
                onChange={(e) => setValues((v) => ({ ...v, department: e.target.value, college: e.target.value }))}
                hint="Mavericks: your department. College participants: your college name."
              />
            )}

            {!isSignup && (
              <div className="flex items-center justify-end">
                <button type="button" className="text-sm font-medium text-accent-600 hover:text-accent-700">
                  Forgot password?
                </button>
              </div>
            )}

            <Button type="submit" size="lg" isLoading={isSubmitting} className="w-full">
              {isSignup ? 'Create account' : 'Log in'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            {isSignup ? 'Already have an account?' : "New here?"}{' '}
            <button
              type="button"
              className="font-medium text-accent-600 hover:text-accent-700"
              onClick={() => { setMode(isSignup ? 'login' : 'signup'); setErrors({}); }}
            >
              {isSignup ? 'Log in' : 'Create one'}
            </button>
          </p>

          <div className="mt-6 rounded-xl border border-border bg-canvas px-3.5 py-3 text-xs text-ink-500">
            Demo credentials —{' '}
            <span className="font-mono text-ink-700">
              {USE_MOCK ? 'priya.sharma@company.com' : 'demo.participant@example.com'}
            </span>{' '}
            / <span className="font-mono text-ink-700">password123</span>
          </div>
        </div>
      </div>
    </div>
  );
}
