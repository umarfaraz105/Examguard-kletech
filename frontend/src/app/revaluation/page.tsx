'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { FileSearch, Clock, CheckCircle, XCircle, Calendar } from 'lucide-react';

interface RevaluationRequest {
  id: number;
  student_usn: string;
  student_name: string;
  course_code: string;
  course_name: string;
  exam_type: string;
  original_marks: number;
  revalued_marks: number | null;
  request_date: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
  reason?: string;
  payment_status: 'PAID' | 'PENDING';
}

export default function RevaluationPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<RevaluationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRequestForm, setShowRequestForm] = useState(false);

  useEffect(() => {
    fetchRevaluationRequests();
  }, []);

  const fetchRevaluationRequests = async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockData: RevaluationRequest[] = [
      {
        id: 1,
        student_usn: '4NI21CS001',
        student_name: 'Aarav Kumar',
        course_code: 'CS301',
        course_name: 'Data Structures',
        exam_type: 'ISA1',
        original_marks: 28,
        revalued_marks: 32,
        request_date: '2024-12-22',
        status: 'COMPLETED',
        reason: 'Felt some questions were not properly evaluated',
        payment_status: 'PAID'
      },
      {
        id: 2,
        student_usn: '4NI21CS002',
        student_name: 'Priya Sharma',
        course_code: 'CS302',
        course_name: 'Database Systems',
        exam_type: 'ISA1',
        original_marks: 25,
        revalued_marks: null,
        request_date: '2024-12-23',
        status: 'IN_PROGRESS',
        reason: 'Answer key verification',
        payment_status: 'PAID'
      },
      {
        id: 3,
        student_usn: '4NI21EC015',
        student_name: 'Rahul Patil',
        course_code: 'EC201',
        course_name: 'Digital Electronics',
        exam_type: 'ISA1',
        original_marks: 30,
        revalued_marks: null,
        request_date: '2024-12-24',
        status: 'PENDING',
        reason: 'Expected better marks',
        payment_status: 'PAID'
      },
      {
        id: 4,
        student_usn: '4NI21ME025',
        student_name: 'Sneha Desai',
        course_code: 'ME301',
        course_name: 'Thermodynamics',
        exam_type: 'ISA1',
        original_marks: 22,
        revalued_marks: 22,
        request_date: '2024-12-20',
        status: 'COMPLETED',
        reason: 'Marking seemed incorrect',
        payment_status: 'PAID'
      },
      {
        id: 5,
        student_usn: '4NI21CS050',
        student_name: 'Vikram Singh',
        course_code: 'CS303',
        course_name: 'Operating Systems',
        exam_type: 'ISA1',
        original_marks: 18,
        revalued_marks: null,
        request_date: '2024-12-25',
        status: 'PENDING',
        payment_status: 'PENDING'
      }
    ];
    
    setRequests(mockData);
    setLoading(false);
  };

  const filteredRequests = requests.filter(request => {
    const matchesFilter = filter === 'ALL' || request.status === filter;
    const matchesSearch = 
      request.student_usn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.course_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const handleNewRequest = () => {
    setShowRequestForm(true);
  };

  const handleSubmitRequest = () => {
    alert('Submitting revaluation request...');
    setShowRequestForm(false);
  };

  const handleProcessRequest = (id: number, newStatus: 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED') => {
    setRequests(requests.map(r => 
      r.id === id ? { ...r, status: newStatus } : r
    ));
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
    IN_PROGRESS: 'bg-primary-light text-primary',
    COMPLETED: 'kle-status-success',
    REJECTED: 'bg-gray-100 text-gray-600'
  };

  const totalRequests = requests.length;
  const pendingCount = requests.filter(r => r.status === 'PENDING').length;
  const inProgressCount = requests.filter(r => r.status === 'IN_PROGRESS').length;
  const completedCount = requests.filter(r => r.status === 'COMPLETED').length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text">Revaluation Requests</h1>
          <p className="text-text-muted mt-1">Manage exam revaluation and rechecking requests</p>
        </div>
        {user?.role === 'STUDENT' && (
          <Button variant="primary" onClick={handleNewRequest}>
            Request Revaluation
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="!p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Total Requests</p>
              <p className="text-3xl font-bold text-text">{totalRequests}</p>
            </div>
            <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
              <FileSearch className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="!p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Pending</p>
              <p className="text-3xl font-bold text-warning">{pendingCount}</p>
            </div>
            <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-warning" />
            </div>
          </div>
        </Card>

        <Card className="!p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">In Progress</p>
              <p className="text-3xl font-bold text-primary">{inProgressCount}</p>
            </div>
            <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
              <FileSearch className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="!p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Completed</p>
              <p className="text-3xl font-bold text-success">{completedCount}</p>
            </div>
            <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* New Request Form */}
      {showRequestForm && (
        <Card className="mb-6">
          <h2 className="text-xl font-semibold text-text mb-4">New Revaluation Request</h2>
          <form onSubmit={(e) => { e.preventDefault(); handleSubmitRequest(); }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Course Code"
                placeholder="CS301"
                required
              />
              <Input
                label="Exam Type"
                placeholder="ISA1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Reason for Revaluation
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Explain why you believe revaluation is necessary..."
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="payment_confirm"
                className="w-4 h-4 text-primary rounded focus:ring-primary"
                required
              />
              <label htmlFor="payment_confirm" className="text-sm text-text">
                I confirm payment of ₹500 revaluation fee
              </label>
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="primary">Submit Request</Button>
              <Button type="button" variant="secondary" onClick={() => setShowRequestForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search by USN, name, or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          {['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'].map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter(status)}
            >
              {status === 'ALL' ? 'All' : status.replace('_', ' ')}
            </Button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <div className="grid gap-4">
        {filteredRequests.length === 0 ? (
          <Card>
            <p className="text-center text-text-muted py-8">
              {searchTerm
                ? 'No revaluation requests found matching your search.'
                : 'No revaluation requests found for the selected filter.'}
            </p>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-text">
                      {request.student_usn}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${statusColors[request.status]}`}>
                      {request.status.replace('_', ' ')}
                    </span>
                    {request.payment_status === 'PENDING' && (
                      <span className="px-2 py-1 text-xs font-medium bg-warning/20 text-warning rounded">
                        Payment Pending
                      </span>
                    )}
                  </div>
                  
                  <p className="text-text font-medium mb-2">{request.student_name}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3">
                    <div>
                      <p className="text-text-muted">Course: <span className="text-text font-medium">{request.course_code} - {request.course_name}</span></p>
                      <p className="text-text-muted">Exam: <span className="text-text font-medium">{request.exam_type}</span></p>
                    </div>
                    <div>
                      <p className="text-text-muted">Original Marks: <span className="text-text font-semibold">{request.original_marks}</span></p>
                      {request.revalued_marks !== null && (
                        <p className="text-text-muted">Revalued Marks: <span className="text-primary font-semibold">{request.revalued_marks}</span></p>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-text-muted italic">&ldquo;{request.reason}&rdquo;</p>

                  <div className="flex items-center gap-2 text-sm text-text-muted mt-2">
                    <Calendar className="w-4 h-4" />
                    <span>Requested on {new Date(request.request_date).toLocaleDateString()}</span>
                  </div>
                </div>

                {(user?.role === 'ADMIN' || user?.role === 'EXAM_CELL') && request.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleProcessRequest(request.id, 'IN_PROGRESS')}
                    >
                      Process
                    </Button>
                  </div>
                )}
                
                {(user?.role === 'ADMIN' || user?.role === 'EXAM_CELL') && request.status === 'IN_PROGRESS' && (
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleProcessRequest(request.id, 'COMPLETED')}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Complete
                    </Button>
                  </div>
                )}

                {request.status === 'COMPLETED' && request.revalued_marks !== null && (
                  <div className="text-center">
                    <div className="text-sm text-text-muted mb-1">Change</div>
                    <div className={`text-2xl font-bold ${request.revalued_marks > request.original_marks ? 'text-success' : request.revalued_marks < request.original_marks ? 'text-primary' : 'text-text'}`}>
                      {request.revalued_marks > request.original_marks ? '+' : ''}{request.revalued_marks - request.original_marks}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-primary-light rounded-lg border border-primary/20">
        <h3 className="font-semibold text-primary mb-2">📋 Revaluation Guidelines</h3>
        <ul className="text-sm text-text space-y-1">
          <li>• Revaluation requests must be submitted within 3 days of result publication</li>
          <li>• Revaluation fee: ₹500 per course (non-refundable)</li>
          <li>• Marks can increase, decrease, or remain the same after revaluation</li>
          <li>• Revaluation typically takes 7-10 working days</li>
          <li>• Students will be notified via email once revaluation is complete</li>
        </ul>
      </div>
    </div>
  );
}
