import 'dotenv/config';
import { EternalAPI } from '@eternalai-org/typescript-sdk';

async function main() {
    const apiKey = process.env.ETERNALAI_API_KEY;
    if (!apiKey) {
        console.error('Error: ETERNALAI_API_KEY environment variable is required');
        process.exit(1);
    }

    const eternalApi = new EternalAPI({ apiKey });

    console.log('Sending non-streaming chat request...\n');

    const result = await eternalApi.chat.send({
        messages: [
            {
                role: 'system',
                content: 'You are a helpful assistant.',
            },
            {
                role: 'user',
                content: 'What is the capital of France?',
            },
        ],
        model: 'openai/gpt-5.1',
        stream: false,
    });

    // Properly typed with method overloads - no type assertion needed
    console.log('Response:', result.choices[0].message.content);
    console.log('\nModel:', result.model);
    console.log('Tokens used:', result.usage?.total_tokens);
}

main().catch((error) => {
    console.error('Error:', error.message);
    process.exit(1);
});
