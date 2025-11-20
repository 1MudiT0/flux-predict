import { Button } from "@/components/ui/button";
import { TrendingUp, BarChart3, Brain, Activity } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Hero = () => {
  const { user } = useAuth();
  
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative py-20 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20 animate-gradient"></div>
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]"></div>
      
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-2 h-2 bg-primary/30 rounded-full animate-float"></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-primary/20 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-2 h-2 bg-primary/25 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="relative max-w-4xl mx-auto text-center space-y-8">
        <div className="inline-block">
          <div className="flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-medium mb-6 animate-bounce-subtle">
            <Activity className="h-4 w-4 animate-pulse" />
            <span>Live Market Data • Indian & Global Stocks</span>
          </div>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 animate-fade-in">
          Real-Time Stock Analysis
          <br />
          <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/70 bg-clip-text text-transparent animate-gradient-text">
            for Indian Markets
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '200ms' }}>
          Track NSE, BSE & global stocks with live prices in INR. Get AI-powered predictions and real-time market insights.
        </p>
        
        {user && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '400ms' }}>
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Connected • Real-time data active</span>
          </div>
        )}
        
        <div className="flex flex-wrap gap-4 justify-center pt-4 animate-fade-in" style={{ animationDelay: '600ms' }}>
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => scrollToSection("trending")}
          >
            <TrendingUp className="mr-2 h-5 w-5" />
            View Trending Stocks
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="border-2 hover:bg-accent/10 transition-all duration-300"
            onClick={() => scrollToSection("ai-predictions")}
          >
            <Brain className="mr-2 h-5 w-5" />
            AI Predictions
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
          <div className="p-6 rounded-xl bg-card shadow-lg hover:shadow-xl transition-all duration-300 border border-border animate-fade-in" style={{ animationDelay: '800ms' }}>
            <Activity className="h-12 w-12 text-green-500 mx-auto mb-4 animate-pulse" />
            <h3 className="font-semibold text-lg mb-2">Live Market Data</h3>
            <p className="text-sm text-muted-foreground">Real-time tracking of NSE, BSE & global stocks in INR</p>
          </div>
          <div className="p-6 rounded-xl bg-card shadow-lg hover:shadow-xl transition-all duration-300 border border-border animate-fade-in" style={{ animationDelay: '1000ms' }}>
            <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Indian Market Focus</h3>
            <p className="text-sm text-muted-foreground">Track top NSE stocks and market movements</p>
          </div>
          <div className="p-6 rounded-xl bg-card shadow-lg hover:shadow-xl transition-all duration-300 border border-border animate-fade-in" style={{ animationDelay: '1200ms' }}>
            <Brain className="h-12 w-12 text-accent mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">AI-Powered Insights</h3>
            <p className="text-sm text-muted-foreground">Get intelligent forecasts for smarter decisions</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;