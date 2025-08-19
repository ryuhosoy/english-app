"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { VideoUrlInput } from "@/components/video-input/VideoUrlInput";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { getPartOfSpeechLabel } from "@/lib/utils";
import { 
  BookOpen, 
  Brain, 
  Trophy, 
  Clock, 
  Target, 
  TrendingUp,
  Play,
  Bookmark,
  Volume2,
  RotateCw,
  Calendar,
  Star,
  ChevronRight,
  Settings,
  LogOut,
  Plus
} from "lucide-react";
import { SpeechPlayer } from "@/components/ui/speech-player";
import Link from "next/link";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isAddVideoOpen, setIsAddVideoOpen] = useState(false);
  const [imageLoadingStates, setImageLoadingStates] = useState<{[key: string]: boolean}>({});
  const router = useRouter();
  const { user, signOut, loading } = useAuth();
  const { toast } = useToast();
  const { 
    videos, 
    vocabularyWords, 
    studySessions, 
    userProgress, 
    recentVideos,
    savedWords,
    weeklyProgress, 
    todayGoals, 
    loading: dataLoading, 
    error 
  } = useDashboardData();

  // ダッシュボードアクセス時のログ出力とログアウト時のリダイレクト
  useEffect(() => {
    // ローディング中は何もしない
    if (loading) {
      console.log('ダッシュボード: 認証状態確認中...');
      return;
    }

    if (user) {
      console.log('ダッシュボードアクセス:', {
        userId: user.id,
        email: user.email,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      });
    } else {
      // ユーザーがログアウトした場合はログインページにリダイレクト
      console.log('ダッシュボード: ユーザーがログアウト - ログインページにリダイレクト');
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleAddVideo = (url: string) => {
    setIsAddVideoOpen(false);
    // 処理ページに遷移
    router.push(`/process?url=${encodeURIComponent(url)}`);
  };

  const handleLogout = async () => {
    try {
      console.log('ログアウト開始:', {
        userId: user?.id,
        email: user?.email,
        timestamp: new Date().toISOString()
      });
      
      await signOut();
      
      console.log('ログアウト完了:', {
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: "ログアウト完了",
        description: "ログアウトしました",
      });
      
      // AuthProviderで自動的にログインページにリダイレクトされるため、ここでは何もしない
    } catch (error) {
      console.error('ログアウトエラー:', error);
      toast({
        title: "エラー",
        description: "ログアウト中にエラーが発生しました",
        variant: "destructive",
      });
    }
  };

  // 認証ローディング中はローディング画面を表示
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">認証状態を確認中...</p>
        </div>
      </div>
    );
  }

  // データローディング中はローディング画面を表示
  if (dataLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  // エラーが発生した場合はエラー画面を表示
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold mb-2">データの読み込みに失敗しました</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            再読み込み
          </Button>
        </div>
      </div>
    );
  }

  // ユーザーがログインしていない場合は何も表示しない（useEffectでリダイレクト）
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">リダイレクト中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">LinguaNote AI</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/add-video">
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  新しい動画
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
              <Avatar>
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">おかえりなさい、{user?.email?.split('@')[0] || 'ユーザー'}さん！</h2>
          <p className="text-muted-foreground">今日も英語学習を続けましょう。</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">連続学習日数</CardTitle>
              <Trophy className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userProgress?.current_streak_days || 0}日</div>
              <p className="text-xs text-muted-foreground">
                素晴らしい継続力です！
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">総学習時間</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userProgress?.total_study_time_hours || 0}時間</div>
              <p className="text-xs text-muted-foreground">
                今月の学習時間
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">完了動画数</CardTitle>
              <Play className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userProgress?.total_videos_watched || 0}本</div>
              <p className="text-xs text-muted-foreground">
                +{videos.length} 今週
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">保存単語数</CardTitle>
              <Bookmark className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userProgress?.total_words_learned || 0}語</div>
              <p className="text-xs text-muted-foreground">
                +{vocabularyWords.length} 今週
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">概要</TabsTrigger>
            <TabsTrigger value="recent">最近の学習</TabsTrigger>
            <TabsTrigger value="vocabulary">単語帳</TabsTrigger>
            <TabsTrigger value="progress">進捗</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Today's Goal */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    今日の目標
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {todayGoals.map((goal, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{goal.name}</span>
                        <span>{goal.completed}/{goal.goal} 完了</span>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Weekly Progress Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    今週の学習状況
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {weeklyProgress.map((day, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium w-8">{day.day}</span>
                        <div className="flex-1 mx-4">
                          <div className="flex gap-1">
                            <div 
                              className="bg-blue-500 h-4 rounded-sm"
                              style={{ width: `${(day.videos / 3) * 100}%`, minWidth: '4px' }}
                            />
                            <div 
                              className="bg-green-500 h-4 rounded-sm"
                              style={{ width: `${(day.words / 25) * 100}%`, minWidth: '4px' }}
                            />
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground w-16 text-right">
                          {day.videos}動画 {day.words}語
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4 mt-4 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-blue-500 rounded-sm" />
                      <span>動画</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-500 rounded-sm" />
                      <span>単語</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>


          </TabsContent>

          <TabsContent value="recent" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>最近学習した動画</CardTitle>
                <Dialog open={isAddVideoOpen} onOpenChange={setIsAddVideoOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      新しい動画
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>新しい動画を追加</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <VideoUrlInput onSubmit={handleAddVideo} />
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {recentVideos.length > 0 ? (
                  <div className="space-y-4">
                    {recentVideos.map((video) => {
                      // 対応する動画データを取得
                      const videoData = videos.find(v => v.id === video.id);
                      return (
                        <div 
                          key={video.id} 
                          className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => {
                            if (videoData?.youtube_url) {
                              window.open(videoData.youtube_url, '_blank');
                            }
                          }}
                        >
                          <div className="relative">
                            {imageLoadingStates[video.id] !== false && (
                              <Skeleton className="w-24 h-16 rounded" />
                            )}
                            <img 
                              src={video.thumbnail} 
                              alt={video.title}
                              className={`w-24 h-16 object-cover rounded ${imageLoadingStates[video.id] === false ? 'block' : 'hidden'}`}
                              onLoad={() => {
                                setImageLoadingStates(prev => ({ ...prev, [video.id]: false }));
                              }}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA5NiA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijk2IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMiAyNEg2NFY0MEgzMloiIGZpbGw9IiNEN0Q5RDEiLz4KPHBhdGggZD0iTTQ4IDMyTDU2IDM4TDUyIDQySDQ0TDUwIDM4TDQ4IDMyWiIgZmlsbD0iIzk5Q0FGRiIvPgo8L3N2Zz4K';
                                setImageLoadingStates(prev => ({ ...prev, [video.id]: false }));
                              }}
                            />
                            <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                              {video.duration}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium mb-1">{video.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {video.completedAt}
                              </span>
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3" />
                                スコア: {video.score}%
                              </span>
                              <span className="flex items-center gap-1">
                                <BookOpen className="h-3 w-3" />
                                {video.wordsLearned}語学習
                              </span>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                      <Play className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">まだ学習した動画がありません</h3>
                    <p className="text-muted-foreground mb-6">
                      最初の動画を追加して学習を始めましょう
                    </p>
                    <Dialog open={isAddVideoOpen} onOpenChange={setIsAddVideoOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          最初の動画を追加
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>新しい動画を追加</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                          <VideoUrlInput onSubmit={handleAddVideo} />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vocabulary" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">保存した単語</h3>
                <p className="text-sm text-muted-foreground">復習が必要な単語を優先的に表示</p>
              </div>
            </div>

            <div className="grid gap-4">
              {savedWords.length > 0 ? (
                savedWords.map((word) => (
                  <Card key={word.id} className={`transition-all hover:shadow-md ${
                    !word.mastered ? 'border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20' : ''
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-lg">{word.word}</h4>
                          <Badge variant="outline" className="text-xs">
                            {getPartOfSpeechLabel(word.partOfSpeech)}
                          </Badge>
                          {/* <Badge variant={word.mastered ? "default" : "secondary"} className="text-xs">
                            {word.mastered ? "習得済み" : "学習中"}
                          </Badge> */}
                        </div>
                        <div className="flex items-center gap-1">
                          <SpeechPlayer 
                            text={word.word}
                            language="en-US"
                            size="sm"
                            showControls={false}
                            className="h-8"
                          />
                          {/* <Button size="icon" variant="ghost" className="h-8 w-8">
                            <Bookmark className="h-4 w-4 fill-current text-yellow-500" />
                          </Button> */}
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-2">{word.meaning}</p>
                      {/* <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>復習回数: {word.reviewCount}</span>
                        <span>最終復習: {word.lastReviewed}</span>
                        <Badge variant="outline" className="text-xs">
                          {word.difficulty}
                        </Badge>
                      </div> */}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">まだ保存された単語がありません</h3>
                  <p className="text-muted-foreground mb-6">
                    動画を学習して単語を保存しましょう
                  </p>
                  <Link href="/add-video">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      動画を追加
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            {/* 学習統計を横いっぱいに表示 */}
            <Card>
              <CardHeader>
                <CardTitle>学習統計</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {studySessions.length > 0 
                        ? Math.round(studySessions.reduce((sum, session) => sum + (session.score || 0), 0) / studySessions.length)
                        : 0}%
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">平均スコア</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {userProgress?.total_words_learned || 0}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">習得単語数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {userProgress?.longest_streak_days || 0}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">最長連続日数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {userProgress?.total_study_time_hours || 0}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">総学習時間</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>月間目標</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>動画学習 (20本)</span>
                      <span>{userProgress?.total_videos_watched || 0}/20 完了</span>
                    </div>
                    <Progress value={Math.min(((userProgress?.total_videos_watched || 0) / 20) * 100, 100)} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>新規単語習得 (100語)</span>
                      <span>{userProgress?.total_words_learned || 0}/100 完了</span>
                    </div>
                    <Progress value={Math.min(((userProgress?.total_words_learned || 0) / 100) * 100, 100)} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>学習時間 (30時間)</span>
                      <span>{Math.round(userProgress?.total_study_time_hours || 0)}/30 完了</span>
                    </div>
                    <Progress value={Math.min(((userProgress?.total_study_time_hours || 0) / 30) * 100, 100)} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}