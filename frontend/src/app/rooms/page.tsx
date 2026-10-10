'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { roomsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';

interface Room {
  id: number;
  room_number: string;
  building: string;
  floor: number;
  capacity: number;
  rows: number;
  columns: number;
  is_available: boolean;
  bench_count?: number;
  created_at: string;
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    room_number: '',
    building: '',
    floor: 1,
    capacity: 60,
    rows: 10,
    columns: 6,
    is_available: true,
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await roomsAPI.list();
      setRooms(response.data);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await roomsAPI.create(formData);
      setShowForm(false);
      setFormData({
        room_number: '',
        building: '',
        floor: 1,
        capacity: 60,
        rows: 10,
        columns: 6,
        is_available: true,
      });
      fetchRooms();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to create room');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    
    try {
      await roomsAPI.delete(id);
      fetchRooms();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to delete room');
    }
  };

  const toggleAvailability = async (room: Room) => {
    try {
      await roomsAPI.update(room.id, { is_available: !room.is_available });
      fetchRooms();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to update room');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading rooms...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Examination Rooms</h1>
          <p className="text-gray-600 mt-1">Manage exam room configurations</p>
        </div>
        {(user?.role === 'ADMIN' || user?.role === 'EXAM_CELL') && (
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Add Room'}
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New Room</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Room Number"
                value={formData.room_number}
                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                placeholder="101"
                required
              />
              <Input
                label="Building"
                value={formData.building}
                onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                placeholder="Main Block"
                required
              />
              <Input
                label="Floor"
                type="number"
                min="0"
                max="10"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) })}
                required
              />
              <Input
                label="Capacity"
                type="number"
                min="1"
                max="200"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                required
              />
              <Input
                label="Rows"
                type="number"
                min="1"
                max="20"
                value={formData.rows}
                onChange={(e) => setFormData({ ...formData, rows: parseInt(e.target.value) })}
                required
              />
              <Input
                label="Columns (Benches per row)"
                type="number"
                min="1"
                max="10"
                value={formData.columns}
                onChange={(e) => setFormData({ ...formData, columns: parseInt(e.target.value) })}
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_available"
                checked={formData.is_available}
                onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                className="w-4 h-4 text-primary rounded focus:ring-primary"
              />
              <label htmlFor="is_available" className="text-sm font-medium text-text">
                Room is available for exams
              </label>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Create Room</Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.length === 0 ? (
          <Card className="col-span-full">
            <p className="text-center text-gray-600 py-8">
              No rooms found. Add your first room to get started.
            </p>
          </Card>
        ) : (
          rooms.map((room) => (
            <Card key={room.id} className={!room.is_available ? 'opacity-60' : ''}>
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Room {room.room_number}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {room.building}, Floor {room.floor}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      room.is_available
                        ? 'kle-status-success'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {room.is_available ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-50 px-3 py-2 rounded">
                    <p className="text-gray-600 text-xs">Capacity</p>
                    <p className="font-semibold text-gray-900">{room.capacity}</p>
                  </div>
                  <div className="bg-gray-50 px-3 py-2 rounded">
                    <p className="text-gray-600 text-xs">Layout</p>
                    <p className="font-semibold text-gray-900">
                      {room.rows} × {room.columns}
                    </p>
                  </div>
                </div>

                {room.bench_count !== undefined && (
                  <p className="text-xs text-gray-500">
                    {room.bench_count} benches configured
                  </p>
                )}

                {(user?.role === 'ADMIN' || user?.role === 'EXAM_CELL') && (
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={() => toggleAvailability(room)}
                    >
                      {room.is_available ? 'Mark Unavailable' : 'Mark Available'}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDelete(room.id)}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {rooms.length > 0 && (
        <div className="mt-6 p-4 bg-primary-light rounded-lg border border-primary/20">
          <h3 className="font-semibold text-primary mb-2">Room Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-text-muted">Total Rooms</p>
              <p className="text-2xl font-bold text-text">{rooms.length}</p>
            </div>
            <div>
              <p className="text-text-muted">Available</p>
              <p className="text-2xl font-bold text-success">
                {rooms.filter((r) => r.is_available).length}
              </p>
            </div>
            <div>
              <p className="text-text-muted">Total Capacity</p>
              <p className="text-2xl font-bold text-text">
                {rooms.reduce((sum, r) => sum + r.capacity, 0)}
              </p>
            </div>
            <div>
              <p className="text-text-muted">Total Benches</p>
              <p className="text-2xl font-bold text-text">
                {rooms.reduce((sum, r) => sum + r.rows * r.columns, 0)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
