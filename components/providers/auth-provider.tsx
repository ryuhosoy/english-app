"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  console.log('AuthProvider初期化:', {
    timestamp: new Date().toISOString()
  });

  useEffect(() => {
    // 初期セッションを取得
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        console.log('初期セッション検出:', {
          userId: session.user.id,
          email: session.user.email,
          timestamp: new Date().toISOString()
        });
      }
    };

    getSession();

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('認証状態変更詳細:', {
          event,
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id,
          email: session?.user?.email,
          accessToken: !!session?.access_token,
          refreshToken: !!session?.refresh_token,
          timestamp: new Date().toISOString()
        });
        
        console.log('AuthProvider: 状態更新前:', {
          currentUser: user?.id,
          currentSession: !!session,
          timestamp: new Date().toISOString()
        });
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        console.log('AuthProvider: 状態更新後:', {
          newUser: session?.user?.id,
          newSession: !!session,
          timestamp: new Date().toISOString()
        });

        // ログイン成功時のログ出力のみ（リダイレクトは各ページで処理）
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('ログイン成功:', {
            userId: session.user.id,
            email: session.user.email,
            timestamp: new Date().toISOString()
          });
        }

        // ログアウト時のログ出力のみ（リダイレクトは各ページで処理）
        if (event === 'SIGNED_OUT') {
          console.log('ログアウト完了:', {
            timestamp: new Date().toISOString()
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('AuthProvider: ログイン処理開始:', { email, timestamp: new Date().toISOString() });
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    console.log('AuthProvider: signIn結果詳細:', {
      hasData: !!data,
      hasUser: !!data?.user,
      hasSession: !!data?.session,
      userId: data?.user?.id,
      email: data?.user?.email,
      accessToken: !!data?.session?.access_token,
      refreshToken: !!data?.session?.refresh_token,
      error: error?.message,
      timestamp: new Date().toISOString()
    });
    
    if (data.user) {
      console.log('AuthProvider: ログイン成功:', {
        userId: data.user.id,
        email: data.user.email,
        timestamp: new Date().toISOString()
      });
    }
    
    if (error) {
      console.error('AuthProvider: ログインエラー:', error);
    }
    
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    console.log('AuthProvider: 新規登録処理開始:', { email, timestamp: new Date().toISOString() });
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (data.user) {
      console.log('AuthProvider: 新規登録成功:', {
        userId: data.user.id,
        email: data.user.email,
        timestamp: new Date().toISOString()
      });
    }
    
    if (error) {
      console.error('AuthProvider: 新規登録エラー:', error);
    }
    
    return { error };
  };

  const signOut = async () => {
    console.log('AuthProvider: ログアウト処理開始:', {
      userId: user?.id,
      email: user?.email,
      timestamp: new Date().toISOString()
    });
    
    await supabase.auth.signOut();
    
    console.log('AuthProvider: ログアウト処理完了:', {
      timestamp: new Date().toISOString()
    });
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 