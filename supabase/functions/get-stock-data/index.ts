import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

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
    const apiKey = Deno.env.get('ALPHA_VANTAGE_API_KEY');

    if (!apiKey) {
      throw new Error('Alpha Vantage API key not configured');
    }

    console.log('Fetching stock data for symbols:', symbols);

    // First get USD to INR conversion rate
    const forexUrl = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=INR&apikey=${apiKey}`;
    const forexResponse = await fetch(forexUrl);
    const forexData = await forexResponse.json();
    
    const usdToInr = parseFloat(forexData['Realtime Currency Exchange Rate']?.['5. Exchange Rate'] || '83.0');
    console.log('USD to INR rate:', usdToInr);

    // Fetch data for each symbol
    const stockPromises = symbols.map(async (symbol: string) => {
      try {
        // Get quote data
        const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
        const quoteResponse = await fetch(quoteUrl);
        const quoteData = await quoteResponse.json();

        const quote = quoteData['Global Quote'];
        
        if (!quote || Object.keys(quote).length === 0) {
          console.log(`No data found for symbol: ${symbol}`);
          return null;
        }

        const price = parseFloat(quote['05. price'] || '0');
        const change = parseFloat(quote['09. change'] || '0');
        const changePercent = parseFloat(quote['10. change percent']?.replace('%', '') || '0');

        // Convert to INR
        const priceInr = price * usdToInr;
        const changeInr = change * usdToInr;

        // Get intraday data for chart
        const intradayUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${apiKey}`;
        const intradayResponse = await fetch(intradayUrl);
        const intradayData = await intradayResponse.json();

        const timeSeries = intradayData['Time Series (5min)'] || {};
        const chartData = Object.entries(timeSeries)
          .slice(0, 20)
          .reverse()
          .map(([time, data]: [string, any]) => ({
            time,
            price: parseFloat(data['4. close']) * usdToInr
          }));

        return {
          symbol,
          name: symbol,
          price: priceInr,
          change: changeInr,
          changePercent,
          chartData
        };
      } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
        return null;
      }
    });

    const results = await Promise.all(stockPromises);
    const stockData = results.filter(Boolean);

    return new Response(
      JSON.stringify({ stockData, currency: 'INR' }),
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