'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { HelpButton } from '@/components/help/HelpSystem';
import { Users, MapPin, Calendar, Download } from 'lucide-react';

interface SeatingArrangement {
  id: number;
  plan_name: string;
  exam_date: string;
  room_number: string;
  building: string;
  total_seats: number;
  assigned_seats: number;
  status: 'PENDING' | 'COMPLETED' | 'PUBLISHED';
}

export default function SeatingPage() {
  const { user } = useAuth();
  const [arrangements, setArrangements] = useState<SeatingArrangement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchSeatingArrangements();
  }, []);

  const fetchSeatingArrangements = async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockData: SeatingArrangement[] = [
      {
        id: 1,
        plan_name: 'ISA-1 December 2024',
        exam_date: '2024-12-15',
        room_number: '101',
        building: 'Main Block',
        total_seats: 60,
        assigned_seats: 58,
        status: 'COMPLETED'
      },
      {
        id: 2,
        plan_name: 'ISA-1 December 2024',
        exam_date: '2024-12-16',
        room_number: '102',
        building: 'Main Block',
        total_seats: 50,
        assigned_seats: 50,
        status: 'COMPLETED'
      },
      {
        id: 3,
        plan_name: 'ISA-1 December 2024',
        exam_date: '2024-12-17',
        room_number: '201',
        building: 'Science Block',
        total_seats: 40,
        assigned_seats: 35,
        status: 'PENDING'
      },
      {
        id: 4,
        plan_name: 'ESA May 2025',
        exam_date: '2025-05-10',
        room_number: '301',
        building: 'Engineering Block',
        total_seats: 70,
        assigned_seats: 0,
        status: 'PENDING'
      }
    ];
    
    setArrangements(mockData);
    setLoading(false);
  };

  const filteredArrangements = arrangements.filter(arr => {
    if (filter === 'ALL') return true;
    return arr.status === filter;
  });

  const handleExportSeating = (id: number) => {
    alert(`Exporting seating arrangement #${id} as PDF...`);
  };

  const handleViewLayout = (id: number) => {
    alert(`Opening seating layout for arrangement #${id}...`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statusColors = {
    PENDING: 'kle-status-warning',
    COMPLETED: 'kle-status-success',
    PUBLISHED: 'bg-primary-light text-primary'
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-text">Halls & Seating Arrangements</h1>
          <HelpButton 
            content="Learn how to generate and manage seating arrangements"
            tourId="seating-tour"
            className="text-gray-400 hover:text-primary-500"
          />
        </div>
        <p className="text-text-muted mt-1">Manage exam hall seating arrangements</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="!p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Total Arrangements</p>
              <p className="text-3xl font-bold text-text">{arrangements.length}</p>
            </div>
            <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="!p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Total Seats</p>
              <p className="text-3xl font-bold text-text">
                {arrangements.reduce((sum, arr) => sum + arr.total_seats, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="!p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Assigned</p>
              <p className="text-3xl font-bold text-success">
                {arrangements.reduce((sum, arr) => sum + arr.assigned_seats, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="!p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Pending</p>
              <p className="text-3xl font-bold text-warning">
                {arrangements.filter(a => a.status === 'PENDING').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-warning" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-3 mb-6">
        {['ALL', 'PENDING', 'COMPLETED', 'PUBLISHED'].map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter(status)}
          >
            {status === 'ALL' ? 'All Arrangements' : status}
          </Button>
        ))}
      </div>

      {/* Seating Arrangements Grid */}
      <div className="grid gap-4">
        {filteredArrangements.length === 0 ? (
          <Card>
            <p className="text-center text-text-muted py-8">
              No seating arrangements found for the selected filter.
            </p>
          </Card>
        ) : (
          filteredArrangements.map((arrangement) => (
            <Card key={arrangement.id}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-text">
                      {arrangement.plan_name}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${statusColors[arrangement.status]}`}>
                      {arrangement.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-text-muted">
                      <MapPin className="w-4 h-4" />
                      <span>Room {arrangement.room_number}, {arrangement.building}</span>
                    </div>
                    <div className="flex items-center gap-2 text-text-muted">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(arrangement.exam_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-text-muted">
                      <Users className="w-4 h-4" />
                      <span>
                        {arrangement.assigned_seats} / {arrangement.total_seats} seats assigned
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(arrangement.assigned_seats / arrangement.total_seats) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-text-muted mt-1">
                      {Math.round((arrangement.assigned_seats / arrangement.total_seats) * 100)}% filled
                    </p>
                  </div>
                </div>

                {(user?.role === 'ADMIN' || user?.role === 'EXAM_CELL') && (
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleViewLayout(arrangement.id)}
                    >
                      View Layout
                    </Button>
                    {arrangement.status === 'COMPLETED' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleExportSeating(arrangement.id)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Export
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-primary-light rounded-lg border border-primary/20">
        <h3 className="font-semibold text-primary mb-2">💡 Seating Arrangement Info</h3>
        <ul className="text-sm text-text space-y-1">
          <li>• Seating arrangements are generated automatically based on exam schedules</li>
          <li>• Students are assigned seats following social distancing and clash prevention rules</li>
          <li>• Export seating plans as PDF for printing and distribution</li>
          <li>• View detailed room layouts with bench-wise student allocation</li>
        </ul>
      </div>
    </div>
  );
}
