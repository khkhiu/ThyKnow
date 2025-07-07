
import React, { useState } from 'react';
import { Settings, Clock, Calendar, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface JournalSettingsProps {
  promptDay: string;
  promptTime: string;
  onSettingsChange: (day: string, time: string) => void;
}

const JournalSettings = ({ promptDay, promptTime, onSettingsChange }: JournalSettingsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(promptDay);
  const [selectedTime, setSelectedTime] = useState(promptTime);

  const days = [
    { value: 'sunday', label: 'Sunday' },
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' }
  ];

  const times = [
    { value: '09:00', label: '9:00 AM' },
    { value: '12:00', label: '12:00 PM' },
    { value: '15:00', label: '3:00 PM' },
    { value: '18:00', label: '6:00 PM' },
    { value: '20:00', label: '8:00 PM' },
    { value: '21:00', label: '9:00 PM' }
  ];

  const handleSave = () => {
    onSettingsChange(selectedDay, selectedTime);
    setIsOpen(false);
  };

  const formatDayTime = () => {
    const dayLabel = days.find(d => d.value === promptDay)?.label || 'Sunday';
    const timeLabel = times.find(t => t.value === promptTime)?.label || '9:00 AM';
    return `${dayLabel}s at ${timeLabel}`;
  };

  if (!isOpen) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-lg border-2 border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bell className="w-6 h-6 text-blue-500" />
            <div>
              <h3 className="font-semibold text-gray-800">Weekly Prompts</h3>
              <p className="text-sm text-gray-600">Scheduled for {formatDayTime()}</p>
            </div>
          </div>
          <Button
            onClick={() => setIsOpen(true)}
            variant="outline"
            size="sm"
            className="flex items-center space-x-1"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg border-2 border-blue-100">
      <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
        <Settings className="w-5 h-5 mr-2 text-blue-500" />
        Prompt Settings
      </h3>
      
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Calendar className="w-4 h-4 mr-1 text-purple-500" />
            Day of the week
          </Label>
          <Select value={selectedDay} onValueChange={setSelectedDay}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a day" />
            </SelectTrigger>
            <SelectContent>
              {days.map((day) => (
                <SelectItem key={day.value} value={day.value}>
                  {day.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Clock className="w-4 h-4 mr-1 text-purple-500" />
            Time of day
          </Label>
          <Select value={selectedTime} onValueChange={setSelectedTime}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a time" />
            </SelectTrigger>
            <SelectContent>
              {times.map((time) => (
                <SelectItem key={time.value} value={time.value}>
                  {time.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex space-x-2 pt-2">
          <Button onClick={handleSave} className="flex-1">
            Save Settings
          </Button>
          <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JournalSettings;
