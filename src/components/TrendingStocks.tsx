import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis } from "recharts";

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  chartData: { value: number }[];
}

const mockStocks: Stock[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 178.45,
    change: 2.34,
    changePercent: 1.33,
    chartData: [{ value: 175 }, { value: 176 }, { value: 174 }, { value: 177 }, { value: 178.45 }]
  },
  {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    price: 242.68,
    change: -3.21,
    changePercent: -1.31,
    chartData: [{ value: 248 }, { value: 246 }, { value: 245 }, { value: 244 }, { value: 242.68 }]
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    price: 412.89,
    change: 5.67,
    changePercent: 1.39,
    chartData: [{ value: 408 }, { value: 409 }, { value: 410 }, { value: 411 }, { value: 412.89 }]
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    price: 498.32,
    change: 12.45,
    changePercent: 2.56,
    chartData: [{ value: 485 }, { value: 488 }, { value: 492 }, { value: 495 }, { value: 498.32 }]
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    price: 145.23,
    change: 1.89,
    changePercent: 1.32,
    chartData: [{ value: 143 }, { value: 144 }, { value: 143.5 }, { value: 144.8 }, { value: 145.23 }]
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 138.76,
    change: -0.98,
    changePercent: -0.70,
    chartData: [{ value: 140 }, { value: 139.5 }, { value: 139 }, { value: 139.2 }, { value: 138.76 }]
  }
];

const TrendingStocks = () => {
  return (
    <section id="trending" className="py-20 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Trending Stocks
          </h2>
          <p className="text-muted-foreground text-lg">
            Most popular stocks tracked in real-time
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockStocks.map((stock) => (
            <Card key={stock.symbol} className="shadow-card hover:shadow-hover transition-all duration-300 border-border overflow-hidden group">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl font-bold">{stock.symbol}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{stock.name}</p>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-semibold ${
                    stock.change >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                  }`}>
                    {stock.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {stock.changePercent.toFixed(2)}%
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-3xl font-bold">${stock.price.toFixed(2)}</p>
                    <p className={`text-sm font-medium ${stock.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} today
                    </p>
                  </div>
                  <div className="h-20">
                    <ChartContainer
                      config={{
                        value: {
                          label: "Price",
                          color: stock.change >= 0 ? "hsl(var(--success))" : "hsl(var(--destructive))",
                        },
                      }}
                      className="h-full w-full"
                    >
                      <LineChart data={stock.chartData}>
                        <XAxis dataKey="index" hide />
                        <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke={stock.change >= 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))'} 
                          strokeWidth={2}
                          dot={false}
                          animationDuration={300}
                        />
                      </LineChart>
                    </ChartContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingStocks;
