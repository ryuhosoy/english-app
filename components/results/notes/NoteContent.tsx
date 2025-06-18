"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export function NoteContent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Summary</CardTitle>
            <Badge variant="outline">3 min read</Badge>
          </div>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <p>
            This video explores effective techniques for improving English
            listening comprehension. The speaker emphasizes that regular practice
            with authentic materials is key to developing strong listening skills.
          </p>
          <p>
            Three main strategies are discussed: active listening with a purpose,
            using varied content types, and implementing the
            listen-pause-predict method.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Key Points</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium text-lg">1. Active Listening</h3>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Listen with a specific purpose or question in mind</li>
              <li>Take notes on main ideas rather than trying to understand every word</li>
              <li>Replay challenging sections multiple times</li>
              <li>
                Focus on understanding the general message before worrying about
                details
              </li>
            </ul>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="font-medium text-lg">2. Content Variety</h3>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Use a mix of podcasts, videos, and conversations</li>
              <li>
                Start with clear, slower content and gradually increase
                difficulty
              </li>
              <li>Choose topics you're genuinely interested in</li>
              <li>
                Listen to different accents to improve overall comprehension
              </li>
            </ul>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="font-medium text-lg">
              3. Listen-Pause-Predict Method
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>
                Listen to a short segment (30 seconds to 1 minute)
              </li>
              <li>Pause and summarize what you heard</li>
              <li>Predict what might come next</li>
              <li>Continue listening to confirm predictions</li>
              <li>
                This technique builds active engagement and improves
                comprehension
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Practical Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="list-disc pl-5 space-y-3">
            <li className="text-muted-foreground">
              <span className="font-medium text-foreground">Daily Practice:</span>{" "}
              Even 10-15 minutes daily is more effective than occasional longer sessions
            </li>
            <li className="text-muted-foreground">
              <span className="font-medium text-foreground">Use Subtitles Strategically:</span>{" "}
              Start with subtitles if needed, then challenge yourself by removing them
            </li>
            <li className="text-muted-foreground">
              <span className="font-medium text-foreground">Adjust Playback Speed:</span>{" "}
              Slow down content initially, then gradually increase to natural speed
            </li>
            <li className="text-muted-foreground">
              <span className="font-medium text-foreground">Combine Skills:</span>{" "}
              Practice speaking by repeating phrases after listening to improve both skills simultaneously
            </li>
            <li className="text-muted-foreground">
              <span className="font-medium text-foreground">Track Progress:</span>{" "}
              Regularly assess your improvement by testing your comprehension with new materials
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}