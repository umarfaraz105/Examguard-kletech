'use client';

import React, { useState } from 'react';
import { 
  Book,
  Video, 
  Search,
  Play,
  ArrowRight,
  Star,
  MessageCircle,
  HelpCircle,
  Lightbulb,
  Users,
  Clock,
  CheckCircle,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HelpButton, HelpTooltip, useHelp } from '@/components/help/HelpSystem';

// Sample tour data - this would normally come from the HelpSystem
const AVAILABLE_TOURS = [
  {
    id: 'dashboard-tour',
    name: 'Dashboard Overview',
    description: 'Get familiar with the main dashboard and navigation features',
    category: 'Getting Started',
    duration: '3 minutes',
    steps: 4,
    icon: <Users className="w-5 h-5" />
  },
  {
    id: 'exam-creation-tour',
    name: 'Creating Your First Exam',
    description: 'Learn how to create and schedule an examination from start to finish',
    category: 'Core Features',
    duration: '5 minutes',
    steps: 7,
    icon: <Book className="w-5 h-5" />
  },
  {
    id: 'seating-tour',
    name: 'Seating Arrangement Guide',
    description: 'Automatically generate optimal seating arrangements for your exams',
    category: 'Advanced Features',
    duration: '4 minutes',
    steps: 6,
    icon: <CheckCircle className="w-5 h-5" />
  }
];

const HELP_CATEGORIES = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'Essential guides to begin using ExamGuard',
    icon: <Lightbulb className="w-6 h-6 text-yellow-500" />,
    count: 8
  },
  {
    id: 'features',
    name: 'Core Features',
    description: 'Learn about exam planning, student management, and more',
    icon: <Book className="w-6 h-6 text-blue-500" />,
    count: 15
  },
  {
    id: 'troubleshooting',
    name: 'Troubleshooting',
    description: 'Common issues and their solutions',
    icon: <HelpCircle className="w-6 h-6 text-red-500" />,
    count: 12
  },
  {
    id: 'advanced',
    name: 'Advanced Topics',
    description: 'Advanced features and customization options',
    icon: <Star className="w-6 h-6 text-purple-500" />,
    count: 9
  }
];

const QUICK_ACTIONS = [
  {
    title: 'Create Exam Plan',
    description: 'Step-by-step guide to creating your first exam',
    action: () => window.location.href = '/plans',
    icon: <Calendar className="w-5 h-5" />,
    badge: 'Popular'
  },
  {
    title: 'Import Students',
    description: 'Bulk import student data via CSV',
    action: () => window.location.href = '/students',
    icon: <Users className="w-5 h-5" />,
    badge: 'Essential'
  },
  {
    title: 'Generate Seating',
    description: 'Create intelligent seating arrangements',
    action: () => window.location.href = '/seating',
    icon: <CheckCircle className="w-5 h-5" />,
    badge: 'New'
  }
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { openHelp, startTour } = useHelp();

  const handleStartTour = (tourId: string) => {
    startTour(tourId);
  };

  const handleSearchHelp = () => {
    if (searchQuery.trim()) {
      openHelp();
    }
  };

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Book className="w-8 h-8 text-primary-500" />
            <h1 className="text-4xl font-bold text-gray-900">Help & Documentation</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get the most out of ExamGuard with our comprehensive guides, tutorials, and interactive tours.
          </p>
        </div>

        {/* Search Bar */}
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search help topics, tutorials, or ask a question..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-base"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchHelp()}
                />
              </div>
              <Button onClick={handleSearchHelp} className="px-6">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Tours */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Play className="w-6 h-6 text-primary-500" />
            <h2 className="text-2xl font-semibold text-gray-900">Interactive Tours</h2>
            <Badge variant="outline" className="text-primary-500 border-primary-500">
              Recommended
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {AVAILABLE_TOURS.map((tour) => (
              <Card key={tour.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary-50 rounded-lg text-primary-500">
                        {tour.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg font-medium">{tour.name}</CardTitle>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {tour.duration}
                          </span>
                          <span>{tour.steps} steps</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 text-sm leading-relaxed">{tour.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{tour.category}</Badge>
                    <Button 
                      size="sm" 
                      onClick={() => handleStartTour(tour.id)}
                      className="group-hover:bg-primary-600 transition-colors"
                    >
                      Start Tour
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Help Categories */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Book className="w-6 h-6 text-primary-500" />
            <h2 className="text-2xl font-semibold text-gray-900">Browse by Category</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HELP_CATEGORIES.map((category) => (
              <Card 
                key={category.id} 
                className="hover:shadow-md transition-shadow cursor-pointer group"
                onClick={openHelp}
              >
                <CardContent className="p-6 text-center space-y-4">
                  <div className="flex justify-center">
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                    <Badge variant="outline" className="text-xs">
                      {category.count} articles
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <ArrowRight className="w-6 h-6 text-primary-500" />
            <h2 className="text-2xl font-semibold text-gray-900">Quick Actions</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {QUICK_ACTIONS.map((action, index) => (
              <Card 
                key={index} 
                className="hover:shadow-md transition-shadow cursor-pointer group"
                onClick={action.action}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {action.icon}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {action.badge}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{action.description}</p>
                  <Button variant="outline" size="sm" className="w-full group-hover:bg-primary-50 group-hover:border-primary-200 group-hover:text-primary-600 transition-colors">
                    Get Started
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Help Components Demo */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="w-6 h-6 text-primary-500" />
            <h2 className="text-2xl font-semibold text-gray-900">Help Components Demo</h2>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Interactive Help Elements</CardTitle>
              <p className="text-gray-600">Try out the different help components available throughout the application.</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="buttons" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="buttons">Help Buttons</TabsTrigger>
                  <TabsTrigger value="tooltips">Tooltips</TabsTrigger>
                </TabsList>
                <TabsContent value="buttons" className="space-y-4">
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">Different styles of help buttons you'll find throughout the application:</p>
                    <div className="flex flex-wrap gap-4">
                      <HelpButton content="This opens the main help dialog" />
                      <HelpButton 
                        tourId="dashboard-tour" 
                        content="This starts a specific tour"
                        className="bg-primary-50 text-primary-600 hover:bg-primary-100"
                      />
                      <Button variant="outline" size="sm">
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Custom Help Button
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="tooltips" className="space-y-4">
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">Hover over these elements to see contextual help tooltips:</p>
                    <div className="flex flex-wrap gap-4">
                      <HelpTooltip content="This tooltip explains exam plan creation in detail">
                        <Button variant="outline">Exam Plans</Button>
                      </HelpTooltip>
                      <HelpTooltip content="Student management features including bulk import and data validation" side="bottom">
                        <Button variant="outline">Students</Button>
                      </HelpTooltip>
                      <HelpTooltip content="Automatic seating arrangement using intelligent algorithms" side="left">
                        <Button variant="outline">Seating</Button>
                      </HelpTooltip>
                      <HelpTooltip content="Invigilator assignment with workload balancing" side="right">
                        <Button variant="outline">Invigilators</Button>
                      </HelpTooltip>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </section>

        {/* Contact Support */}
        <Card className="bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
          <CardContent className="p-8 text-center">
            <MessageCircle className="w-12 h-12 text-primary-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Still Need Help?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Can't find what you're looking for? Our support team is here to help you get the most out of ExamGuard.
            </p>
            <div className="flex gap-4 justify-center">
              <Button className="gap-2">
                <MessageCircle className="w-4 h-4" />
                Contact Support
              </Button>
              <Button variant="outline" className="gap-2">
                <Video className="w-4 h-4" />
                Schedule Demo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

