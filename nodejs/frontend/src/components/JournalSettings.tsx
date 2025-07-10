// components/JournalSettings.tsx
import React from 'react';
//import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface JournalSettingsProps {
  promptDay: string;
  promptTime: string;
  onSettingsChange: (day: string, time: string) => void;
}

const JournalSettings: React.FC<JournalSettingsProps> = ({
  promptDay,
  promptTime,
  onSettingsChange
}) => {
  const handleDayChange = (newDay: string) => {
    onSettingsChange(newDay, promptTime);
  };

  const handleTimeChange = (newTime: string) => {
    onSettingsChange(promptDay, newTime);
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium mb-3">Prompt Schedule</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Preferred Day
            </label>
            <Select value={promptDay} onValueChange={handleDayChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="monday">Monday</SelectItem>
                <SelectItem value="tuesday">Tuesday</SelectItem>
                <SelectItem value="wednesday">Wednesday</SelectItem>
                <SelectItem value="thursday">Thursday</SelectItem>
                <SelectItem value="friday">Friday</SelectItem>
                <SelectItem value="saturday">Saturday</SelectItem>
                <SelectItem value="sunday">Sunday</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Preferred Time
            </label>
            <Select value={promptTime} onValueChange={handleTimeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="06:00">6:00 AM</SelectItem>
                <SelectItem value="07:00">7:00 AM</SelectItem>
                <SelectItem value="08:00">8:00 AM</SelectItem>
                <SelectItem value="09:00">9:00 AM</SelectItem>
                <SelectItem value="10:00">10:00 AM</SelectItem>
                <SelectItem value="12:00">12:00 PM</SelectItem>
                <SelectItem value="18:00">6:00 PM</SelectItem>
                <SelectItem value="19:00">7:00 PM</SelectItem>
                <SelectItem value="20:00">8:00 PM</SelectItem>
                <SelectItem value="21:00">9:00 PM</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-3">Weekly Streak Information</h4>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>How it works:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1 text-gray-600">
                <li>Weeks run Monday to Sunday</li>
                <li>One reflection per week maintains your streak</li>
                <li>Multiple entries in one week = bonus points</li>
                <li>Miss a week = streak resets</li>
              </ul>
            </div>
            <div>
              <strong>Points System:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1 text-gray-600">
                <li>Base: 50 points per weekly reflection</li>
                <li>Streak bonus: +10 points per streak week</li>
                <li>Extra entries: +20 bonus points</li>
                <li>Milestones: Big bonuses at 4, 12, 26, 52+ weeks</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-3">Data & Privacy</h4>
        <div className="text-sm text-gray-600 space-y-2">
          <p>Your journal entries are stored securely and privately.</p>
          <p>Only you can see your personal reflections and responses.</p>
          <p>Streak and points data help track your progress over time.</p>
        </div>
      </div>
    </div>
  );
};

export default JournalSettings;