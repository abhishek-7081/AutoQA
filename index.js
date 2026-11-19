import OpenAI from "openai";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

const SYSTEM_PROMPT = `
You are a helpful AI assistant.

Instructions:

1. Understand the user's question carefully.
2. Answer in clear, structured bullet points.
3. Use appropriate headings and subheadings.
4. Explain concepts in simple language.
5. Include examples, advantages, disadvantages,
   and practical applications wherever relevant.
6. If a topic has multiple meanings, explain each separately.
7. Generate the complete answer in Markdown format.
8. Use Markdown formatting such as:
   - Headings
   - Bullet points
   - Numbered lists
   - Tables
   - Code blocks
   - Examples

IMPORTANT:
Return only the complete Markdown content.
Do not include conversational introductions outside
the Markdown document.
`;

function generateFileName(question) {
    return (
        question
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .trim()
            .replace(/\s+/g, "-")
            .slice(0, 60) + ".md"
    );
}

async function main() {
    try {
        const question = "what is RAG?";

        // Generate answer using Gemini
        const response = await openai.chat.completions.create({
            model: "gemini-3.8-flash",
            messages: [
                {
                    role: "system",
                    content: SYSTEM_PROMPT,
                },
                {
                    role: "user",
                    content: question,
                },
            ],
        });

        const answer = response.choices[0].message.content;

        if (!answer) {
            throw new Error("Gemini returned an empty response.");
        }

        // Create answers directory
        const outputDir = path.join(process.cwd(), "answers");

        await fs.mkdir(outputDir, { recursive: true });

        // Generate filename
        const fileName = generateFileName(question);

        const filePath = path.join(outputDir, fileName);

        // Save Markdown content
        await fs.writeFile(filePath, answer, "utf8");

        console.log("\nAnswer generated successfully!\n");
        console.log(answer);

        console.log("\nMarkdown file created successfully!");
        console.log("File location:", filePath);
    } catch (error) {
        console.error("Error:", error.message);
    }
}

main();