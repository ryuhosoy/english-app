"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Brain, Mail, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/hooks/use-toast";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signUp, user } = useAuth();
  const { toast } = useToast();

  // ログイン済みの場合はダッシュボードにリダイレクト
  useEffect(() => {
    if (user) {
      console.log('登録ページ: ユーザーがログイン済み - ダッシュボードにリダイレクト');
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "パスワードエラー",
        description: "パスワードが一致しません",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "パスワードエラー",
        description: "パスワードは6文字以上で入力してください",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('新規登録試行中:', { 
        email, 
        timestamp: new Date().toISOString() 
      });
      
      const { error } = await signUp(email, password);
      
      if (error) {
        console.error('新規登録エラー:', error);
        toast({
          title: "登録エラー",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log('新規登録成功:', { 
          email, 
          timestamp: new Date().toISOString()
        });
        
        toast({
          title: "登録成功",
          description: "確認メールを送信しました。メールを確認してログインしてください。",
        });
        
        // 登録後はログインページに手動でリダイレクト（AuthProviderでは自動リダイレクトしない）
        setTimeout(() => {
          router.push('/login');
        }, 1000);
      }
    } catch (error) {
      console.error('新規登録処理中にエラーが発生:', error);
      toast({
        title: "エラー",
        description: "登録中にエラーが発生しました",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Brain className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">アカウント作成</CardTitle>
          <p className="text-muted-foreground">
            LinguaNote AIで英語学習を始めましょう
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="パスワードを入力（6文字以上）"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">パスワード確認</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="パスワードを再入力"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "登録中..." : "アカウント作成"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              既にアカウントをお持ちの方は{" "}
              <Link href="/login" className="text-primary hover:underline">
                ログイン
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 