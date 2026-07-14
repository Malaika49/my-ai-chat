export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1]?.content || "there";

    const encoder = new TextEncoder();
    
    // Standard Javascript ReadableStream standard response browser ke liye
    const customStream = new ReadableStream({
      async start(controller) {
        const responseText = `Hello! 🌟 You said: "${lastMessage}". Let's write some Python code today!\n\n` +
          `Here is a quick example for you:\n` +
          `\`\`\`python\n` +
          `def greet(name):\n` +
          `    print(f"Hello, {name}!")\n\n` +
          `greet("Python Developer")\n` +
          `\`\`\`\n\n` +
          `This real-time response is streaming token-by-token. Try scrolling up to test auto-scroll, or press the "Stop" button!`;

        const words = responseText.split(" ");
        for (const word of words) {
          // Send words chunk by chunk
          controller.enqueue(encoder.encode(word + " "));
          await new Promise((resolve) => setTimeout(resolve, 70)); // Smooth simulation delay
        }
        controller.close();
      },
    });

    return new Response(customStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error("API Route Error:", error);
    return new Response(JSON.stringify({ error: "API connection failed" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}