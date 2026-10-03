/**
 * Comprehensive Help System - Tooltips, tours, and contextual help
 */

'use client';

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { 
  HelpCircle, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Book, 
  Video, 
  ExternalLink,
  Search,
  Star,
  MessageCircle,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// Types
export interface HelpItem {
  id: string;
  title: string;
  content: string;
  category: 'getting-started' | 'features' | 'troubleshooting' | 'advanced';
  tags: string[];
  priority: number;
  videoUrl?: string;
  relatedItems?: string[];
}

export interface TourStep {
  id: string;
  title: string;
  content: string;
  target: string; // CSS selector
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'focus' | 'none';
  skippable?: boolean;
}

export interface Tour {
  id: string;
  name: string;
  description: string;
  steps: TourStep[];
  category: string;
  autoStart?: boolean;
}

// Context
interface HelpContextType {
  isHelpOpen: boolean;
  openHelp: () => void;
  closeHelp: () => void;
  startTour: (tourId: string) => void;
  showTooltip: (content: string, target: Element) => void;
  hideTooltip: () => void;
}

const HelpContext = createContext<HelpContextType | null>(null);

// Hook
export const useHelp = () => {
  const context = useContext(HelpContext);
  if (!context) {
    throw new Error('useHelp must be used within a HelpProvider');
  }
  return context;
};

// Sample help data
const HELP_ITEMS: HelpItem[] = [
  {
    id: 'getting-started-overview',
    title: 'Getting Started with ExamGuard',
    content: 'Learn the basics of using ExamGuard to manage examinations, from creating exam plans to generating reports.',
    category: 'getting-started',
    tags: ['basics', 'overview', 'introduction'],
    priority: 1
  },
  {
    id: 'create-exam-plan',
    title: 'How to Create an Exam Plan',
    content: 'Step-by-step guide to creating a comprehensive exam plan with dates, sessions, and course assignments.',
    category: 'features',
    tags: ['exam', 'plan', 'create', 'schedule'],
    priority: 2,
    videoUrl: '/videos/create-exam-plan.mp4'
  },
  {
    id: 'manage-students',
    title: 'Student Management',
    content: 'Learn how to add, edit, and manage student records, including bulk imports and data validation.',
    category: 'features',
    tags: ['students', 'management', 'bulk', 'import'],
    priority: 2,
    relatedItems: ['bulk-import-csv', 'student-validation']
  },
  {
    id: 'seating-arrangement',
    title: 'Creating Seating Arrangements',
    content: 'Automatically generate seating arrangements using our intelligent algorithms that prevent conflicts.',
    category: 'features',
    tags: ['seating', 'arrangement', 'algorithm', 'room'],
    priority: 2
  },
  {
    id: 'invigilator-assignment',
    title: 'Assigning Invigilators',
    content: 'Use Engine3 to automatically assign invigilators based on availability, workload, and preferences.',
    category: 'features',
    tags: ['invigilator', 'assignment', 'engine3', 'availability'],
    priority: 2
  },
  {
    id: 'troubleshoot-login',
    title: 'Login Issues',
    content: 'Common solutions for login problems including password reset, account lockout, and browser compatibility.',
    category: 'troubleshooting',
    tags: ['login', 'password', 'reset', 'browser'],
    priority: 3
  },
  {
    id: 'bulk-import-csv',
    title: 'Bulk Import via CSV',
    content: 'Import large amounts of data using CSV files. Includes template downloads and validation rules.',
    category: 'advanced',
    tags: ['csv', 'import', 'bulk', 'template'],
    priority: 3,
    relatedItems: ['manage-students']
  }
];

const TOURS: Tour[] = [
  {
    id: 'dashboard-tour',
    name: 'Dashboard Overview',
    description: 'Get familiar with the main dashboard and navigation',
    category: 'getting-started',
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to ExamGuard!',
        content: 'Let\'s take a quick tour of the main features to get you started.',
        target: 'body',
        position: 'center'
      },
      {
        id: 'sidebar',
        title: 'Navigation Sidebar',
        content: 'Use this sidebar to navigate between different sections of the application.',
        target: 'aside',
        position: 'right'
      },
      {
        id: 'dashboard-cards',
        title: 'Dashboard Overview',
        content: 'These cards show key statistics and quick access to important functions.',
        target: '.dashboard-stats',
        position: 'bottom'
      }
    ]
  },
  {
    id: 'exam-creation-tour',
    name: 'Creating Your First Exam',
    description: 'Learn how to create and schedule an examination',
    category: 'features',
    steps: [
      {
        id: 'plans-nav',
        title: 'Exam Plans',
        content: 'Click here to start creating your exam plan.',
        target: 'a[href="/plans"]',
        position: 'right',
        action: 'click'
      },
      {
        id: 'create-plan',
        title: 'Create New Plan',
        content: 'Click the "New Plan" button to start creating your exam schedule.',
        target: '.create-plan-btn',
        position: 'bottom',
        action: 'click'
      }
    ]
  }
];

// Tooltip Component
interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const HelpTooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  side = 'top',
  className 
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent side={side} className={cn('max-w-xs', className)}>
        <p className="text-sm">{content}</p>
      </PopoverContent>
    </Popover>
  );
};

