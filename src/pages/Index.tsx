import Hero from "@/components/Hero";
import TrendingStocks from "@/components/TrendingStocks";
import MarketNews from "@/components/MarketNews";
import AIPredictions from "@/components/AIPredictions";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <TrendingStocks />
      <MarketNews />
      <AIPredictions />
      
      <footer className="bg-card border-t border-border py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted-foreground">
            © 2025 Smart Stock Analysis. Market data and predictions for informational purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
