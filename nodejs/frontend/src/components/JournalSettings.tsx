// components/JournalSettings.tsx
import React from 'react';
import { Bot, Clock, Calendar, Settings2 } from 'lucide-react';

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
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Settings2 className="w-5 h-5 text-blue-600" />
          </div>
          <h4 className="font-semibold text-gray-800">Prompt Schedule Settings</h4>
        </div>
        
        <div className="bg-white/60 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="font-medium text-amber-800">Work in Progress</span>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Web-based scheduling settings are currently under development. 
            We're working to bring you a seamless experience right here in the app!
          </p>
        </div>

        <div className="bg-white/60 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bot className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-gray-800">Available Now in Telegram</span>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            You can configure your prompt schedule using these Telegram bot commands:
          </p>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-3 h-3 text-green-600" />
              <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">/schedule_day</code>
              <span className="text-gray-600">- Set the day of the week</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-3 h-3 text-green-600" />
              <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">/schedule_time</code>
              <span className="text-gray-600">- Set the hour of the day</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Settings2 className="w-3 h-3 text-green-600" />
              <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">/schedule_toggle</code>
              <span className="text-gray-600">- Turn prompts on/off</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Bot className="w-3 h-3 text-green-600" />
              <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">/schedule</code>
              <span className="text-gray-600">- View current settings</span>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700">
            <strong>💡 Tip:</strong> Open your Telegram chat with ThyKnow Bot and use these commands to set up your personalized prompt schedule.
          </p>
        </div>
      </div>
    </div>
  );
};

export default JournalSettings;