// Help Button Component
export const HelpButton: React.FC<{
  content?: string;
  tourId?: string;
  className?: string;
}> = ({ content, tourId, className }) => {
  const { openHelp, startTour } = useHelp();

  const handleClick = () => {
    if (tourId) {
      startTour(tourId);
    } else {
      openHelp();
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={cn('text-muted-foreground hover:text-foreground', className)}
      title={content || 'Get help'}
    >
      <HelpCircle className="h-4 w-4" />
    </Button>
  );
};

// Tour Component
interface TourProps {
  tour: Tour;
  isActive: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const TourOverlay: React.FC<TourProps> = ({ tour, isActive, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<Element | null>(null);

  useEffect(() => {
    if (!isActive || currentStep >= tour.steps.length) return;

    const step = tour.steps[currentStep];
    const element = step.target === 'body' ? document.body : document.querySelector(step.target);
    
    if (element) {
      setTargetElement(element);
      // Scroll element into view
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Highlight element
      element.classList.add('tour-highlight');
    }

    return () => {
      if (element) {
        element.classList.remove('tour-highlight');
      }
    };
  }, [currentStep, isActive, tour.steps]);

  if (!isActive || currentStep >= tour.steps.length) return null;

  const step = tour.steps[currentStep];
  const isLastStep = currentStep === tour.steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <Card className="max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-lg">{step.title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {tour.steps.length}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">{step.content}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button size="sm" onClick={handleNext}>
                {isLastStep ? 'Finish' : 'Next'}
                {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
              </Button>
            </div>
            
            {step.skippable !== false && (
              <Button variant="ghost" size="sm" onClick={handleSkip}>
                Skip Tour
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Main Help Dialog
interface HelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpDialog: React.FC<HelpDialogProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<HelpItem | null>(null);

  const filteredItems = HELP_ITEMS.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => a.priority - b.priority);

  const categories = [
    { id: 'all', label: 'All Topics' },
    { id: 'getting-started', label: 'Getting Started' },
    { id: 'features', label: 'Features' },
    { id: 'troubleshooting', label: 'Troubleshooting' },
    { id: 'advanced', label: 'Advanced' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Book className="h-5 w-5" />
            ExamGuard Help Center
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-1/3 border-r pr-4 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search help topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Categories */}
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="grid grid-cols-2 gap-1">
                {categories.slice(0, 4).map(category => (
                  <TabsTrigger key={category.id} value={category.id} className="text-xs">
                    {category.label.replace(' ', '\n')}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Help Items List */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredItems.map(item => (
                <Card
                  key={item.id}
                  className={cn(
                    'p-3 cursor-pointer transition-colors hover:bg-muted/50',
                    selectedItem?.id === item.id && 'bg-muted'
                  )}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="space-y-1">
                    <div className="flex items-start justify-between">
                      <h4 className="text-sm font-medium line-clamp-2">{item.title}</h4>
                      {item.videoUrl && <Video className="h-3 w-3 text-blue-500 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{item.content}</p>
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 pl-6 overflow-y-auto">
            {selectedItem ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{selectedItem.title}</h2>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline">{selectedItem.category.replace('-', ' ')}</Badge>
                    {selectedItem.videoUrl && (
                      <Badge variant="outline" className="text-blue-600">
                        <Video className="h-3 w-3 mr-1" />
                        Video Available
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="prose prose-sm max-w-none">
                  <p>{selectedItem.content}</p>
                </div>

                {selectedItem.videoUrl && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Video Tutorial</h4>
                          <p className="text-sm text-muted-foreground">
                            Watch a step-by-step video guide
                          </p>
                        </div>
                        <Button size="sm">
                          <Video className="h-4 w-4 mr-2" />
                          Watch Video
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedItem.relatedItems && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Related Topics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {selectedItem.relatedItems.map(relatedId => {
                        const relatedItem = HELP_ITEMS.find(item => item.id === relatedId);
                        if (!relatedItem) return null;
                        
                        return (
                          <button
                            key={relatedId}
                            onClick={() => setSelectedItem(relatedItem)}
                            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                          >
                            <ArrowRight className="h-3 w-3 mr-1" />
                            {relatedItem.title}
                          </button>
                        );
                      })}
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Was this helpful?</h4>
                        <p className="text-sm text-muted-foreground">
                          Let us know how we can improve
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Star className="h-4 w-4 mr-1" />
                          Yes
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Feedback
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Book className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a Help Topic</h3>
                <p className="text-muted-foreground">
                  Choose a topic from the sidebar to view detailed help information.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Help Provider Component
export const HelpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [activeTour, setActiveTour] = useState<Tour | null>(null);

  const openHelp = useCallback(() => setIsHelpOpen(true), []);
  const closeHelp = useCallback(() => setIsHelpOpen(false), []);

  const startTour = useCallback((tourId: string) => {
    const tour = TOURS.find(t => t.id === tourId);
    if (tour) {
      setActiveTour(tour);
    }
  }, []);

  const closeTour = useCallback(() => setActiveTour(null), []);

  const showTooltip = useCallback((content: string, target: Element) => {
    // Implementation for dynamic tooltips
    console.log('Show tooltip:', content, target);
  }, []);

  const hideTooltip = useCallback(() => {
    // Implementation for hiding tooltips
    console.log('Hide tooltip');
  }, []);

  return (
    <HelpContext.Provider
      value={{
        isHelpOpen,
        openHelp,
        closeHelp,
        startTour,
        showTooltip,
        hideTooltip
      }}
    >
      {children}
      <HelpDialog isOpen={isHelpOpen} onClose={closeHelp} />
      {activeTour && (
        <TourOverlay
          tour={activeTour}
          isActive={true}
          onClose={closeTour}
          onComplete={closeTour}
        />
      )}
    </HelpContext.Provider>
  );
};