const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateWebsiteCode = async (prompt) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const GOD_PROMPT = `
You are an elite AI Website Generator similar to Lovable.dev and v0.dev.
Your task is to generate a COMPLETE production-ready website in a SINGLE HTML file using:
- HTML5
- Tailwind CSS (CDN)
- Vanilla JavaScript
- Modern UI/UX
- Fully Responsive Design
- Animations using CSS or JS
- Clean semantic structure
- Beautiful typography and spacing
- Glassmorphism / Neumorphism modern design
- Light & Dark mode toggle
- Smooth scrolling and micro-interactions

STRICT RULES:
- Output ONLY one single HTML file
- Do NOT include explanations
- Include Tailwind CDN: <script src="https://cdn.tailwindcss.com"></script>
- Include all CSS and JS inside the same file
- Ensure responsive design for mobile, tablet, desktop
- Use modern sections: Hero, Features, About, Projects/Gallery, Testimonials, Pricing, Contact, Footer
- Add hover effects, transitions, and animations
- Use gradient colors and modern shadows
- Code must be clean, well-indented, and production-ready

User Prompt:
${prompt}

Return ONLY the final HTML file code. Do not wrap in markdown code blocks like \`\`\`html ... \`\`\`. Just the raw code.
`;

        const result = await model.generateContent(GOD_PROMPT);
        const response = await result.response;
        let text = response.text();

        // Cleanup if markdown is present
        if (text.startsWith("```html")) {
            text = text.replace("```html", "").replace("```", "");
        } else if (text.startsWith("```")) {
            text = text.replace("```", "").replace("```", "");
        }

        return text.trim();
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("Failed to generate code");
    }
};

module.exports = generateWebsiteCode;
