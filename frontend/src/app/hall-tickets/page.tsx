'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { CreditCard, Download, User, Calendar, CheckCircle } from 'lucide-react';

interface HallTicket {
  id: number;
  student_usn: string;
  student_name: string;
  branch: string;
  semester: number;
  exam_name: string;
  exam_dates: string;
  total_courses: number;
  photo_verified: boolean;
  status: 'DRAFT' | 'GENERATED' | 'DOWNLOADED';
}

export default function HallTicketsPage() {
  const { user } = useAuth();
  const [hallTickets, setHallTickets] = useState<HallTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchHallTickets();
  }, []);

  const fetchHallTickets = async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockData: HallTicket[] = [
      {
        id: 1,
        student_usn: '4NI21CS001',
        student_name: 'Aarav Kumar',
        branch: 'CSE',
        semester: 5,
        exam_name: 'ISA-1 December 2024',
        exam_dates: 'Dec 15 - Dec 20, 2024',
        total_courses: 6,
        photo_verified: true,
        status: 'GENERATED'
      },
      {
        id: 2,
        student_usn: '4NI21CS002',
        student_name: 'Priya Sharma',
        branch: 'CSE',
        semester: 5,
        exam_name: 'ISA-1 December 2024',
        exam_dates: 'Dec 15 - Dec 20, 2024',
        total_courses: 6,
        photo_verified: true,
        status: 'DOWNLOADED'
      },
      {
        id: 3,
        student_usn: '4NI21EC015',
        student_name: 'Rahul Patil',
        branch: 'ECE',
        semester: 3,
        exam_name: 'ISA-1 December 2024',
        exam_dates: 'Dec 15 - Dec 20, 2024',
        total_courses: 5,
        photo_verified: false,
        status: 'DRAFT'
      },
      {
        id: 4,
        student_usn: '4NI21ME025',
        student_name: 'Sneha Desai',
        branch: 'ME',
        semester: 7,
        exam_name: 'ISA-1 December 2024',
        exam_dates: 'Dec 15 - Dec 20, 2024',
        total_courses: 4,
        photo_verified: true,
        status: 'GENERATED'
      },
      {
        id: 5,
        student_usn: '4NI21CS050',
        student_name: 'Vikram Singh',
        branch: 'CSE',
        semester: 5,
        exam_name: 'ISA-1 December 2024',
        exam_dates: 'Dec 15 - Dec 20, 2024',
        total_courses: 6,
        photo_verified: true,
        status: 'GENERATED'
      }
    ];
    
    setHallTickets(mockData);
    setLoading(false);
  };

  const filteredTickets = hallTickets.filter(ticket => {
    const matchesFilter = filter === 'ALL' || ticket.status === filter;
    const matchesSearch = 
      ticket.student_usn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.branch.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const handleDownload = (ticket: HallTicket) => {
    setHallTickets(hallTickets.map(t => 
      t.id === ticket.id ? { ...t, status: 'DOWNLOADED' as const } : t
    ));
    alert(`Downloading hall ticket for ${ticket.student_name} (${ticket.student_usn})...`);
  };

  const handleGenerateAll = () => {
    alert('Generating all hall tickets...');
  };

  const handleBulkDownload = () => {
    alert('Downloading all hall tickets as ZIP...');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statusColors = {
    DRAFT: 'bg-gray-100 text-gray-600',
    GENERATED: 'kle-status-success',
    DOWNLOADED: 'bg-primary-light text-primary'
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text">Hall Tickets</h1>
          <p className="text-text-muted mt-1">Generate and manage examination hall tickets</p>
        </div>
        {(user?.role === 'ADMIN' || user?.role === 'EXAM_CELL') && (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleBulkDownload}>
              <Download className="w-4 h-4 mr-2" />
              Bulk Download
            </Button>
            <Button variant="primary" onClick={handleGenerateAll}>
              Generate All
            </Button>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="!p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Total Students</p>
              <p className="text-3xl font-bold text-text">{hallTickets.length}</p>
            </div>
            <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="!p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Generated</p>
              <p className="text-3xl font-bold text-success">
                {hallTickets.filter(t => t.status === 'GENERATED' || t.status === 'DOWNLOADED').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="!p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Downloaded</p>
              <p className="text-3xl font-bold text-primary">
                {hallTickets.filter(t => t.status === 'DOWNLOADED').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
              <Download className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="!p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Photo Verified</p>
              <p className="text-3xl font-bold text-success">
                {hallTickets.filter(t => t.photo_verified).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search by USN, name, or branch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          {['ALL', 'DRAFT', 'GENERATED', 'DOWNLOADED'].map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter(status)}
            >
              {status === 'ALL' ? 'All Tickets' : status}
            </Button>
          ))}
        </div>
      </div>

      {/* Hall Tickets List */}
      <div className="grid gap-4">
        {filteredTickets.length === 0 ? (
          <Card>
            <p className="text-center text-text-muted py-8">
              {searchTerm
                ? 'No hall tickets found matching your search.'
                : 'No hall tickets found for the selected filter.'}
            </p>
          </Card>
        ) : (
          filteredTickets.map((ticket) => (
            <Card key={ticket.id}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-text">
                      {ticket.student_usn}
                    </h3>
                    <span className="px-2 py-1 text-xs font-medium bg-primary-light text-primary rounded">
                      {ticket.branch}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                      Sem {ticket.semester}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${statusColors[ticket.status]}`}>
                      {ticket.status}
                    </span>
                    {ticket.photo_verified && (
                      <CheckCircle className="w-5 h-5 text-success" />
                    )}
                  </div>
                  
                  <p className="text-text font-medium mb-3">{ticket.student_name}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-text-muted">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      <span>{ticket.exam_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{ticket.exam_dates}</span>
                    </div>
                    <div>
                      <span>{ticket.total_courses} courses enrolled</span>
                    </div>
                  </div>

                  {!ticket.photo_verified && (
                    <div className="mt-2 text-xs text-warning">
                      ⚠️ Photo verification pending
                    </div>
                  )}
                </div>

                {ticket.status !== 'DRAFT' && (
                  <Button
                    variant={ticket.status === 'DOWNLOADED' ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={() => handleDownload(ticket)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {ticket.status === 'DOWNLOADED' ? 'Re-download' : 'Download'}
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-primary-light rounded-lg border border-primary/20">
        <h3 className="font-semibold text-primary mb-2">🎫 Hall Ticket Information</h3>
        <ul className="text-sm text-text space-y-1">
          <li>• Hall tickets are generated after seating arrangements are finalized</li>
          <li>• Students can download their hall tickets from the student portal</li>
          <li>• Hall tickets contain exam schedule, room allocation, and important instructions</li>
          <li>• Student photo verification must be completed before generation</li>
          <li>• Bulk download available for exam coordinators and administrators</li>
        </ul>
      </div>
    </div>
  );
}
