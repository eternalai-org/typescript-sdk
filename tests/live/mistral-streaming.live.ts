/**
 * Mistral AI Streaming Live Test
 * Run: npx ts-node tests/live/mistral-streaming.live.ts
 */
import { getClient, printResult, printHeader, TestResult } from './_utils';

async function testMistralStreaming(): Promise<TestResult> {
    const eai = getClient();
    const startTime = Date.now();

    try {
        const result = await eai.chat.send({
            messages: [
                { role: 'user', content: 'Who is the most renowned French painter?' }
            ],
            model: 'mistralai/devstral-2512',
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
            name: 'Mistral Streaming',
            success: true,
            responseTime: Date.now() - startTime,
            content: content,
        };
    } catch (error) {
        return {
            name: 'Mistral Streaming',
            success: false,
            responseTime: Date.now() - startTime,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}

async function main() {
    printHeader('Mistral AI Streaming Test');
    const result = await testMistralStreaming();
    printResult(result);
    process.exit(result.success ? 0 : 1);
}

main();
