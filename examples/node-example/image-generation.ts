import 'dotenv/config';
import { EternalAI } from '@eternalai-org/sdk';

async function main() {
    const apiKey = process.env.ETERNALAI_API_KEY;
    if (!apiKey) {
        console.error('Error: ETERNALAI_API_KEY environment variable is required');
        process.exit(1);
    }

    const eai = new EternalAI({ apiKey });

    console.log('Sending image generation request with image_config...\n');

    const result = await eai.chat.send({
        messages: [
            {
                role: 'user',
                content: 'Generate a beautiful landscape image',
            },
        ],
        model: 'image-generation-model', // Replace with actual image generation model
        image_config: {
            aspect_ratio: '16:9', // Optional: '16:9', '1:1', '9:16', etc.
        },
        stream: false,
    });

    // Properly typed with method overloads
    console.log('Response:', result.choices[0].message.content);
    console.log('\nModel:', result.model);
    if (result.usage) {
        console.log('Tokens used:', result.usage.total_tokens);
    }
}

main().catch((error) => {
    console.error('Error:', error.message);
    process.exit(1);
});

