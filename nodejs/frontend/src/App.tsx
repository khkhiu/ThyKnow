// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BackgroundProvider, useBackground } from "./context/BackgroundContext";
import BackgroundWrapper from "./components/BackgroundWrapper";
import BackgroundSelector from "./components/BackgroundSelector";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useState } from "react";

const queryClient = new QueryClient();

// Main App Content component that uses the background context
const AppContent = () => {
  const { currentBackgroundId, isLoading } = useBackground();
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);

  if (isLoading) {
    // Show a simple loading spinner while background preference loads
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <BackgroundWrapper 
      backgroundId={currentBackgroundId}
      overlay={true} 
      overlayOpacity={0.05}
      className="min-h-screen"
    >
      <Toaster />
      <Sonner />
      
      {/* Background Selector Modal */}
      <BackgroundSelector 
        isOpen={showBackgroundSelector}
        onClose={() => setShowBackgroundSelector(false)}
      />
      
      {/* Floating Background Settings Button */}
      <button
        onClick={() => setShowBackgroundSelector(true)}
        className="fixed bottom-4 right-4 z-30 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-105"
        title="Change Background"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* MiniApp Routes */}
          <Route path="/miniapp" element={<Index />} />
          <Route path="/miniapp/pet" element={<Index />} />
          <Route path="/miniapp/streak" element={<Index />} />
          <Route path="/miniapp/journal" element={<Index />} />
          <Route path="/miniapp/care" element={<Index />} />
          <Route path="/miniapp/shop" element={<Index />} />
          <Route path="/miniapp/achievements" element={<Index />} />
          <Route path="/miniapp/stats" element={<Index />} />
          
          {/* Other Routes */}
          <Route path="/pet" element={<Index />} />
          <Route path="/journal" element={<Index />} />
          <Route path="/care" element={<Index />} />
          <Route path="/shop" element={<Index />} />
          <Route path="/achievements" element={<Index />} />
          <Route path="/stats" element={<Index />} />
          
          {/* Catch-all route - MUST BE LAST */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </BackgroundWrapper>
  );
};

// Main App component with all providers
const App = () => {
  // You can get the userId from your authentication context/state
  // For now, using a placeholder - replace with actual user ID
  const userId = "user123"; // Replace with actual user ID from your auth system

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BackgroundProvider userId={userId}>
          <AppContent />
        </BackgroundProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;