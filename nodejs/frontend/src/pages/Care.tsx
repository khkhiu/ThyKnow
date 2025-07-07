import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Care = () => {
  useEffect(() => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center py-6">
          <div className="text-6xl mb-4">💝</div>
          <h1 className="text-2xl font-bold text-gray-800">Care</h1>
          <p className="text-gray-600 mt-2">Take care of yourself and your dino friend</p>
        </div>
        
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-center">🌸 Self Care</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">Self-care activities and wellness tips coming soon!</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => window.history.back()} className="bg-white/80">
            ← Back
          </Button>
          <Button onClick={() => window.location.href = '/'} className="bg-pink-600 hover:bg-pink-700">
            🦕 Main App
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Care;