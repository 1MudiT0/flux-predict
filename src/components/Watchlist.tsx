import { useState, useEffect } from "react";
import { Star, Plus, X, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  chartData: { time: string; value: number }[];
}

const availableStocks = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "TSLA", name: "Tesla, Inc." },
  { symbol: "MSFT", name: "Microsoft Corp." },
  { symbol: "NVDA", name: "NVIDIA Corp." },
  { symbol: "AMZN", name: "Amazon.com Inc." },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "META", name: "Meta Platforms Inc." },
  { symbol: "NFLX", name: "Netflix Inc." },
];

const generateRealtimeData = (basePrice: number) => {
  const data = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60000);
    const variation = (Math.random() - 0.5) * basePrice * 0.02;
    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: parseFloat((basePrice + variation).toFixed(2))
    });
  }
  return data;
};

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState<Stock[]>([
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      price: 178.45,
      change: 2.34,
      changePercent: 1.33,
      chartData: generateRealtimeData(178.45)
    },
    {
      symbol: "TSLA",
      name: "Tesla, Inc.",
      price: 242.68,
      change: -3.21,
      changePercent: -1.31,
      chartData: generateRealtimeData(242.68)
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddStock, setShowAddStock] = useState(false);

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setWatchlist(prev => prev.map(stock => {
        const priceChange = (Math.random() - 0.5) * stock.price * 0.001;
        const newPrice = stock.price + priceChange;
        const newChange = stock.change + priceChange;
        const newChangePercent = (newChange / (newPrice - newChange)) * 100;
        
        const newChartData = [...stock.chartData.slice(1), {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          value: parseFloat(newPrice.toFixed(2))
        }];

        return {
          ...stock,
          price: parseFloat(newPrice.toFixed(2)),
          change: parseFloat(newChange.toFixed(2)),
          changePercent: parseFloat(newChangePercent.toFixed(2)),
          chartData: newChartData
        };
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const addToWatchlist = (stockInfo: { symbol: string; name: string }) => {
    if (watchlist.find(s => s.symbol === stockInfo.symbol)) return;
    
    const basePrice = Math.random() * 500 + 50;
    const change = (Math.random() - 0.5) * 10;
    const newStock: Stock = {
      symbol: stockInfo.symbol,
      name: stockInfo.name,
      price: parseFloat(basePrice.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(((change / basePrice) * 100).toFixed(2)),
      chartData: generateRealtimeData(basePrice)
    };
    
    setWatchlist([...watchlist, newStock]);
    setShowAddStock(false);
    setSearchTerm("");
  };

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(watchlist.filter(s => s.symbol !== symbol));
  };

  const filteredStocks = availableStocks.filter(stock =>
    !watchlist.find(w => w.symbol === stock.symbol) &&
    (stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
     stock.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <section id="watchlist" className="py-20 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent flex items-center gap-2">
              <Star className="h-8 w-8 text-primary" />
              My Watchlist
            </h2>
            <p className="text-muted-foreground text-lg">
              Track your favorite stocks with live updates
            </p>
          </div>
          <Button 
            onClick={() => setShowAddStock(!showAddStock)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Stock
          </Button>
        </div>

        {showAddStock && (
          <Card className="mb-8 border-primary/20">
            <CardContent className="pt-6">
              <Input
                placeholder="Search stocks by symbol or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-4"
              />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {filteredStocks.map(stock => (
                  <Button
                    key={stock.symbol}
                    variant="outline"
                    onClick={() => addToWatchlist(stock)}
                    className="justify-start"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {stock.symbol}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {watchlist.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Star className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">
                Your watchlist is empty. Add stocks to start tracking!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {watchlist.map((stock) => (
              <Card key={stock.symbol} className="shadow-card hover:shadow-hover transition-all duration-300 border-border">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-2xl font-bold">{stock.symbol}</CardTitle>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-semibold ${
                          stock.change >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                        }`}>
                          {stock.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          {stock.changePercent.toFixed(2)}%
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{stock.name}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromWatchlist(stock.symbol)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <p className="text-4xl font-bold">${stock.price.toFixed(2)}</p>
                      <p className={`text-sm font-medium ${stock.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} today
                      </p>
                      <div className="pt-4 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">High:</span>
                          <span className="font-medium">${(stock.price * 1.02).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Low:</span>
                          <span className="font-medium">${(stock.price * 0.98).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Volume:</span>
                          <span className="font-medium">{(Math.random() * 100).toFixed(1)}M</span>
                        </div>
                      </div>
                    </div>
                    <div className="lg:col-span-2 h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stock.chartData}>
                          <XAxis 
                            dataKey="time" 
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                          />
                          <YAxis 
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                            domain={['auto', 'auto']}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                              color: 'hsl(var(--foreground))'
                            }}
                            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke={stock.change >= 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))'} 
                            strokeWidth={2}
                            dot={false}
                            animationDuration={300}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
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

export default Watchlist;
