import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Hero from "@/components/Hero";
import TrendingStocks from "@/components/TrendingStocks";
import Watchlist from "@/components/Watchlist";
import MarketNews from "@/components/MarketNews";
import AIPredictions from "@/components/AIPredictions";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <nav className="bg-card border-b border-border py-4 px-4 sticky top-0 z-50 backdrop-blur-sm bg-card/95">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Stock Analysis Platform</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user.email}
            </span>
            <Button onClick={signOut} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>
      
      <Hero />
      <TrendingStocks />
      <Watchlist />
      <MarketNews />
      <AIPredictions />
      
      <footer className="bg-card border-t border-border py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted-foreground">
            © 2025 Smart Stock Analysis. All prices shown in INR. Market data for informational purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;