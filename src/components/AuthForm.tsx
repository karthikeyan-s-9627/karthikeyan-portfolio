"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { showSuccess, showError } from "@/utils/toast";

const AuthForm: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [session, setSession] = React.useState<any>(null);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      showError(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Check if the user is an admin
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profileData?.is_admin) {
        // If not an admin or profile not found, log them out
        await supabase.auth.signOut();
        showError('You do not have admin privileges to access this dashboard.');
      } else {
        showSuccess('Logged in successfully!');
      }
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      showError(error.message);
    } else {
      showSuccess('Logged out successfully!');
    }
    setLoading(false);
  };

  if (session) {
    return (
      <Card className="w-full max-w-md mx-auto bg-card shadow-lg border border-border/50">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Welcome, Admin!</CardTitle>
          <CardDescription className="text-muted-foreground">You are currently logged in.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={handleLogout} disabled={loading} className="w-full max-w-[200px]">
            {loading ? 'Logging out...' : 'Logout'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-card shadow-lg border border-border/50">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-primary">Admin Login</CardTitle>
        <CardDescription className="text-muted-foreground">Enter your credentials to access the dashboard.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 bg-input/50 border-border/50 focus:border-primary"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 bg-input/50 border-border/50 focus:border-primary"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AuthForm;