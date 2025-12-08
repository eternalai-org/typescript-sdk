/**
 * Chat Non-Streaming Live Test
 * Run: npx ts-node tests/live/chat-nonstreaming.live.ts
 */
import { getClient, printResult, printHeader, TestResult } from './_utils';

async function testChatNonStreaming(): Promise<TestResult> {
    const eai = getClient();
    const startTime = Date.now();

    try {
        const result = await eai.chat.send({
            messages: [{ role: 'user', content: 'What is 2 + 2? Answer in one word.' }],
            model: 'openai/gpt-4o-mini',
            stream: false,
        });

        const content = result.choices[0]?.message?.content || '';

        return {
            name: 'Chat Non-Streaming',
            success: true,
            responseTime: Date.now() - startTime,
            content: content,
        };
    } catch (error) {
        return {
            name: 'Chat Non-Streaming',
            success: false,
            responseTime: Date.now() - startTime,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}

async function main() {
    printHeader('Chat Non-Streaming Test');
    const result = await testChatNonStreaming();
    printResult(result);
    process.exit(result.success ? 0 : 1);
}

main();
