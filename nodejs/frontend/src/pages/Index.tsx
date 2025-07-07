import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const Index = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Initialize Telegram WebApp if available
  useEffect(() => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      
      // Set theme colors
      document.documentElement.style.setProperty('--tg-theme-bg-color', tg.backgroundColor);
      document.documentElement.style.setProperty('--tg-theme-text-color', tg.textColor);
    }
  }, []);

  // Fetch today's prompt
  useEffect(() => {
    const fetchPrompt = async () => {
      try {
        // Try to get user ID from Telegram WebApp
        const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || '12345';
        
        const response = await fetch(`/api/miniapp/prompts/today/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setPrompt(data.prompt || data.text || "What are you grateful for today?");
        } else {
          setPrompt("What are you grateful for today?");
        }
      } catch (error) {
        console.error('Error fetching prompt:', error);
        setPrompt("What are you grateful for today?");
      } finally {
        setLoading(false);
      }
    };

    fetchPrompt();
  }, []);

  const handleSubmit = async () => {
    if (!response.trim()) return;
    
    setSubmitting(true);
    try {
      const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || '12345';
      
      const submitResponse = await fetch(`/api/miniapp/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          prompt,
          response: response.trim(),
        }),
      });

      if (submitResponse.ok) {
        // Show success feedback
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        }
        
        // Clear the response
        setResponse("");
        
        // You could show a success message or navigate to another page
        alert("Thank you for your reflection! 🦕");
      } else {
        throw new Error('Failed to submit response');
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      alert("Sorry, there was an error saving your response. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🦕</div>
          <p className="text-gray-600">Loading your prompt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <div className="text-6xl mb-4">🦕</div>
          <h1 className="text-2xl font-bold text-gray-800">ThyKnow</h1>
          <p className="text-gray-600 mt-2">Reflect, grow, and discover yourself</p>
        </div>

        {/* Daily Prompt Card */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-center">💭 Today's Reflection</CardTitle>
            <CardDescription className="text-center">Take a moment to think deeply</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-gray-700 text-lg">{prompt}</p>
            </div>
            
            <Textarea
              placeholder="Share your thoughts here..."
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              className="min-h-[120px] resize-none"
            />
            
            <Button 
              onClick={handleSubmit}
              disabled={!response.trim() || submitting}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {submitting ? "Saving..." : "💚 Submit Reflection"}
            </Button>
          </CardContent>
        </Card>

        {/* Navigation Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/pet'}
            className="bg-white/80 h-12"
          >
            🦖 Dino Friend
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/streak'}
            className="bg-white/80 h-12"
          >
            📊 Progress
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/journal'}
            className="bg-white/80 h-12"
          >
            📔 Journal
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/achievements'}
            className="bg-white/80 h-12"
          >
            🏆 Achievements
          </Button>
        </div>

        {/* Additional Actions */}
        <div className="space-y-3">
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="w-full bg-white/80"
          >
            🎲 Get New Prompt
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;