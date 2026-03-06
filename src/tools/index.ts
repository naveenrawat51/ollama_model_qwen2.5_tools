import ollama from "ollama";

function getCurrentTime() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  return `${hours}:${minutes}`;
}

function getOrderStatus(orderId: string) {
  console.log(`Fetching status for order ${orderId}...`);
  // Simulate fetching order status from a database or API
  const statuses = ["Processing", "Shipped", "Delivered", "Cancelled"];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  return `Order ${orderId} is currently: ${randomStatus}`;
}

async function callOllamaWithTools(
  prompt: string = "what is the status of order 1234?",
) {
  try {
    console.log("Calling Ollama with prompt:", prompt);
    const context: { role: string; content: string; tool_call_id?: string }[] =
      [
        {
          role: "system",
          content: `
                    You are an AI assistant.

                    You have access to tools.

                    Use the get_current_time tool whenever the user asks about time.
                    Use the order_status tool when user asks about orders.

                    If a tool is required, call the appropriate tool.
        `,
        },
        {
          role: "user",
          content: prompt,
        },
      ];

    let response = await ollama.chat({
      model: "qwen2.5",
      messages: context,
      tools: [
        {
          type: "function",
          function: {
            name: "get_current_time",
            description: "Returns the current time in the format HH:MM.",
            parameters: {
              type: "object",
              properties: {},
            },
          },
        },
        {
          type: "function",
          function: {
            name: "order_status",
            description: "Returns the status of a given order.",
            parameters: {
              type: "object",
              properties: {
                orderId: {
                  type: "string",
                  description: "The ID of the order to check.",
                },
              },
              required: ["orderId"],
            },
          },
        },
      ],
    });

    console.log("Ollama initial response:", response);

    const toolCalls = response.message.tool_calls;
    if (toolCalls && toolCalls.length > 0) {
      const toolCall: any = toolCalls[0];

      const toolName = toolCall.function.name;
      const args = toolCall.function.arguments;
      const id = toolCall.id;

      if (toolName === "get_current_time") {
        const currentTime = getCurrentTime();
        console.log("Current time is:", currentTime);
        context.push({
          role: "tool",
          content: currentTime,
          tool_call_id: id,
        });
      }

      if (toolName === "order_status") {
        const { orderId } = args;
        const orderStatus = getOrderStatus(orderId);
        console.log("Order status is:", orderStatus);
        context.push({
          role: "tool",
          content: orderStatus,
          tool_call_id: id,
        });
      }

      response = await ollama.chat({
        model: "qwen2.5",
        messages: context,
      });
    }
    console.log("Ollama Final response:", response);
  } catch (err) {
    console.error("Error calling Ollama:", err);
  }
}

callOllamaWithTools();

// configure chat tools (first ollama call)
// decide if tools are needed based on the prompt, and if so, which ones
// invoke the tools and get the results
// make a second call to ollama with the tool results and the original prompt to get the final response
