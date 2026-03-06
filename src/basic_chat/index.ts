import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function askAI(input: any) {
  try {
    if (process.env.USE_LOCAL_MODEL === "true") {
      const response = await fetch("http://localhost:11434/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "phi3",
          messages: [{ role: "user", content: input }],
          stream: false,
        }),
      });

      const data = await response.json();
      return data.message.content;
    } else {
      const response = await openai.responses.create({
        model: "gpt-5.2",
        input: input,
      });

      return response.output_text;
    }
  } catch (error) {
    console.log("Other error:", error.message);
  }
}

process.stdin.addListener("data", async (data) => {
  const userInput = data.toString().trim();
  const aiResponse = await askAI(userInput);
  console.log("AI:", aiResponse);
});
