'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/ToastProvider';
import PageTransition from '@/components/PageTransition';

import categoriesData from '@/data/categories.json';

// Flatten all skills into a single unique array and sort alphabetically
const availableSkills = Array.from(
  new Set(
    categoriesData.flatMap(cat => 
      cat.subcategories.flatMap(sub => sub.skills)
    )
  )
).sort();

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [skillSearch, setSkillSearch] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    skills: [],
    experience: 0,
    location: '',
    locationPreference: 'any',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password) {
        setError('All fields are required.');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      setStep(2);
      return;
    }

    setLoading(true);
    try {
      await signup(formData);
      toast.success('Account created! Welcome to GigZora 🎉');
      router.push('/dashboard');
    } catch (err) {
      const msg = err.message || 'Signup failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const filteredSkills = skillSearch.trim() === '' 
    ? availableSkills 
    : availableSkills.filter(s => s.toLowerCase().includes(skillSearch.toLowerCase()));

  return (
    <PageTransition>
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-10 bg-surface-50 dark:bg-surface-950">
      <div className="relative marketplace-card bg-white border border-surface-200 dark:border-surface-800 p-8 md:p-10 w-full max-w-lg animate-scale-in">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-1">Create Your Account</h1>
          <p className="text-surface-500 dark:text-surface-400 text-sm">Step {step} of 2 — {step === 1 ? 'Basic Info' : 'Your Skills'}</p>
        </div>

        <div className="flex gap-2 mb-8">
          <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-primary-600' : 'bg-surface-200 dark:bg-surface-700'}`} />
          <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-primary-600' : 'bg-surface-200 dark:bg-surface-700'}`} />
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-sm animate-slide-down">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {step === 1 ? (
            <>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="input-field"
                  placeholder="Minimum 6 characters"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Select Your Skills</label>
                <input
                  type="text"
                  placeholder="Search over 150+ skills..."
                  value={skillSearch}
                  onChange={e => setSkillSearch(e.target.value)}
                  className="input-field mb-2"
                />
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 rounded-xl bg-surface-50 dark:bg-surface-800/50 scrollbar-hide border border-surface-200 dark:border-surface-700">
                  {filteredSkills.length === 0 ? (
                    <p className="text-xs text-surface-500 w-full text-center py-2">No skills found.</p>
                  ) : filteredSkills.map(skill => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 ${
                        formData.skills.includes(skill)
                          ? 'bg-primary-600 text-white shadow-sm border border-primary-700'
                          : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 hover:bg-surface-200 border border-surface-200'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
                {formData.skills.length > 0 && (
                  <p className="text-xs text-primary-600 dark:text-primary-400 mt-1.5 font-medium">{formData.skills.length} skills selected</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Experience (years)</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={formData.experience}
                    onChange={e => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Location Preference</label>
                  <select
                    value={formData.locationPreference}
                    onChange={e => setFormData({ ...formData, locationPreference: e.target.value })}
                    className="input-field"
                  >
                    <option value="any">Any</option>
                    <option value="local">Local</option>
                    <option value="national">National</option>
                    <option value="international">International</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="input-field"
                  placeholder="e.g., San Francisco, CA"
                />
              </div>
            </>
          )}

          <div className="flex gap-3">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-secondary flex-1 !py-3.5"
              >
                ← Back
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 !py-3.5 text-base disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating Account...
                </span>
              ) : step === 1 ? 'Next →' : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-surface-500 dark:text-surface-400">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
    </PageTransition>
  );
}
