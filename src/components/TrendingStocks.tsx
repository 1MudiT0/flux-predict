import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  chartData: { time: string; price: number }[];
}

const TrendingStocks = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Popular trending stocks to display
  const trendingSymbols = [
    "RELIANCE.NS",
    "TCS.NS", 
    "HDFCBANK.NS",
    "INFY.NS",
    "AAPL",
    "GOOGL"
  ];

  const fetchLiveData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('get-stock-data', {
        body: { symbols: trendingSymbols }
      });

      if (error) throw error;

      if (data?.stockData && data.stockData.length > 0) {
        setStocks(data.stockData);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error fetching stock data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchLiveData();
  }, []);

  // Auto-refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(fetchLiveData, 120000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="trending" className="py-20 px-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Trending Stocks
          </h2>
          {stocks.length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/20 text-green-600 dark:text-green-400 rounded-full text-xs font-medium animate-pulse">
              <Activity className="h-3 w-3" />
              LIVE
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 mb-8">
          <p className="text-muted-foreground">Real-time market movers (INR)</p>
          {stocks.length > 0 && (
            <span className="text-xs text-muted-foreground">
              Updated: {lastUpdate.toLocaleTimeString('en-IN')}
            </span>
          )}
        </div>

        {loading && stocks.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="h-8 w-8 mx-auto mb-4 animate-pulse text-primary" />
            <p className="text-muted-foreground">Loading trending stocks...</p>
          </div>
        ) : stocks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Unable to load stock data. Please try again later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stocks.map((stock, index) => (
              <Card 
                key={stock.symbol} 
                className="relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`absolute top-0 right-0 w-24 h-24 ${
                  stock.change >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'
                } rounded-bl-full`}></div>
                
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl font-bold">{stock.symbol.replace('.NS', '')}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{stock.name}</p>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-semibold z-10 ${
                      stock.change >= 0 ? 'bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-red-500/20 text-red-600 dark:text-red-400'
                    }`}>
                      {stock.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      {stock.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-3xl font-bold">
                        ₹{stock.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </p>
                      <p className={`text-sm font-medium ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {stock.change >= 0 ? '+' : ''}₹{stock.change.toFixed(2)} today
                      </p>
                    </div>
                    {stock.chartData && stock.chartData.length > 0 && (
                      <div className="h-16">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={stock.chartData}>
                            <Line 
                              type="monotone" 
                              dataKey="price" 
                              stroke={stock.change >= 0 ? '#10b981' : '#ef4444'} 
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TrendingStocks;
