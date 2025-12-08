/**
 * Chat Streaming Live Test
 * Run: npx ts-node tests/live/chat-streaming.live.ts
 */
import { getClient, printResult, printHeader, TestResult } from './_utils';

async function testChatStreaming(): Promise<TestResult> {
    const eai = getClient();
    const startTime = Date.now();

    try {
        const result = await eai.chat.send({
            messages: [{ role: 'user', content: 'Say "Hello World" in 3 different languages' }],
            model: 'openai/gpt-4o-mini',
            stream: true,
        });

        let content = '';
        for await (const chunk of result) {
            const delta = chunk.choices[0]?.delta?.content || '';
            content += delta;
            process.stdout.write(delta);
        }
        console.log('\n');

        return {
            name: 'Chat Streaming',
            success: true,
            responseTime: Date.now() - startTime,
            content: content,
        };
    } catch (error) {
        return {
            name: 'Chat Streaming',
            success: false,
            responseTime: Date.now() - startTime,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}

async function main() {
    printHeader('Chat Streaming Test');
    const result = await testChatStreaming();
    printResult(result);
    process.exit(result.success ? 0 : 1);
}

main();
