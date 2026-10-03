'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { UserCheck, Clock, MapPin, Calendar, Download } from 'lucide-react';

interface InvigilatorDuty {
  id: number;
  invigilator_name: string;
  faculty_id: string;
  department: string;
  exam_name: string;
  exam_date: string;
  exam_time: string;
  room_number: string;
  building: string;
  duty_type: 'CHIEF' | 'ASSISTANT' | 'RELIEF';
  status: 'ASSIGNED' | 'CONFIRMED' | 'COMPLETED';
}

export default function InvigilatorsPage() {
  const { user } = useAuth();
  const [duties, setDuties] = useState<InvigilatorDuty[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInvigilatorDuties();
  }, []);

  const fetchInvigilatorDuties = async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockData: InvigilatorDuty[] = [
      {
        id: 1,
        invigilator_name: 'Dr. Rajesh Kumar',
        faculty_id: 'FAC001',
        department: 'Computer Science',
        exam_name: 'Data Structures - ISA1',
        exam_date: '2024-12-15',
        exam_time: '09:00 AM - 11:00 AM',
        room_number: '101',
        building: 'Main Block',
        duty_type: 'CHIEF',
        status: 'CONFIRMED'
      },
      {
        id: 2,
        invigilator_name: 'Prof. Sneha Patil',
        faculty_id: 'FAC002',
        department: 'Electronics',
        exam_name: 'Digital Electronics - ISA1',
        exam_date: '2024-12-15',
        exam_time: '09:00 AM - 11:00 AM',
        room_number: '102',
        building: 'Main Block',
        duty_type: 'CHIEF',
        status: 'CONFIRMED'
      },
      {
        id: 3,
        invigilator_name: 'Dr. Amit Sharma',
        faculty_id: 'FAC003',
        department: 'Mechanical',
        exam_name: 'Data Structures - ISA1',
        exam_date: '2024-12-15',
        exam_time: '09:00 AM - 11:00 AM',
        room_number: '101',
        building: 'Main Block',
        duty_type: 'ASSISTANT',
        status: 'ASSIGNED'
      },
      {
        id: 4,
        invigilator_name: 'Ms. Priya Desai',
        faculty_id: 'FAC004',
        department: 'Civil',
        exam_name: 'Database Systems - ISA1',
        exam_date: '2024-12-16',
        exam_time: '02:00 PM - 04:00 PM',
        room_number: '201',
        building: 'Science Block',
        duty_type: 'CHIEF',
        status: 'ASSIGNED'
      },
      {
        id: 5,
        invigilator_name: 'Dr. Vikram Singh',
        faculty_id: 'FAC005',
        department: 'Computer Science',
        exam_name: 'Database Systems - ISA1',
        exam_date: '2024-12-16',
        exam_time: '02:00 PM - 04:00 PM',
        room_number: '201',
        building: 'Science Block',
        duty_type: 'RELIEF',
        status: 'ASSIGNED'
      }
    ];
    
    setDuties(mockData);
    setLoading(false);
  };

  const filteredDuties = duties.filter(duty => {
    const matchesFilter = filter === 'ALL' || duty.status === filter;
    const matchesSearch = 
      duty.invigilator_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      duty.faculty_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      duty.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const handleConfirmDuty = (id: number) => {
    setDuties(duties.map(d => 
      d.id === id ? { ...d, status: 'CONFIRMED' as const } : d
    ));
  };

  const handleExportSchedule = () => {
    alert('Exporting invigilator schedule as PDF...');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statusColors = {
    ASSIGNED: 'kle-status-warning',
    CONFIRMED: 'kle-status-success',
    COMPLETED: 'bg-gray-100 text-gray-600'
  };

  const dutyTypeColors = {
    CHIEF: 'bg-primary-light text-primary',
    ASSISTANT: 'bg-gray-100 text-gray-800',
    RELIEF: 'bg-gray-100 text-gray-600'
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text">Invigilator Duties</h1>
          <p className="text-text-muted mt-1">Manage examination invigilation assignments</p>
        </div>
        {(user?.role === 'ADMIN' || user?.role === 'EXAM_CELL') && (
          <Button variant="primary" onClick={handleExportSchedule}>
            <Download className="w-4 h-4 mr-2" />
            Export Schedule
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="!p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Total Duties</p>
              <p className="text-3xl font-bold text-text">{duties.length}</p>
            </div>
            <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="!p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Confirmed</p>
              <p className="text-3xl font-bold text-success">
                {duties.filter(d => d.status === 'CONFIRMED').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="!p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Pending</p>
              <p className="text-3xl font-bold text-warning">
                {duties.filter(d => d.status === 'ASSIGNED').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-warning" />
            </div>
          </div>
        </Card>

        <Card className="!p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Chief Invigilators</p>
              <p className="text-3xl font-bold text-text">
                {duties.filter(d => d.duty_type === 'CHIEF').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search by name, faculty ID, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          {['ALL', 'ASSIGNED', 'CONFIRMED', 'COMPLETED'].map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter(status)}
            >
              {status === 'ALL' ? 'All Duties' : status}
            </Button>
          ))}
        </div>
      </div>

      {/* Duties List */}
      <div className="grid gap-4">
        {filteredDuties.length === 0 ? (
          <Card>
            <p className="text-center text-text-muted py-8">
              {searchTerm
                ? 'No duties found matching your search.'
                : 'No invigilator duties found for the selected filter.'}
            </p>
          </Card>
        ) : (
          filteredDuties.map((duty) => (
            <Card key={duty.id}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-text">
                      {duty.invigilator_name}
                    </h3>
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                      {duty.faculty_id}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${dutyTypeColors[duty.duty_type]}`}>
                      {duty.duty_type}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${statusColors[duty.status]}`}>
                      {duty.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-text-muted mb-3">{duty.department} Department</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="font-medium text-text">{duty.exam_name}</p>
                      <div className="flex items-center gap-2 text-text-muted mt-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(duty.exam_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-text-muted">
                        <Clock className="w-4 h-4" />
                        <span>{duty.exam_time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-text-muted mt-1">
                        <MapPin className="w-4 h-4" />
                        <span>Room {duty.room_number}, {duty.building}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {duty.status === 'ASSIGNED' && user?.role === 'FACULTY' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleConfirmDuty(duty.id)}
                  >
                    Confirm Duty
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-primary-light rounded-lg border border-primary/20">
        <h3 className="font-semibold text-primary mb-2">📋 Duty Types</h3>
        <ul className="text-sm text-text space-y-1">
          <li>• <strong>Chief Invigilator:</strong> Primary person responsible for the exam hall</li>
          <li>• <strong>Assistant Invigilator:</strong> Supports the chief invigilator during the exam</li>
          <li>• <strong>Relief Invigilator:</strong> Available for breaks and emergency coverage</li>
          <li>• Faculty members receive duty notifications via email and can confirm online</li>
        </ul>
      </div>
    </div>
  );
}
