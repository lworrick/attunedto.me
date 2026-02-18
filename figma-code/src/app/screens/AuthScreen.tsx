import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Sparkles, Mail } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { signIn, signUp, signInWithMagicLink } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (useMagicLink) {
        await signInWithMagicLink(email);
        setSuccess('Check your email for a magic link to sign in!');
      } else if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      // Make error messages more user-friendly
      let errorMessage = err.message || 'Something went wrong';
      
      if (errorMessage.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please try again or sign up for a new account.';
      } else if (errorMessage.includes('User already registered')) {
        errorMessage = 'This email is already registered. Please sign in instead.';
      } else if (errorMessage.includes('Email rate limit exceeded')) {
        errorMessage = 'Too many requests. Please wait a moment before trying again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[--sand] flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(200, 122, 90, 0.12)' }}>
              <Sparkles className="h-8 w-8 text-[--clay]" strokeWidth={1.5} />
            </div>
          </div>
          <CardTitle className="text-3xl" style={{ fontFamily: 'var(--font-canela)' }}>Attune</CardTitle>
          <CardDescription className="text-base mt-2">
            {useMagicLink
              ? 'Sign in with a magic link sent to your email'
              : isSignUp
              ? 'Begin your supportive wellness journey'
              : 'Welcome back. Let\'s check in.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-[--basalt]">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {!useMagicLink && (
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-[--basalt]">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            )}
            {error && (
              <p className="text-sm text-[--adobe] bg-[rgba(182,94,60,0.1)] p-3 rounded-md">
                {error}
              </p>
            )}
            {success && (
              <p className="text-sm text-[--clay] bg-[rgba(200,122,90,0.1)] p-3 rounded-md">
                {success}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Loading...' : useMagicLink ? (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Magic Link
                </>
              ) : isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
            
            <div className="space-y-2">
              {!useMagicLink && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-sm text-[--clay] hover:text-[--adobe] transition-colors duration-200"
                  >
                    {isSignUp
                      ? 'Already have an account? Sign in'
                      : "Don't have an account? Sign up"}
                  </button>
                </div>
              )}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setUseMagicLink(!useMagicLink);
                    setError('');
                    setSuccess('');
                  }}
                  className="text-sm text-[--dust] hover:text-[--basalt] transition-colors duration-200"
                >
                  {useMagicLink
                    ? 'Use password instead'
                    : 'Or sign in with magic link'}
                </button>
              </div>
            </div>
          </form>
          <p className="text-xs text-[--dust] text-center mt-6">
            Your wellness data is stored securely and privately.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};