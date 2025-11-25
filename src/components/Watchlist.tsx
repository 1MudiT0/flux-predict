import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  chartData: { time: string; price: number }[];
  currency?: string;
  marketState?: string;
  exchange?: string;
}

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState<Stock[]>([]);
  const [stockSymbol, setStockSymbol] = useState("");
  const [showAddStock, setShowAddStock] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addingStock, setAddingStock] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadWatchlist();
    }
  }, [user]);

  const loadWatchlist = async () => {
    try {
      setLoading(true);
      
      const { data: savedWatchlist, error } = await supabase
        .from('watchlist')
        .select('symbol, name')
        .eq('user_id', user?.id);

      if (error) throw error;

      if (savedWatchlist && savedWatchlist.length > 0) {
        const symbols = savedWatchlist.map(item => item.symbol);
        const { data } = await supabase.functions.invoke('get-stock-data', {
          body: { symbols }
        });

        if (data?.stockData) {
          setWatchlist(data.stockData);
          setLastUpdate(new Date());
        }
      }
    } catch (error: any) {
      console.error('Error loading watchlist:', error);
      toast({
        title: "Error",
        description: "Failed to load watchlist.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addToWatchlist = async () => {
    if (!stockSymbol.trim()) {
      toast({
        title: "Error",
        description: "Please enter a stock symbol.",
        variant: "destructive",
      });
      return;
    }

    const symbol = stockSymbol.trim().toUpperCase();
    
    // Check if already in watchlist
    if (watchlist.some(w => w.symbol === symbol)) {
      toast({
        title: "Already Added",
        description: "This stock is already in your watchlist.",
        variant: "destructive",
      });
      return;
    }

    try {
      setAddingStock(true);
      
      // Validate stock by fetching data
      const { data, error: fetchError } = await supabase.functions.invoke('get-stock-data', {
        body: { symbols: [symbol] }
      });

      if (fetchError || !data?.stockData || data.stockData.length === 0) {
        toast({
          title: "Invalid Stock",
          description: "Stock symbol not found. Please check and try again.",
          variant: "destructive",
        });
        return;
      }

      const stockData = data.stockData[0];
      
      // Add to database
      const { error } = await supabase
        .from('watchlist')
        .insert({
          user_id: user?.id,
          symbol: stockData.symbol,
          name: stockData.name
        });

      if (error) throw error;

      setWatchlist([...watchlist, stockData]);
      
      toast({
        title: "Stock Added",
        description: `${stockData.name} (${stockData.symbol}) added to your watchlist.`,
      });
      
      setShowAddStock(false);
      setStockSymbol("");
    } catch (error: any) {
      console.error('Error adding stock:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add stock.",
        variant: "destructive",
      });
    } finally {
      setAddingStock(false);
    }
  };

  const removeFromWatchlist = async (symbol: string) => {
    try {
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', user?.id)
        .eq('symbol', symbol);

      if (error) throw error;

      setWatchlist(watchlist.filter(stock => stock.symbol !== symbol));
      
      toast({
        title: "Stock Removed",
        description: "Stock removed from your watchlist.",
      });
    } catch (error: any) {
      console.error('Error removing stock:', error);
      toast({
        title: "Error",
        description: "Failed to remove stock.",
        variant: "destructive",
      });
    }
  };


  // Auto-refresh every 3 minutes
  useEffect(() => {
    if (watchlist.length > 0) {
      const interval = setInterval(() => {
        loadWatchlist();
      }, 180000);

      return () => clearInterval(interval);
    }
  }, [watchlist.length]);

  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold">Your Watchlist</h2>
              {watchlist.length > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium animate-pulse">
                  <Activity className="h-3 w-3" />
                  LIVE
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <p className="text-muted-foreground">Track your favorite stocks in real-time</p>
              {watchlist.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  Updated: {lastUpdate.toLocaleTimeString('en-IN')}
                </span>
              )}
            </div>
          </div>
          <Button onClick={() => setShowAddStock(!showAddStock)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Stock
          </Button>
        </div>

        {showAddStock && (
          <Card className="mb-8 animate-fade-in">
            <CardHeader>
              <CardTitle>Add Stock to Watchlist</CardTitle>
              <CardDescription>
                Enter any stock symbol (e.g., AAPL for Apple, RELIANCE.NS for Reliance)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter stock symbol (e.g., AAPL, TSLA, TCS.NS)..."
                  value={stockSymbol}
                  onChange={(e) => setStockSymbol(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addToWatchlist();
                    }
                  }}
                  disabled={addingStock}
                  className="flex-1"
                />
                <Button 
                  onClick={addToWatchlist} 
                  disabled={addingStock || !stockSymbol.trim()}
                >
                  {addingStock ? "Adding..." : "Add"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                <strong>Tips:</strong> For Indian stocks, add .NS suffix (e.g., RELIANCE.NS). 
                For US stocks, use the ticker symbol directly (e.g., AAPL, GOOGL).
              </p>
            </CardContent>
          </Card>
        )}

        {loading && watchlist.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="h-8 w-8 mx-auto mb-4 animate-pulse text-primary" />
            <p className="text-muted-foreground">Loading your watchlist...</p>
          </div>
        ) : watchlist.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-muted-foreground">
                Your watchlist is empty. Add stocks to track real-time prices!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {watchlist.map((stock, index) => (
              <Card 
                key={stock.symbol} 
                className="relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`absolute top-0 right-0 w-24 h-24 ${
                  stock.change >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'
                } rounded-bl-full`}></div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 z-10"
                  onClick={() => removeFromWatchlist(stock.symbol)}
                >
                  <X className="h-4 w-4" />
                </Button>
                
                <CardHeader>
                  <CardTitle className="flex items-center justify-between pr-8">
                    <span className="font-bold">{stock.symbol.replace('.NS', '')}</span>
                    <span className={`flex items-center text-sm font-semibold ${
                      stock.change >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {stock.change >= 0 ? (
                        <TrendingUp className="mr-1 h-4 w-4" />
                      ) : (
                        <TrendingDown className="mr-1 h-4 w-4" />
                      )}
                      {stock.changePercent.toFixed(2)}%
                    </span>
                  </CardTitle>
                  <CardDescription className="text-sm truncate">{stock.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-4">
                    {stock.currency === 'INR' ? '₹' : '$'}{stock.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    <span className={`text-sm ml-2 ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {stock.change >= 0 ? '+' : ''}{stock.currency === 'INR' ? '₹' : '$'}{Math.abs(stock.change).toFixed(2)}
                    </span>
                  </div>
                  {stock.chartData && stock.chartData.length > 0 && (
                    <ResponsiveContainer width="100%" height={60}>
                      <LineChart data={stock.chartData}>
                        <Line
                          type="monotone"
                          dataKey="price"
                          stroke={stock.change >= 0 ? "#10b981" : "#ef4444"}
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Watchlist;