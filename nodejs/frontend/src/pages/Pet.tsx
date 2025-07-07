import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Pet = () => {
  const [affirmation, setAffirmation] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Initialize Telegram WebApp if available
  useEffect(() => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      
      // Set theme colors safely
      if (tg.backgroundColor) {
        document.documentElement.style.setProperty('--tg-theme-bg-color', tg.backgroundColor);
      }
      if (tg.textColor) {
        document.documentElement.style.setProperty('--tg-theme-text-color', tg.textColor);
      }
    }
  }, []);

  const fetchRandomAffirmation = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/miniapp/pet/random');
      if (response.ok) {
        const data = await response.json();
        setAffirmation(data.message || data.affirmation || "You're doing great! Keep reflecting!");
      } else {
        setAffirmation("You're awesome! Keep up the great work with your reflections! 🦕");
      }
    } catch (error) {
      console.error('Error fetching affirmation:', error);
      setAffirmation("Hey there! Your dino friend believes in you! 🦖");
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial affirmation
  useEffect(() => {
    fetchRandomAffirmation();
  }, []);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp?.BackButton) {
      // Use Telegram's back functionality if available
      window.history.back();
    } else {
      // Fallback for web browsers
      window.history.back();
    }
  };

  const handleGoToMain = () => {
    // Provide haptic feedback if available
    if (typeof window !== "undefined" && window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <div className="text-6xl mb-4">🦕</div>
          <h1 className="text-2xl font-bold text-gray-800">Your Dino Friend</h1>
          <p className="text-gray-600 mt-2">Here to encourage and support your reflection journey!</p>
        </div>

        {/* Affirmation Card */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-center">💚 Daily Encouragement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 bg-green-50 rounded-lg min-h-[100px] flex items-center justify-center">
              {loading ? (
                <div className="animate-pulse text-gray-500">Loading inspiration...</div>
              ) : (
                <p className="text-lg text-gray-700 italic">{affirmation}</p>
              )}
            </div>
            
            <Button 
              onClick={fetchRandomAffirmation} 
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading ? "Loading..." : "🎲 Get New Encouragement"}
            </Button>
          </CardContent>
        </Card>

        {/* Dino Stats Card */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-center">🦖 Dino Stats</CardTitle>
            <CardDescription className="text-center">Your companion grows with your reflections!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">💪</div>
                <div className="text-sm text-gray-600">Happiness</div>
                <div className="text-lg font-semibold">High</div>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">⚡</div>
                <div className="text-sm text-gray-600">Energy</div>
                <div className="text-lg font-semibold">Energetic</div>
              </div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Your dino friend is thriving thanks to your consistent reflection practice!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="bg-white/80"
          >
            ← Back
          </Button>
          <Button 
            onClick={handleGoToMain}
            className="bg-blue-600 hover:bg-blue-700"
          >
            🦕 Main App
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pet;