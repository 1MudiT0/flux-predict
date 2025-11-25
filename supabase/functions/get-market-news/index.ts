import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching market news from Yahoo Finance');

    // Yahoo Finance news endpoint - Get general market news
    const newsUrl = 'https://query2.finance.yahoo.com/v1/finance/search?q=stock%20market&quotesCount=0&newsCount=10&enableFuzzyQuery=false&newsQueryConfiguration.quoteFeed=VIDEO,STORY';
    
    const response = await fetch(newsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance API returned ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.news || data.news.length === 0) {
      throw new Error('No news data found');
    }

    // Transform Yahoo Finance news to our format
    const newsItems = data.news.slice(0, 6).map((item: any, index: number) => {
      // Extract category from related tickers or use default
      const category = item.relatedTickers?.[0] || 'Market';
      
      // Format the date
      const date = new Date(item.providerPublishTime * 1000).toISOString().split('T')[0];
      
      return {
        id: index + 1,
        title: item.title,
        summary: item.summary || item.title.substring(0, 150) + '...',
        date: date,
        source: item.publisher || 'Yahoo Finance',
        category: category,
        url: item.link
      };
    });

    console.log(`Successfully fetched ${newsItems.length} news items`);

    return new Response(
      JSON.stringify({ news: newsItems }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in get-market-news function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
