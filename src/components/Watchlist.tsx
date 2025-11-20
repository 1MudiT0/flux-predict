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
}

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState<Stock[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddStock, setShowAddStock] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { toast } = useToast();
  const { user } = useAuth();

  const availableStocks = [
    // Popular Indian Stocks (NSE)
    { symbol: "RELIANCE.NS", name: "Reliance Industries" },
    { symbol: "TCS.NS", name: "Tata Consultancy Services" },
    { symbol: "HDFCBANK.NS", name: "HDFC Bank" },
    { symbol: "INFY.NS", name: "Infosys Limited" },
    { symbol: "ICICIBANK.NS", name: "ICICI Bank" },
    { symbol: "HINDUNILVR.NS", name: "Hindustan Unilever" },
    { symbol: "ITC.NS", name: "ITC Limited" },
    { symbol: "BHARTIARTL.NS", name: "Bharti Airtel" },
    { symbol: "SBIN.NS", name: "State Bank of India" },
    { symbol: "BAJFINANCE.NS", name: "Bajaj Finance" },
    { symbol: "WIPRO.NS", name: "Wipro Limited" },
    { symbol: "AXISBANK.NS", name: "Axis Bank" },
    // Popular US Stocks
    { symbol: "AAPL", name: "Apple Inc." },
    { symbol: "GOOGL", name: "Alphabet Inc." },
    { symbol: "MSFT", name: "Microsoft Corporation" },
    { symbol: "AMZN", name: "Amazon.com Inc." },
    { symbol: "TSLA", name: "Tesla Inc." },
    { symbol: "META", name: "Meta Platforms Inc." },
    { symbol: "NVDA", name: "NVIDIA Corporation" },
  ];

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

  const addToWatchlist = async (stock: { symbol: string; name: string }) => {
    try {
      const { error } = await supabase
        .from('watchlist')
        .insert({
          user_id: user?.id,
          symbol: stock.symbol,
          name: stock.name
        });

      if (error) throw error;

      const { data } = await supabase.functions.invoke('get-stock-data', {
        body: { symbols: [stock.symbol] }
      });

      if (data?.stockData && data.stockData.length > 0) {
        setWatchlist([...watchlist, data.stockData[0]]);
      }

      toast({
        title: "Stock Added",
        description: `${stock.name} added to your watchlist.`,
      });
      setShowAddStock(false);
      setSearchTerm("");
    } catch (error: any) {
      console.error('Error adding stock:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add stock.",
        variant: "destructive",
      });
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

  const filteredStocks = availableStocks.filter(
    stock =>
      (stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase())) &&
      !watchlist.some(w => w.symbol === stock.symbol)
  );

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
              <p className="text-muted-foreground">Track your favorite stocks in real-time (INR)</p>
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
              <CardDescription>Search Indian (NSE) or global stocks</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Search by symbol or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-4"
              />
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredStocks.map((stock) => (
                  <div
                    key={stock.symbol}
                    className="flex justify-between items-center p-3 hover:bg-accent rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                    onClick={() => addToWatchlist(stock)}
                  >
                    <div>
                      <div className="font-semibold">{stock.symbol.replace('.NS', ' (NSE)')}</div>
                      <div className="text-sm text-muted-foreground">{stock.name}</div>
                    </div>
                    <Plus className="h-4 w-4" />
                  </div>
                ))}
                {filteredStocks.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No stocks found
                  </p>
                )}
              </div>
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
                    ₹{stock.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    <span className={`text-sm ml-2 ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {stock.change >= 0 ? '+' : ''}₹{stock.change.toFixed(2)}
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