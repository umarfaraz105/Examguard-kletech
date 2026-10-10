'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, RefreshCw, User, Calendar, MapPin, Clock, AlertCircle, CheckCircle, FileText, Print } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface HallTicketData {
  student: {
    name: string;
    roll_number: string;
    registration_number: string;
    course: string;
    branch: string;
    semester: string;
    academic_year: string;
    photo_url?: string;
  };
  examinations: Array<{
    id: string;
    subject_code: string;
    subject_name: string;
    exam_type: string;
    date: string;
    start_time: string;
    end_time: string;
    duration: string;
    room: string;
    seat_number: string;
    building: string;
    block: string;
    instructions?: string;
  }>;
  hall_ticket: {
    ticket_number: string;
    issue_date: string;
    valid_until: string;
    status: 'active' | 'suspended' | 'expired';
    qr_code?: string;
  };
  guidelines: string[];
}

export default function HallTicketPage() {
  const [hallTicketData, setHallTicketData] = useState<HallTicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchHallTicketData();
  }, []);

  const fetchHallTicketData = async () => {
    try {
      // Mock data - replace with actual API call
      const mockData: HallTicketData = {
        student: {
          name: 'John Doe',
          roll_number: '21CS101',
          registration_number: 'REG21CS101',
          course: 'B.Tech',
          branch: 'Computer Science Engineering',
          semester: '5th Semester',
          academic_year: '2026-27',
          photo_url: '/placeholder-photo.jpg'
        },
        examinations: [
          {
            id: '1',
            subject_code: 'MATH101',
            subject_name: 'Mathematics - I',
            exam_type: 'ISA-1',
            date: '2026-10-15',
            start_time: '09:00 AM',
            end_time: '12:00 PM',
            duration: '3 Hours',
            room: 'Room 101',
            seat_number: 'A-15',
            building: 'Academic Block A',
            block: 'A'
          },
          {
            id: '2',
            subject_code: 'PHY102',
            subject_name: 'Physics - II',
            exam_type: 'ISA-1',
            date: '2026-10-18',
            start_time: '02:00 PM',
            end_time: '05:00 PM',
            duration: '3 Hours',
            room: 'Room 205',
            seat_number: 'B-22',
            building: 'Science Block B',
            block: 'B'
          },
          {
            id: '3',
            subject_code: 'CHEM103',
            subject_name: 'Chemistry',
            exam_type: 'ISA-1',
            date: '2026-10-20',
            start_time: '10:00 AM',
            end_time: '01:00 PM',
            duration: '3 Hours',
            room: 'Lab 301',
            seat_number: 'C-08',
            building: 'Laboratory Block C',
            block: 'C',
            instructions: 'Calculator allowed, bring drawing instruments'
          },
          {
            id: '4',
            subject_code: 'ENG104',
            subject_name: 'Engineering Graphics',
            exam_type: 'ISA-1',
            date: '2026-10-22',
            start_time: '09:30 AM',
            end_time: '12:30 PM',
            duration: '3 Hours',
            room: 'Room 150',
            seat_number: 'A-30',
            building: 'Academic Block A',
            block: 'A',
            instructions: 'Drawing instruments required'
          }
        ],
        hall_ticket: {
          ticket_number: 'HT202610001',
          issue_date: '2026-10-01',
          valid_until: '2026-10-31',
          status: 'active',
          qr_code: 'QR_CODE_DATA_HERE'
        },
        guidelines: [
          'Arrive at the examination hall at least 30 minutes before the scheduled time',
          'Bring this hall ticket along with your ID card to every examination',
          'Mobile phones and electronic devices are strictly prohibited in the examination hall',
          'Follow the seating arrangement as specified in this hall ticket',
          'Any malpractice will result in cancellation of the examination',
          'Do not write anything on the hall ticket',
          'Report any discrepancies immediately to the examination office'
        ]
      };

      setHallTicketData(mockData);
    } catch (error) {
      console.error('Error fetching hall ticket data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      // Mock download - replace with actual PDF generation
      console.log('Downloading hall ticket PDF...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate download
    } catch (error) {
      console.error('Error downloading hall ticket:', error);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'suspended':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'expired':
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!hallTicketData) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Hall ticket data could not be loaded. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Examination Hall Ticket</h1>
          <p className="text-gray-600 mt-2">Download and print your official examination hall ticket</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchHallTicketData} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
            <Print className="h-4 w-4" />
            Print
          </Button>
          <Button 
            onClick={handleDownloadPDF} 
            disabled={downloading}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {downloading ? 'Downloading...' : 'Download PDF'}
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      <Alert className={hallTicketData.hall_ticket.status === 'active' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
        {getStatusIcon(hallTicketData.hall_ticket.status)}
        <AlertDescription>
          Hall Ticket Status: <strong className="capitalize">{hallTicketData.hall_ticket.status}</strong>
          {hallTicketData.hall_ticket.status === 'active' && ' - Valid for all scheduled examinations'}
          {hallTicketData.hall_ticket.status === 'suspended' && ' - Contact examination office immediately'}
          {hallTicketData.hall_ticket.status === 'expired' && ' - Please renew your hall ticket'}
        </AlertDescription>
      </Alert>

      {/* Hall Ticket Card */}
      <Card className="print:shadow-none print:border-2 print:border-black">
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-8 border-b pb-6">
            <h2 className="text-2xl font-bold text-blue-800 mb-2">KLE TECHNOLOGICAL UNIVERSITY</h2>
            <h3 className="text-xl font-semibold mb-1">EXAMINATION HALL TICKET</h3>
            <p className="text-lg">{hallTicketData.examinations[0]?.exam_type} - {hallTicketData.student.academic_year}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Student Photo */}
            <div className="lg:col-span-1 text-center">
              <div className="w-40 h-48 mx-auto bg-gray-200 border-2 border-gray-400 flex items-center justify-center mb-4">
                {hallTicketData.student.photo_url ? (
                  <img 
                    src={hallTicketData.student.photo_url} 
                    alt="Student Photo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-16 w-16 text-gray-400" />
                )}
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2 justify-center">
                  {getStatusIcon(hallTicketData.hall_ticket.status)}
                  <Badge className={getStatusColor(hallTicketData.hall_ticket.status)}>
                    {hallTicketData.hall_ticket.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Student Details */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Student Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Name:</span>
                      <span className="text-right">{hallTicketData.student.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Roll Number:</span>
                      <span className="text-right font-mono">{hallTicketData.student.roll_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Reg. Number:</span>
                      <span className="text-right font-mono">{hallTicketData.student.registration_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Course:</span>
                      <span className="text-right">{hallTicketData.student.course}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Branch:</span>
                      <span className="text-right">{hallTicketData.student.branch}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Semester:</span>
                      <span className="text-right">{hallTicketData.student.semester}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Hall Ticket Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Ticket Number:</span>
                      <span className="text-right font-mono">{hallTicketData.hall_ticket.ticket_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Issue Date:</span>
                      <span className="text-right">{new Date(hallTicketData.hall_ticket.issue_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Valid Until:</span>
                      <span className="text-right">{new Date(hallTicketData.hall_ticket.valid_until).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Academic Year:</span>
                      <span className="text-right">{hallTicketData.student.academic_year}</span>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="mt-4 text-center">
                    <div className="w-20 h-20 mx-auto bg-gray-200 border flex items-center justify-center text-xs text-gray-500">
                      QR Code
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Examination Schedule */}
          <div className="mb-8">
            <h4 className="font-semibold text-gray-800 mb-4 text-lg border-b pb-2">Examination Schedule</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-3 text-left">Subject Code</th>
                    <th className="border border-gray-300 p-3 text-left">Subject Name</th>
                    <th className="border border-gray-300 p-3 text-center">Date</th>
                    <th className="border border-gray-300 p-3 text-center">Time</th>
                    <th className="border border-gray-300 p-3 text-center">Duration</th>
                    <th className="border border-gray-300 p-3 text-center">Hall/Room</th>
                    <th className="border border-gray-300 p-3 text-center">Seat No.</th>
                  </tr>
                </thead>
                <tbody>
                  {hallTicketData.examinations.map((exam, index) => (
                    <tr key={exam.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="border border-gray-300 p-3 font-mono">{exam.subject_code}</td>
                      <td className="border border-gray-300 p-3">{exam.subject_name}</td>
                      <td className="border border-gray-300 p-3 text-center">
                        {new Date(exam.date).toLocaleDateString('en-GB')}
                      </td>
                      <td className="border border-gray-300 p-3 text-center">
                        {exam.start_time} - {exam.end_time}
                      </td>
                      <td className="border border-gray-300 p-3 text-center">{exam.duration}</td>
                      <td className="border border-gray-300 p-3 text-center">
                        {exam.building}<br/>{exam.room}
                      </td>
                      <td className="border border-gray-300 p-3 text-center font-mono font-bold">
                        {exam.block}-{exam.seat_number}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Special Instructions */}
          {hallTicketData.examinations.some(exam => exam.instructions) && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">Special Instructions</h4>
              <div className="space-y-2 text-sm">
                {hallTicketData.examinations
                  .filter(exam => exam.instructions)
                  .map(exam => (
                    <div key={exam.id} className="flex gap-2">
                      <span className="font-medium">{exam.subject_code}:</span>
                      <span>{exam.instructions}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Guidelines */}
          <div className="border-t pt-6">
            <h4 className="font-semibold text-gray-800 mb-4">Examination Guidelines</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
              {hallTicketData.guidelines.map((guideline, index) => (
                <div key={index} className="flex gap-2">
                  <span className="text-blue-600 font-bold">{index + 1}.</span>
                  <span>{guideline}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 pt-6 border-t text-sm text-gray-600">
            <p>This is a computer-generated hall ticket and does not require a signature.</p>
            <p className="mt-1">For any queries, contact the Examination Office.</p>
            <p className="mt-2 font-semibold">BEST OF LUCK FOR YOUR EXAMINATIONS!</p>
          </div>
        </CardContent>
      </Card>

      {/* Instructions for Download */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            Download Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Before Downloading:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Ensure all your examination details are correct</li>
                <li>• Check your photo is clearly visible</li>
                <li>• Verify all subject codes and dates</li>
                <li>• Note down your seat numbers for each exam</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">For Examination Day:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Print multiple copies of your hall ticket</li>
                <li>• Bring original ID card along with hall ticket</li>
                <li>• Keep hall ticket safe and legible</li>
                <li>• Do not fold or damage the hall ticket</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
