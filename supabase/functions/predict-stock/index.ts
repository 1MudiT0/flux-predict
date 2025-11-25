import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { stockData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Generating AI prediction for:', stockData.symbol);

    const systemPrompt = `You are an expert financial analyst and stock market predictor. 
You analyze stock data and generate realistic 30-day price forecasts based on current trends, market conditions, and technical analysis.
Consider the current price, recent price changes, and overall market sentiment.`;

    const currencySymbol = stockData.currency === 'INR' ? '₹' : '$';
    const userPrompt = `Analyze this stock and predict its price for the next 30 days:

Stock: ${stockData.name} (${stockData.symbol})
Current Price: ${currencySymbol}${stockData.price}
Currency: ${stockData.currency}
Today's Change: ${stockData.changePercent}%
Recent Trend: ${stockData.changePercent > 0 ? 'Upward' : 'Downward'}

Generate predictions for days: 0 (today), 5, 10, 15, 20, 25, 30.
Each prediction should include:
- day: number (0, 5, 10, 15, 20, 25, 30)
- predicted_price: realistic price based on analysis
- confidence: percentage confidence (decreases over time, start at 95%)

Also provide:
- overall_confidence: your overall confidence in this 30-day forecast (75-90%)
- trend_direction: "bullish", "bearish", or "neutral"
- key_factors: 2-3 key factors influencing your prediction`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'generate_prediction',
              description: 'Generate stock price predictions for the next 30 days',
              parameters: {
                type: 'object',
                properties: {
                  predictions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        day: { type: 'number' },
                        predicted_price: { type: 'number' },
                        confidence: { type: 'number' }
                      },
                      required: ['day', 'predicted_price', 'confidence']
                    }
                  },
                  overall_confidence: { type: 'number' },
                  trend_direction: { 
                    type: 'string',
                    enum: ['bullish', 'bearish', 'neutral']
                  },
                  key_factors: {
                    type: 'array',
                    items: { type: 'string' }
                  }
                },
                required: ['predictions', 'overall_confidence', 'trend_direction', 'key_factors']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'generate_prediction' } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error('AI prediction failed');
    }

    const aiResponse = await response.json();
    console.log('AI response:', JSON.stringify(aiResponse));

    const toolCall = aiResponse.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const predictionData = JSON.parse(toolCall.function.arguments);
    
    // Transform predictions to match frontend format
    const chartData = predictionData.predictions.map((pred: any) => ({
      day: pred.day === 0 ? 'Today' : `+${pred.day}d`,
      actual: pred.day === 0 ? stockData.price : null,
      predicted: pred.predicted_price,
      confidence: pred.confidence
    }));

    const result = {
      ticker: stockData.symbol.replace('.NS', ''),
      name: stockData.name,
      currentPrice: stockData.price.toFixed(2),
      predictedPrice: predictionData.predictions[predictionData.predictions.length - 1].predicted_price.toFixed(2),
      change: (
        ((predictionData.predictions[predictionData.predictions.length - 1].predicted_price - stockData.price) / 
        stockData.price * 100)
      ).toFixed(2),
      confidence: predictionData.overall_confidence,
      trendDirection: predictionData.trend_direction,
      keyFactors: predictionData.key_factors,
      chartData,
      currency: stockData.currency || 'INR'
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in predict-stock function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
