import React, {
  useState,
  useEffect,
} from 'react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

import {
  motion,
  AnimatePresence,
} from 'framer-motion';

import {
  ArrowRight,
  Check,
  AlertCircle,
} from 'lucide-react';

import useAuthStore from '../../store/useAuthStore';
import { ROLES } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const {
    signup,
    isAuthenticated,
    user,
  } = useAuthStore();

  const navigate = useNavigate();

  const [step, setStep] =
    useState(1);

  const [role, setRole] =
    useState('');

  const [form, setForm] =
    useState({
      name: '',
      email: '',
      password: '',
      location: '',
    });

  const [errors, setErrors] =
    useState({});

  const [loading, setLoading] =
    useState(false);

  const [
    serverError,
    setServerError,
  ] = useState('');

  const validate = () => {
    const e = {};

    if (!form.name.trim())
      e.name =
        'Name is required';

    if (!form.email.trim())
      e.email =
        'Email is required';

    else if (
      !/\S+@\S+\.\S+/.test(
        form.email
      )
    )
      e.email =
        'Invalid email';

    if (
      !form.password ||
      form.password.length < 6
    )
      e.password =
        'Password must be 6+ characters';

    setErrors(e);

    return (
      Object.keys(e).length ===
      0
    );
  };

  useEffect(() => {
    if (
      isAuthenticated &&
      user
    ) {
      navigate(
        `/dashboard/${user.role}`,
        {
          replace: true,
        }
      );
    }
  }, [
    isAuthenticated,
    user,
    navigate,
  ]);

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    setServerError('');

    const result =
      await signup({
        name: form.name,
        email: form.email,
        password:
          form.password,
        role,
        location:
          form.location,
      });

    setLoading(false);

    if (result.success) {
      toast.success(
        'Account created! Welcome aboard 🎉'
      );

      navigate(
        `/dashboard/${result.user.role}`,
        {
          replace: true,
        }
      );
    } else {
      setServerError(
        result.error
      );
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-3 sm:p-4 grid-bg overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-brand-green/3 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="relative w-full max-w-lg"
      >
        {/* Logo */}
        <Link
          to="/"
          className="block text-center font-display font-bold text-xl sm:text-2xl mb-6 sm:mb-8 break-words"
        >
          Food
          <span className="text-brand-green">
            Bridge
          </span>
        </Link>

        {/* Card */}
        <div className="glass rounded-2xl border border-white/10 p-4 sm:p-6 lg:p-8 overflow-hidden">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6 sm:mb-8">
            {[1, 2].map((s) => (
              <React.Fragment
                key={s}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all flex-shrink-0 ${
                    step >= s
                      ? 'bg-brand-green text-black'
                      : 'bg-white/10 text-gray-500'
                  }`}
                >
                  {step > s ? (
                    <Check
                      size={14}
                    />
                  ) : (
                    s
                  )}
                </div>

                {s < 2 && (
                  <div
                    className={`flex-1 h-px transition-all ${
                      step > s
                        ? 'bg-brand-green/50'
                        : 'bg-white/10'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* STEP 1 */}
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{
                  opacity: 0,
                  x: -20,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  x: 20,
                }}
              >
                <h2 className="font-display font-bold text-2xl sm:text-3xl mb-1 break-words">
                  Choose your role
                </h2>

                <p className="text-gray-500 text-sm mb-6 break-words">
                  How will you
                  contribute to
                  FoodBridge?
                </p>

                <div className="space-y-3 mb-6">
                  {ROLES.map(
                    (r) => (
                      <button
                        key={r.id}
                        onClick={() =>
                          setRole(
                            r.id
                          )
                        }
                        className={`w-full p-3 sm:p-4 rounded-xl border text-left transition-all flex items-start sm:items-center gap-3 sm:gap-4 overflow-hidden ${
                          role ===
                          r.id
                            ? 'border-brand-green bg-brand-green/10'
                            : 'border-white/10 bg-white/3 hover:border-white/20'
                        }`}
                      >
                        <span className="text-2xl flex-shrink-0">
                          {r.icon}
                        </span>

                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm break-words">
                            {
                              r.label
                            }
                          </p>

                          <p className="text-xs text-gray-500 mt-0.5 break-words">
                            {
                              r.desc
                            }
                          </p>
                        </div>

                        {role ===
                          r.id && (
                          <Check
                            size={
                              16
                            }
                            className="text-brand-green flex-shrink-0 mt-1 sm:mt-0"
                          />
                        )}
                      </button>
                    )
                  )}
                </div>

                <button
                  className="btn-primary w-full justify-center py-3 px-4 text-center"
                  disabled={!role}
                  onClick={() =>
                    role &&
                    setStep(2)
                  }
                >
                  <span className="flex items-center justify-center gap-2 flex-wrap">
                    Continue

                    <ArrowRight
                      size={16}
                    />
                  </span>
                </button>
              </motion.div>
            ) : (
              /* STEP 2 */
              <motion.div
                key="step2"
                initial={{
                  opacity: 0,
                  x: 20,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  x: -20,
                }}
              >
                <h2 className="font-display font-bold text-2xl sm:text-3xl mb-1 break-words">
                  Create your
                  account
                </h2>

                <p className="text-gray-500 text-sm mb-6 break-words">
                  Joining as a{' '}
                  <span className="text-brand-green capitalize">
                    {role}
                  </span>
                </p>

                {/* Error */}
                {serverError && (
                  <div className="flex items-start gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-lg overflow-hidden">
                    <AlertCircle
                      size={15}
                      className="text-red-400 flex-shrink-0 mt-0.5"
                    />

                    <p className="text-sm text-red-400 break-words">
                      {
                        serverError
                      }
                    </p>
                  </div>
                )}

                {/* Form */}
                <form
                  onSubmit={
                    handleSubmit
                  }
                  className="space-y-4"
                >
                  {/* Name */}
                  <div>
                    <label className="block mb-1 text-sm break-words">
                      {role ===
                      'restaurant'
                        ? 'Restaurant / Hall Name'
                        : role ===
                          'ngo'
                        ? 'Organization Name'
                        : 'Full Name'}
                    </label>

                    <input
                      type="text"
                      placeholder={
                        role ===
                        'restaurant'
                          ? 'The Grand Kitchen'
                          : role ===
                            'ngo'
                          ? 'Hope Foundation'
                          : 'Arjun Sharma'
                      }
                      value={
                        form.name
                      }
                      onChange={(
                        e
                      ) =>
                        setForm(
                          (
                            p
                          ) => ({
                            ...p,
                            name: e
                              .target
                              .value,
                          })
                        )
                      }
                      className="w-full"
                    />

                    {errors.name && (
                      <p className="text-xs text-red-400 mt-1 break-words">
                        {
                          errors.name
                        }
                      </p>
                    )}
                  </div>

                  {/* Location */}
                  {(role ===
                    'restaurant' ||
                    role ===
                      'ngo') && (
                    <div>
                      <label className="block mb-1 text-sm">
                        Location
                        / Address
                      </label>

                      <input
                        type="text"
                        placeholder="Koramangala, Bangalore"
                        value={
                          form.location
                        }
                        onChange={(
                          e
                        ) =>
                          setForm(
                            (
                              p
                            ) => ({
                              ...p,
                              location:
                                e
                                  .target
                                  .value,
                            })
                          )
                        }
                        className="w-full"
                      />
                    </div>
                  )}

                  {/* Email */}
                  <div>
                    <label className="block mb-1 text-sm">
                      Email
                    </label>

                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={
                        form.email
                      }
                      onChange={(
                        e
                      ) =>
                        setForm(
                          (
                            p
                          ) => ({
                            ...p,
                            email: e
                              .target
                              .value,
                          })
                        )
                      }
                      className="w-full"
                    />

                    {errors.email && (
                      <p className="text-xs text-red-400 mt-1 break-words">
                        {
                          errors.email
                        }
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block mb-1 text-sm">
                      Password
                    </label>

                    <input
                      type="password"
                      placeholder="Min. 6 characters"
                      value={
                        form.password
                      }
                      onChange={(
                        e
                      ) =>
                        setForm(
                          (
                            p
                          ) => ({
                            ...p,
                            password:
                              e
                                .target
                                .value,
                          })
                        )
                      }
                      className="w-full"
                    />

                    {errors.password && (
                      <p className="text-xs text-red-400 mt-1 break-words">
                        {
                          errors.password
                        }
                      </p>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        setStep(1)
                      }
                      className="btn-secondary flex-1 justify-center py-3 px-4"
                    >
                      Back
                    </button>

                    <button
                      type="submit"
                      className="btn-primary flex-1 justify-center py-3 px-4"
                      disabled={
                        loading
                      }
                    >
                      {loading
                        ? 'Creating...'
                        : 'Create Account'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-6 break-words">
            Already have an
            account?{' '}
            <Link
              to="/login"
              className="text-brand-green hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
