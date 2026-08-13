import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Sparkles, Mail, Lock, User, Building2 } from 'lucide-react';
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
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-banner-gradient p-10 text-white lg:flex">
        <div className="absolute -right-24 -top-24 size-96 rounded-full bg-white/10" />
        <div className="absolute -bottom-32 -left-16 size-80 rounded-full bg-white/10" />

        <div className="relative flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-xl bg-white/15">
            <Sparkles className="size-4" />
          </span>
          <span className="text-lg font-semibold tracking-tight">SmartEvent AI</span>
        </div>

        <div className="relative space-y-4 max-w-md">
          <p className="text-3xl font-semibold leading-tight tracking-tight">
            Every internal event, in one calm, well-organized place.
          </p>
          <p className="text-white/80">
            Register in a click, track your registrations, and collect certificates automatically —
            no more spreadsheets or forwarded emails.
          </p>
        </div>

        <p className="relative text-sm text-white/60 font-mono">v0.2 · Participant Portal</p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-xl bg-accent-500 text-white">
              <Sparkles className="size-4" />
            </span>
            <span className="text-lg font-semibold tracking-tight text-ink-900">SmartEvent AI</span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
            {isSignup ? 'Create your account' : 'Log in to your account'}
          </h1>
          <p className="mt-1.5 text-sm text-ink-500">
            {isSignup ? 'For Mavericks and college participants — takes a minute.' : 'Use Google, or your email and password.'}
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
