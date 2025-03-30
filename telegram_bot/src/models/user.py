# telegram_bot/src/models/user.py

"""User model for the Telegram Journal Bot."""

from dataclasses import dataclass, asdict, field
from typing import List, Optional, Dict
from datetime import datetime
from src.config import SINGAPORE_TIMEZONE

@dataclass
class JournalEntry:
    """Represents a single journal entry."""
    prompt: str
    response: str
    timestamp: str
    prompt_type: str

    @classmethod
    def from_dict(cls, data: Dict) -> 'JournalEntry':
        """Create a JournalEntry instance from a dictionary."""
        return cls(
            prompt=data['prompt'],
            response=data['response'],
            timestamp=data['timestamp'],
            prompt_type=data.get('prompt_type', 'unknown')
        )

    def to_dict(self) -> Dict:
        """Convert the entry to a dictionary."""
        return asdict(self)

@dataclass
class SchedulePreference:
    """Represents user's schedule preferences for prompts."""
    day: int = 0  # Monday (0-6, where 0 is Monday and 6 is Sunday)
    hour: int = 9  # 9 AM (0-23)
    enabled: bool = True  # Whether weekly prompts are enabled

    @classmethod
    def from_dict(cls, data: Dict) -> 'SchedulePreference':
        """Create a SchedulePreference instance from a dictionary."""
        return cls(
            day=data.get('day', 0),
            hour=data.get('hour', 9),
            enabled=data.get('enabled', True)
        )

    def to_dict(self) -> Dict:
        """Convert the schedule preference to a dictionary."""
        return asdict(self)

@dataclass
class User:
    """Represents a user of the journal bot."""
    id: str
    timezone: str = SINGAPORE_TIMEZONE  # Always initialized with Singapore timezone
    last_prompt: Optional[Dict] = None
    responses: List[JournalEntry] = None
    schedule_preference: SchedulePreference = None

    def __post_init__(self):
        """Initialize empty responses list if None and ensure Singapore timezone."""
        if self.responses is None:
            self.responses = []
        # Always ensure Singapore timezone
        self.timezone = SINGAPORE_TIMEZONE
        # Initialize schedule preference if None
        if self.schedule_preference is None:
            self.schedule_preference = SchedulePreference()

    @classmethod
    def from_dict(cls, user_id: str, data: Dict) -> 'User':
        """Create a User instance from a dictionary."""
        responses = [
            JournalEntry.from_dict(entry) 
            for entry in data.get('responses', [])
        ]
        
        # Extract schedule preference
        schedule_data = data.get('schedule_preference', {})
        schedule_preference = SchedulePreference.from_dict(schedule_data) if schedule_data else SchedulePreference()
        
        return cls(
            id=user_id,
            timezone=SINGAPORE_TIMEZONE,  # Always use Singapore timezone
            last_prompt=data.get('last_prompt'),
            responses=responses,
            schedule_preference=schedule_preference
        )

    def to_dict(self) -> Dict:
        """Convert the user to a dictionary."""
        return {
            'timezone': SINGAPORE_TIMEZONE,  # Always save Singapore timezone
            'last_prompt': self.last_prompt,
            'responses': [entry.to_dict() for entry in self.responses],
            'schedule_preference': self.schedule_preference.to_dict()
        }

    def add_response(self, entry: JournalEntry):
        """Add a new journal entry."""
        self.responses.append(entry)

    def get_recent_entries(self, limit: int) -> List[JournalEntry]:
        """Get the most recent journal entries."""
        return sorted(
            self.responses,
            key=lambda x: datetime.fromisoformat(x.timestamp),
            reverse=True
        )[:limit]