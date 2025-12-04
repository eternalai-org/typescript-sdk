import 'dotenv/config';
import { EternalAI } from '@eternalai-org/sdk';

async function main() {
    const apiKey = process.env.ETERNALAI_API_KEY;
    if (!apiKey) {
        console.error('Error: ETERNALAI_API_KEY environment variable is required');
        process.exit(1);
    }

    const eai = new EternalAI({ apiKey });

    console.log('Sending streaming chat request...\n');

    const result = await eai.chat.send({
        messages: [
            {
                role: 'user',
                content: 'Write a short poem about TypeScript',
            },
        ],
        model: 'openai/gpt-5.1',
        stream: true,
    });

    // Handle streaming response - properly typed with method overloads
    process.stdout.write('Response: ');
    for await (const chunk of result) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
            process.stdout.write(content);
        }
    }
    console.log('\n\nDone!');
}

main().catch((error) => {
    console.error('Error:', error.message);
    process.exit(1);
});
