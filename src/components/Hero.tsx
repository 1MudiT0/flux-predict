import { TrendingUp, BarChart3, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero = () => {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center bg-gradient-hero px-4 py-20">
      <div className="max-w-6xl mx-auto text-center space-y-8">
        <div className="space-y-4 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Smart Stock Analysis
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Track trending stocks, stay updated with market news, and leverage AI-powered predictions for smarter investment decisions.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 justify-center pt-4">
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 shadow-hover transition-all duration-300"
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
          <div className="p-6 rounded-xl bg-card shadow-card hover:shadow-hover transition-all duration-300 border border-border">
            <TrendingUp className="h-12 w-12 text-success mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Live Market Data</h3>
            <p className="text-sm text-muted-foreground">Real-time tracking of trending stocks and market movements</p>
          </div>
          <div className="p-6 rounded-xl bg-card shadow-card hover:shadow-hover transition-all duration-300 border border-border">
            <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Market Insights</h3>
            <p className="text-sm text-muted-foreground">Latest news and analysis affecting the stock market</p>
          </div>
          <div className="p-6 rounded-xl bg-card shadow-card hover:shadow-hover transition-all duration-300 border border-border">
            <Brain className="h-12 w-12 text-accent mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">AI-Powered Forecasts</h3>
            <p className="text-sm text-muted-foreground">Get intelligent price predictions powered by machine learning</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
