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
    const { symbols } = await req.json();
    console.log('Fetching stock data from Yahoo Finance for symbols:', symbols);

    // Fetch data for each symbol
    const stockPromises = symbols.map(async (symbol: string) => {
      try {
        // Yahoo Finance API v8 endpoint for quote data
        const quoteUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1d&interval=5m`;
        
        const response = await fetch(quoteUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        if (!response.ok) {
          console.log(`Failed to fetch data for ${symbol}: ${response.status}`);
          return null;
        }

        const data = await response.json();
        
        if (!data.chart?.result?.[0]) {
          console.log('No data found for symbol:', symbol);
          return null;
        }

        const result = data.chart.result[0];
        const meta = result.meta;
        const quote = result.indicators?.quote?.[0];
        
        if (!quote || !meta) {
          console.log('Invalid data structure for symbol:', symbol);
          return null;
        }

        // Current price and change
        const currentPrice = meta.regularMarketPrice || 0;
        const previousClose = meta.previousClose || currentPrice;
        const change = currentPrice - previousClose;
        const changePercent = ((change / previousClose) * 100);

        // Get chart data (last 20 points)
        const timestamps = result.timestamp || [];
        const closes = quote.close || [];
        
        const chartData = timestamps
          .slice(-20)
          .map((timestamp: number, index: number) => {
            const price = closes[closes.length - 20 + index];
            return {
              time: new Date(timestamp * 1000).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              }),
              price: price || 0
            };
          })
          .filter((point: any) => point.price > 0);

        // Determine currency (INR for .NS symbols, USD otherwise)
        const currency = meta.currency || (symbol.includes('.NS') ? 'INR' : 'USD');
        
        const stockInfo = {
          symbol: symbol,
          name: meta.shortName || meta.symbol || symbol.replace('.NS', ''),
          price: currentPrice,
          change: change,
          changePercent: changePercent,
          chartData: chartData,
          currency: currency,
          marketState: meta.marketState,
          exchange: meta.exchangeName
        };

        console.log(`Successfully fetched data for ${symbol}: ${currentPrice} ${currency}`);
        return stockInfo;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error fetching data for ${symbol}:`, errorMessage);
        return null;
      }
    });

    const results = await Promise.all(stockPromises);
    const stockData = results.filter(Boolean);

    return new Response(
      JSON.stringify({ stockData, currency: stockData[0]?.currency || 'INR' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in get-stock-data function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});