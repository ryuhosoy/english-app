"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, ZoomIn, ZoomOut, Fullscreen, RotateCw } from "lucide-react";

export function DiagramView() {
  const [zoomLevel, setZoomLevel] = useState(100);
  
  const increaseZoom = () => setZoomLevel(prev => Math.min(prev + 10, 200));
  const decreaseZoom = () => setZoomLevel(prev => Math.max(prev - 10, 50));
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Visual Learning Aids</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
                <span className="sr-only">Download</span>
              </Button>
              <Button variant="outline" size="icon" onClick={decreaseZoom}>
                <ZoomOut className="h-4 w-4" />
                <span className="sr-only">Zoom out</span>
              </Button>
              <span className="text-sm w-12 text-center">{zoomLevel}%</span>
              <Button variant="outline" size="icon" onClick={increaseZoom}>
                <ZoomIn className="h-4 w-4" />
                <span className="sr-only">Zoom in</span>
              </Button>
              <Button variant="outline" size="icon">
                <Fullscreen className="h-4 w-4" />
                <span className="sr-only">Fullscreen</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="flowchart">
            <TabsList className="mb-4">
              <TabsTrigger value="flowchart">Process Flow</TabsTrigger>
              <TabsTrigger value="mindmap">Mind Map</TabsTrigger>
              <TabsTrigger value="comparison">Comparison</TabsTrigger>
            </TabsList>
            
            <div 
              style={{ 
                transform: `scale(${zoomLevel / 100})`, 
                transformOrigin: 'top left',
                transition: 'transform 0.2s ease-out' 
              }}
            >
              <TabsContent value="flowchart" className="mt-0">
                <div className="border rounded-lg p-6 bg-card">
                  <svg width="100%" height="400" viewBox="0 0 800 400">
                    {/* Flow chart showing the listening improvement process */}
                    <defs>
                      <marker
                        id="arrowhead"
                        markerWidth="10"
                        markerHeight="7"
                        refX="9"
                        refY="3.5"
                        orient="auto"
                      >
                        <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
                      </marker>
                    </defs>
                    
                    {/* Nodes */}
                    <rect x="50" y="170" width="150" height="60" rx="8" fill="hsl(var(--primary)/10)" stroke="hsl(var(--primary)/30)" strokeWidth="2" />
                    <text x="125" y="205" textAnchor="middle" fill="currentColor" fontSize="16" fontWeight="500">Start</text>
                    
                    <rect x="325" y="70" width="150" height="60" rx="8" fill="hsl(var(--chart-1)/10)" stroke="hsl(var(--chart-1)/30)" strokeWidth="2" />
                    <text x="400" y="105" textAnchor="middle" fill="currentColor" fontSize="16" fontWeight="500">Active Listening</text>
                    
                    <rect x="325" y="170" width="150" height="60" rx="8" fill="hsl(var(--chart-2)/10)" stroke="hsl(var(--chart-2)/30)" strokeWidth="2" />
                    <text x="400" y="205" textAnchor="middle" fill="currentColor" fontSize="16" fontWeight="500">Content Variety</text>
                    
                    <rect x="325" y="270" width="150" height="60" rx="8" fill="hsl(var(--chart-3)/10)" stroke="hsl(var(--chart-3)/30)" strokeWidth="2" />
                    <text x="400" y="305" textAnchor="middle" fill="currentColor" fontSize="16" fontWeight="500">Listen-Pause-Predict</text>
                    
                    <rect x="600" y="170" width="150" height="60" rx="8" fill="hsl(var(--primary)/10)" stroke="hsl(var(--primary)/30)" strokeWidth="2" />
                    <text x="675" y="195" textAnchor="middle" fill="currentColor" fontSize="16" fontWeight="500">Improved</text>
                    <text x="675" y="215" textAnchor="middle" fill="currentColor" fontSize="16" fontWeight="500">Comprehension</text>
                    
                    {/* Connectors */}
                    <line x1="200" y1="200" x2="305" y2="100" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrowhead)" />
                    <line x1="200" y1="200" x2="325" y2="200" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrowhead)" />
                    <line x1="200" y1="200" x2="305" y2="300" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrowhead)" />
                    
                    <line x1="475" y1="100" x2="580" y2="170" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrowhead)" />
                    <line x1="475" y1="200" x2="600" y2="200" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrowhead)" />
                    <line x1="475" y1="300" x2="580" y2="230" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrowhead)" />
                  </svg>
                </div>
              </TabsContent>
              
              <TabsContent value="mindmap" className="mt-0">
                <div className="border rounded-lg p-6 bg-card">
                  <svg width="100%" height="500" viewBox="0 0 800 500">
                    {/* Mind map of listening comprehension concepts */}
                    <defs>
                      <marker
                        id="arrowhead-mm"
                        markerWidth="10"
                        markerHeight="7"
                        refX="9"
                        refY="3.5"
                        orient="auto"
                      >
                        <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
                      </marker>
                    </defs>
                    
                    {/* Central concept */}
                    <circle cx="400" cy="250" r="70" fill="hsl(var(--primary)/10)" stroke="hsl(var(--primary)/30)" strokeWidth="2" />
                    <text x="400" y="245" textAnchor="middle" fill="currentColor" fontSize="18" fontWeight="500">Listening</text>
                    <text x="400" y="265" textAnchor="middle" fill="currentColor" fontSize="18" fontWeight="500">Comprehension</text>
                    
                    {/* Branches */}
                    {/* Active Listening */}
                    <circle cx="200" cy="120" r="50" fill="hsl(var(--chart-1)/10)" stroke="hsl(var(--chart-1)/30)" strokeWidth="2" />
                    <text x="200" y="115" textAnchor="middle" fill="currentColor" fontSize="16" fontWeight="500">Active</text>
                    <text x="200" y="135" textAnchor="middle" fill="currentColor" fontSize="16" fontWeight="500">Listening</text>
                    <path d="M340 210 Q 280 170 240 150" stroke="currentColor" strokeWidth="2" fill="none" markerEnd="url(#arrowhead-mm)" />
                    
                    {/* Sub-concepts */}
                    <circle cx="100" cy="70" r="40" fill="hsl(var(--chart-1)/5)" stroke="hsl(var(--chart-1)/20)" strokeWidth="1.5" />
                    <text x="100" y="75" textAnchor="middle" fill="currentColor" fontSize="14">Purpose</text>
                    <path d="M160 95 Q 140 85 125 80" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    
                    <circle cx="110" cy="170" r="40" fill="hsl(var(--chart-1)/5)" stroke="hsl(var(--chart-1)/20)" strokeWidth="1.5" />
                    <text x="110" y="175" textAnchor="middle" fill="currentColor" fontSize="14">Take Notes</text>
                    <path d="M160 140 Q 145 150 130 160" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    
                    {/* Content Variety */}
                    <circle cx="600" cy="120" r="50" fill="hsl(var(--chart-2)/10)" stroke="hsl(var(--chart-2)/30)" strokeWidth="2" />
                    <text x="600" y="115" textAnchor="middle" fill="currentColor" fontSize="16" fontWeight="500">Content</text>
                    <text x="600" y="135" textAnchor="middle" fill="currentColor" fontSize="16" fontWeight="500">Variety</text>
                    <path d="M460 210 Q 520 170 560 150" stroke="currentColor" strokeWidth="2" fill="none" markerEnd="url(#arrowhead-mm)" />
                    
                    {/* Sub-concepts */}
                    <circle cx="700" cy="70" r="40" fill="hsl(var(--chart-2)/5)" stroke="hsl(var(--chart-2)/20)" strokeWidth="1.5" />
                    <text x="700" y="75" textAnchor="middle" fill="currentColor" fontSize="14">Podcasts</text>
                    <path d="M640 95 Q 660 85 675 80" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    
                    <circle cx="690" cy="170" r="40" fill="hsl(var(--chart-2)/5)" stroke="hsl(var(--chart-2)/20)" strokeWidth="1.5" />
                    <text x="690" y="175" textAnchor="middle" fill="currentColor" fontSize="14">Videos</text>
                    <path d="M640 140 Q 655 150 670 160" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    
                    {/* Listen-Pause-Predict */}
                    <circle cx="200" cy="380" r="50" fill="hsl(var(--chart-3)/10)" stroke="hsl(var(--chart-3)/30)" strokeWidth="2" />
                    <text x="200" y="370" textAnchor="middle" fill="currentColor" fontSize="16" fontWeight="500">Listen</text>
                    <text x="200" y="390" textAnchor="middle" fill="currentColor" fontSize="16" fontWeight="500">Pause</text>
                    <text x="200" y="410" textAnchor="middle" fill="currentColor" fontSize="16" fontWeight="500">Predict</text>
                    <path d="M340 290 Q 280 330 240 350" stroke="currentColor" strokeWidth="2" fill="none" markerEnd="url(#arrowhead-mm)" />
                    
                    {/* Sub-concepts */}
                    <circle cx="100" cy="330" r="40" fill="hsl(var(--chart-3)/5)" stroke="hsl(var(--chart-3)/20)" strokeWidth="1.5" />
                    <text x="100" y="335" textAnchor="middle" fill="currentColor" fontSize="14">Segments</text>
                    <path d="M160 350 Q 140 342 125 337" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    
                    <circle cx="110" cy="430" r="40" fill="hsl(var(--chart-3)/5)" stroke="hsl(var(--chart-3)/20)" strokeWidth="1.5" />
                    <text x="110" y="430" textAnchor="middle" fill="currentColor" fontSize="14">Summarize</text>
                    <path d="M160 390 Q 145 405 130 415" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    
                    {/* Practical Tips */}
                    <circle cx="600" cy="380" r="50" fill="hsl(var(--chart-4)/10)" stroke="hsl(var(--chart-4)/30)" strokeWidth="2" />
                    <text x="600" y="380" textAnchor="middle" fill="currentColor" fontSize="16" fontWeight="500">Practical</text>
                    <text x="600" y="400" textAnchor="middle" fill="currentColor" fontSize="16" fontWeight="500">Tips</text>
                    <path d="M460 290 Q 520 330 560 350" stroke="currentColor" strokeWidth="2" fill="none" markerEnd="url(#arrowhead-mm)" />
                    
                    {/* Sub-concepts */}
                    <circle cx="700" cy="330" r="40" fill="hsl(var(--chart-4)/5)" stroke="hsl(var(--chart-4)/20)" strokeWidth="1.5" />
                    <text x="700" y="330" textAnchor="middle" fill="currentColor" fontSize="14">Daily</text>
                    <text x="700" y="350" textAnchor="middle" fill="currentColor" fontSize="14">Practice</text>
                    <path d="M640 350 Q 660 342 675 337" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    
                    <circle cx="690" cy="430" r="40" fill="hsl(var(--chart-4)/5)" stroke="hsl(var(--chart-4)/20)" strokeWidth="1.5" />
                    <text x="690" y="430" textAnchor="middle" fill="currentColor" fontSize="14">Adjust</text>
                    <text x="690" y="450" textAnchor="middle" fill="currentColor" fontSize="14">Speed</text>
                    <path d="M640 390 Q 655 405 670 415" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  </svg>
                </div>
              </TabsContent>
              
              <TabsContent value="comparison" className="mt-0">
                <div className="border rounded-lg p-6 bg-card">
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="col-span-1"></div>
                    <div className="col-span-1 p-2 bg-blue-500/10 font-medium rounded-md text-center">Beginner</div>
                    <div className="col-span-1 p-2 bg-purple-500/10 font-medium rounded-md text-center">Intermediate</div>
                    <div className="col-span-1 p-2 bg-orange-500/10 font-medium rounded-md text-center">Advanced</div>
                    
                    <div className="col-span-1 p-2 bg-muted/50 font-medium rounded-md">Content Speed</div>
                    <div className="col-span-1 p-2 bg-blue-500/5 rounded-md text-center">Slower</div>
                    <div className="col-span-1 p-2 bg-purple-500/5 rounded-md text-center">Natural</div>
                    <div className="col-span-1 p-2 bg-orange-500/5 rounded-md text-center">Fast</div>
                    
                    <div className="col-span-1 p-2 bg-muted/50 font-medium rounded-md">Materials</div>
                    <div className="col-span-1 p-2 bg-blue-500/5 rounded-md text-center">Educational</div>
                    <div className="col-span-1 p-2 bg-purple-500/5 rounded-md text-center">Mixed</div>
                    <div className="col-span-1 p-2 bg-orange-500/5 rounded-md text-center">Authentic</div>
                    
                    <div className="col-span-1 p-2 bg-muted/50 font-medium rounded-md">Subtitles</div>
                    <div className="col-span-1 p-2 bg-blue-500/5 rounded-md text-center">Always</div>
                    <div className="col-span-1 p-2 bg-purple-500/5 rounded-md text-center">Sometimes</div>
                    <div className="col-span-1 p-2 bg-orange-500/5 rounded-md text-center">Rarely</div>
                    
                    <div className="col-span-1 p-2 bg-muted/50 font-medium rounded-md">Focus</div>
                    <div className="col-span-1 p-2 bg-blue-500/5 rounded-md text-center">Main ideas</div>
                    <div className="col-span-1 p-2 bg-purple-500/5 rounded-md text-center">Details</div>
                    <div className="col-span-1 p-2 bg-orange-500/5 rounded-md text-center">Nuance</div>
                    
                    <div className="col-span-1 p-2 bg-muted/50 font-medium rounded-md">Accents</div>
                    <div className="col-span-1 p-2 bg-blue-500/5 rounded-md text-center">Standard</div>
                    <div className="col-span-1 p-2 bg-purple-500/5 rounded-md text-center">Few varieties</div>
                    <div className="col-span-1 p-2 bg-orange-500/5 rounded-md text-center">Multiple</div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}