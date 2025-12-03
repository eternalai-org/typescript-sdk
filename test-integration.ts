import { EternalAPI } from './src/index';

async function testStreaming() {
    console.log('=== Testing Streaming Chat ===\n');

    const eternalApi = new EternalAPI({
        apiKey: 'open_ec61ed7c2affb0383465bd6afbb824e4c760414d622c9f6fa022a532dbd0586e',
    });

    try {
        const result = await eternalApi.chat.send({
            messages: [
                {
                    role: 'assistant',
                    content: 'You are a helpful assistant.',
                },
                {
                    role: 'user',
                    content: 'Hello!',
                },
            ],
            model: 'gpt-4o-mini',
            stream: true,
        });

        console.log('Response (streaming):');
        process.stdout.write('> ');

        for await (const chunk of result) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
                process.stdout.write(content);
            }
        }

        console.log('\n\n✅ Streaming test passed!\n');
    } catch (error) {
        console.error('❌ Error:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}

async function testNonStreaming() {
    console.log('=== Testing Non-Streaming Chat ===\n');

    const eternalApi = new EternalAPI({
        apiKey: 'open_ec61ed7c2affb0383465bd6afbb824e4c760414d622c9f6fa022a532dbd0586e',
    });

    try {
        const result = await eternalApi.chat.send({
            messages: [
                {
                    role: 'assistant',
                    content: 'You are a helpful assistant.',
                },
                {
                    role: 'user',
                    content: 'Say "Hello from EternalAI SDK!"',
                },
            ],
            model: 'gpt-4o-mini',
            stream: false,
        });

        console.log('Response (non-streaming):');
        console.log('>', result.choices[0].message.content);
        console.log('\nModel:', result.model);
        if (result.usage) {
            console.log('Tokens used:', result.usage.total_tokens);
        }

        console.log('\n✅ Non-streaming test passed!\n');
    } catch (error) {
        console.error('❌ Error:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}

async function main() {
    console.log('\n🚀 EternalAI SDK Integration Test\n');
    console.log('API Endpoint: https://open.eternalai.org/api/v1\n');
    console.log('='.repeat(50) + '\n');

    await testStreaming();
    await testNonStreaming();

    console.log('='.repeat(50));
    console.log('\n✅ All tests completed successfully!\n');
}

main().catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
});
