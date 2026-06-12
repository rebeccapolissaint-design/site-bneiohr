export default {
  async fetch(request, env) {

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    // Only accept POST
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    // Read request body (format Anthropic ki soti nan HTML yo)
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Konvèti format Anthropic → format Gemini
    const geminiBody = {
      contents: body.messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      })),
      generationConfig: {
        maxOutputTokens: body.max_tokens || 1000
      }
    };

    // Call Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key= AQ.Ab8RN6IxbbFNIrp4XQz2JpEtBtI5AUbCFhNMBd44pIbppQc_GQ`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiBody)
    });

    const geminiData = await response.json();

    // Konvèti repons Gemini → format Anthropic pou HTML yo pa bezwen chanje
    const anthropicFormat = {
      content: [{
        type: 'text',
        text: geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'Pa gen repons.'
      }]
    };

    return new Response(JSON.stringify(anthropicFormat), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};
