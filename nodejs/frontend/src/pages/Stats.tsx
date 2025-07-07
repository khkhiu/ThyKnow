import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Stats = () => {
  useEffect(() => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center py-6">
          <div className="text-6xl mb-4">📈</div>
          <h1 className="text-2xl font-bold text-gray-800">Stats</h1>
          <p className="text-gray-600 mt-2">Detailed analytics of your reflection journey</p>
        </div>
        
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-center">📊 Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">Detailed statistics and insights coming soon!</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => window.history.back()} className="bg-white/80">
            ← Back
          </Button>
          <Button onClick={() => window.location.href = '/'} className="bg-slate-600 hover:bg-slate-700">
            🦕 Main App
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Stats;