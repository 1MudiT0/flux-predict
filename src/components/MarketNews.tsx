import { Calendar, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  date: string;
  source: string;
  category: string;
}

const mockNews: NewsItem[] = [
  {
    id: 1,
    title: "Fed Signals Potential Rate Cut in Q2 2025",
    summary: "Federal Reserve hints at monetary policy shifts amid cooling inflation data, potentially benefiting growth stocks and tech sector.",
    date: "2025-11-14",
    source: "Financial Times",
    category: "Monetary Policy"
  },
  {
    id: 2,
    title: "Tech Giants Lead Market Rally as AI Spending Surges",
    summary: "Major technology companies see significant gains following announcements of increased artificial intelligence infrastructure investments.",
    date: "2025-11-13",
    source: "Bloomberg",
    category: "Technology"
  },
  {
    id: 3,
    title: "Energy Sector Rebounds on OPEC+ Production Cuts",
    summary: "Oil prices stabilize as major producers agree to extend supply restrictions through mid-2025, boosting energy stocks.",
    date: "2025-11-13",
    source: "Reuters",
    category: "Energy"
  },
  {
    id: 4,
    title: "Semiconductor Stocks Surge on Strong Demand Forecasts",
    summary: "Chip manufacturers report robust order books driven by AI chip demand and data center expansion plans worldwide.",
    date: "2025-11-12",
    source: "Wall Street Journal",
    category: "Technology"
  },
  {
    id: 5,
    title: "Healthcare Sector Gains Momentum with FDA Approvals",
    summary: "Multiple pharmaceutical companies receive regulatory approvals for breakthrough therapies, driving sector-wide optimism.",
    date: "2025-11-12",
    source: "CNBC",
    category: "Healthcare"
  },
  {
    id: 6,
    title: "Electric Vehicle Market Share Reaches New Milestone",
    summary: "EV manufacturers report record sales as charging infrastructure expansion and government incentives drive adoption.",
    date: "2025-11-11",
    source: "MarketWatch",
    category: "Automotive"
  }
];

const MarketNews = () => {
  return (
    <section id="news" className="py-20 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Market News
          </h2>
          <p className="text-muted-foreground text-lg">
            Stay informed with the latest market-moving developments
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockNews.map((news) => (
            <Card key={news.id} className="shadow-card hover:shadow-hover transition-all duration-300 border-border group">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    {news.category}
                  </span>
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {news.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  {new Date(news.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                  <span className="ml-auto text-xs">{news.source}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 line-clamp-3">
                  {news.summary}
                </p>
                <Button variant="ghost" size="sm" className="gap-2 text-primary hover:text-primary/80">
                  Read More <ExternalLink className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MarketNews;
