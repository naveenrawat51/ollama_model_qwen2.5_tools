# Ollama + Qwen2.5 Tools Example

This project demonstrates how to:

1. Install **Ollama**
2. Run **Qwen2.5 locally**
3. Use **tool/function calling with parameters**

---

# 1. Install Ollama

Ollama allows you to run Large Language Models locally.

### Windows

Download and install from:

https://ollama.com/download

After installation verify:

```bash
ollama --version
```

### Mac

```bash
brew install ollama
```

### Linux

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

---

# 2. Install Qwen2.5 Locally

Pull the model using Ollama.

```bash
ollama pull qwen2.5
```

Verify installation:

```bash
ollama list
```

You should see:

```
qwen2.5
```

Run the model interactively:

```bash
ollama run qwen2.5
```

Example prompt:

```
What is the capital of India?
```

---

# 3. Using Tools (Function Calling)

Ollama supports tool/function calling similar to OpenAI.

### Example Tool Definition

```javascript
const tools = [
  {
    type: "function",
    function: {
      name: "get_current_time",
      description: "Returns the current time",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
];
```

---

### Calling Ollama with Tools

```javascript
import ollama from "ollama";

const response = await ollama.chat({
  model: "qwen2.5",
  messages: [
    {
      role: "user",
      content: "What time is it?",
    },
  ],
  tools: tools,
});
```

---

### Example Tool Response

If the model decides to use a tool, the response will contain `tool_calls`:

```json
{
  "message": {
    "role": "assistant",
    "tool_calls": [
      {
        "function": {
          "name": "get_current_time",
          "arguments": {}
        }
      }
    ]
  }
}
```

---

### Execute the Tool

Example implementation:

```javascript
function getCurrentTime() {
  return new Date().toLocaleTimeString();
}
```

Handle tool calls:

```javascript
const toolCall = response.message.tool_calls[0];
const toolName = toolCall.function.name;

let result;

if (toolName === "get_current_time") {
  result = getCurrentTime();
}
```

---

### Send Tool Result Back to Model

```javascript
messages.push(response.message);

messages.push({
  role: "tool",
  content: result,
});

const finalResponse = await ollama.chat({
  model: "qwen2.5",
  messages,
});
```

---

# Example Use Case

User asks:

```
What is the current time?
```

Flow:

1. Model decides to call `get_current_time`
2. Your application executes the function
3. Result is sent back to the model
4. Model returns final response

---

# Requirements

* Node.js 18+
* Ollama installed
* Qwen2.5 model downloaded

---

# References

Ollama Documentation
https://github.com/ollama/ollama

Qwen Model
https://ollama.com/library/qwen2.5
