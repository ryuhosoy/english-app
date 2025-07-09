"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock } from "lucide-react";

interface NotesViewProps {
  transcription: string;
}

export function NotesView({ transcription }: NotesViewProps) {
  // 文字数に基づいて推定される読み取り時間を計算
  const estimatedReadingTime = Math.ceil(transcription.length / 200); // 1分間に200文字と仮定

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              生成されたノート
            </CardTitle>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {estimatedReadingTime}分
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">音声文字起こし</h3>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {transcription}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}