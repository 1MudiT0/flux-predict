import { useState, useEffect } from "react";
import { Calendar, ExternalLink, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  date: string;
  source: string;
  category: string;
  url?: string;
}

const MarketNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchNews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-market-news');
      
      if (error) throw error;
      
      if (data?.news) {
        setNews(data.news);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      toast({
        title: "Failed to load news",
        description: "Unable to fetch latest market news. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <section id="news" className="py-20 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h2 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Market News
            </h2>
            <Button
              onClick={fetchNews}
              variant="outline"
              size="sm"
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <p className="text-muted-foreground text-lg">
            Stay informed with the latest market-moving developments
          </p>
        </div>

        {loading && news.length === 0 ? (
          <div className="text-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">Loading latest news...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((newsItem) => (
              <Card key={newsItem.id} className="shadow-card hover:shadow-hover transition-all duration-300 border-border group">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      {newsItem.category}
                    </span>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {newsItem.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    {new Date(newsItem.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                    <span className="ml-auto text-xs">{newsItem.source}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {newsItem.summary}
                  </p>
                  {newsItem.url && (
                    <a href={newsItem.url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm" className="gap-2 text-primary hover:text-primary/80">
                        Read More <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
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

export default MarketNews;
