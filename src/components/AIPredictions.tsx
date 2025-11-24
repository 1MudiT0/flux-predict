import { useState } from "react";
import { Brain, Search, TrendingUp, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const AIPredictions = () => {
  const [ticker, setTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);
  const { toast } = useToast();

  const handlePredict = async () => {
    if (!ticker) {
      toast({
        title: "Please enter a stock ticker",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setPrediction(null);
    
    try {
      // First, validate the stock exists by fetching real data
      const { data: stockResponse, error: stockError } = await supabase.functions.invoke('get-stock-data', {
        body: { symbols: [ticker.toUpperCase()] }
      });

      if (stockError) throw stockError;

      // Check if we got valid stock data
      if (!stockResponse?.stockData || stockResponse.stockData.length === 0) {
        setLoading(false);
        toast({
          title: "Invalid Stock Symbol",
          description: `"${ticker.toUpperCase()}" is not a valid stock symbol. Please check and try again.`,
          variant: "destructive"
        });
        return;
      }

      const stockData = stockResponse.stockData[0];

      // Generate AI prediction using Lovable AI
      const { data: predictionData, error: predictionError } = await supabase.functions.invoke('predict-stock', {
        body: { stockData }
      });

      if (predictionError) {
        if (predictionError.message?.includes('429')) {
          toast({
            title: "Rate Limit Exceeded",
            description: "Too many requests. Please try again in a moment.",
            variant: "destructive"
          });
          return;
        }
        if (predictionError.message?.includes('402')) {
          toast({
            title: "AI Credits Required",
            description: "Please add credits to your workspace to continue using AI predictions.",
            variant: "destructive"
          });
          return;
        }
        throw predictionError;
      }

      setPrediction(predictionData);
      
      toast({
        title: "AI Prediction Generated",
        description: `Smart analysis complete for ${stockData.symbol.replace('.NS', '')}`,
      });
    } catch (error: any) {
      console.error('Error generating prediction:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate prediction. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="ai-predictions" className="py-20 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="h-10 w-10 text-accent" />
            <h2 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              AI Price Predictions
            </h2>
          </div>
          <p className="text-muted-foreground text-lg">
            Get intelligent 30-day price forecasts powered by machine learning
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="shadow-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Stock Analysis
              </CardTitle>
              <CardDescription>Enter a stock ticker to generate AI-powered price predictions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-4">
                  <Input
                    placeholder="Enter stock ticker (e.g., AAPL, RELIANCE.NS, TCS.NS)"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === 'Enter' && handlePredict()}
                    className="text-lg"
                  />
                  <Button 
                    onClick={handlePredict} 
                    disabled={loading}
                    className="bg-gradient-primary hover:opacity-90 transition-opacity whitespace-nowrap"
                  >
                    {loading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                        AI Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="mr-2 h-5 w-5" />
                        Predict with AI
                      </>
                    )}
                  </Button>
                </div>
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <p>Enter valid stock symbols. Indian stocks require .NS suffix (e.g., TCS.NS)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {prediction && (
            <Card className="shadow-hover border-border animate-fade-in">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-3xl">{prediction.ticker}</CardTitle>
                    <CardDescription className="mt-1">{prediction.name}</CardDescription>
                    <CardDescription className="mt-2">30-Day Price Forecast</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground mb-1">Confidence Score</div>
                    <div className="text-2xl font-bold text-accent">{prediction.confidence}%</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">Current Price</div>
                    <div className="text-2xl font-bold">{prediction.currency === 'INR' ? '₹' : '$'}{parseFloat(prediction.currentPrice).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">Predicted Price (30d)</div>
                    <div className="text-2xl font-bold">{prediction.currency === 'INR' ? '₹' : '$'}{parseFloat(prediction.predictedPrice).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      Expected Change
                    </div>
                    <div className={`text-2xl font-bold ${
                      parseFloat(prediction.change) >= 0 ? 'text-success' : 'text-destructive'
                    }`}>
                      {parseFloat(prediction.change) >= 0 ? '+' : ''}{prediction.change}%
                    </div>
                  </div>
                </div>

                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={prediction.chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="day" 
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        tickFormatter={(value) => `${prediction.currency === 'INR' ? '₹' : '$'}${value.toFixed(0)}`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value: any) => `${prediction.currency === 'INR' ? '₹' : '$'}${value.toFixed(2)}`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="actual" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        name="Current Price"
                        dot={{ fill: 'hsl(var(--primary))' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="predicted" 
                        stroke="hsl(var(--accent))" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="AI Prediction"
                        dot={{ fill: 'hsl(var(--accent))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {prediction.keyFactors && (
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="text-sm font-semibold text-foreground mb-2">
                      AI Analysis - {prediction.trendDirection === 'bullish' ? '📈 Bullish' : prediction.trendDirection === 'bearish' ? '📉 Bearish' : '➡️ Neutral'} Outlook
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {prediction.keyFactors.map((factor: string, idx: number) => (
                        <div key={idx}>• {factor}</div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Disclaimer:</strong> This prediction is generated using AI and analyzes current market data and trends. 
                    It should not be considered as financial advice. Always conduct your own research and consult with 
                    financial professionals before making investment decisions.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
};

export default AIPredictions;
