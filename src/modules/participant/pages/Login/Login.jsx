import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../../../shared/hooks/useAuth';
import { useToast } from '../../../../shared/hooks/useToast';
import { Input } from '../../../../shared/components/common/Input';
import { Button } from '../../../../shared/components/common/Button';
import { isValidEmail, isRequired, validate } from '../../../../shared/utils/validators';
import { ROUTES } from '../../../../shared/utils/constants';

export default function Login() {
  const { login, isAuthenticated, role } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    const from = location.state?.from?.pathname || (role === 'participant' ? ROUTES.PARTICIPANT.DASHBOARD : '/');
    return <Navigate to={from} replace />;
  }

  function handleChange(field) {
    return (e) => setValues((v) => ({ ...v, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
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
    toast.success(`Welcome back, ${res.data.name.split(' ')[0]}.`);
    navigate(ROUTES.PARTICIPANT.DASHBOARD, { replace: true });
  }

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

        <p className="relative text-sm text-white/60 font-mono">v0.1 · Participant Portal</p>
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

          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Log in to your account</h1>
          <p className="mt-1.5 text-sm text-ink-500">Use your company email to access the events portal.</p>

          <form onSubmit={handleSubmit} noValidate className="mt-7 flex flex-col gap-4">
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
              required
              autoComplete="current-password"
            />

            <div className="flex items-center justify-end">
              <button type="button" className="text-sm font-medium text-accent-600 hover:text-accent-700">
                Forgot password?
              </button>
            </div>

            <Button type="submit" size="lg" isLoading={isSubmitting} className="w-full">
              Log in
            </Button>
          </form>

          <div className="mt-6 rounded-xl border border-border bg-canvas px-3.5 py-3 text-xs text-ink-500">
            Demo credentials — <span className="font-mono text-ink-700">lamine.yamal@company.com</span> /{' '}
            <span className="font-mono text-ink-700">password123</span>
          </div>
        </div>
      </div>
    </div>
  );
}
