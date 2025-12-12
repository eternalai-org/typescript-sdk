/**
 * GLM Streaming Live Test
 * Run: npx ts-node tests/live/glm-streaming.live.ts
 */
import { getClient, printResult, printHeader, TestResult } from './_utils';

async function testGlmStreaming(): Promise<TestResult> {
    const eai = getClient();
    const startTime = Date.now();

    try {
        const result = await eai.chat.send({
            messages: [
                { role: 'system', content: 'You are a helpful AI assistant.' },
                { role: 'user', content: 'Say "Hello World" in 3 different languages' }
            ],
            model: 'glm/glm-4.5-flash',
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
            name: 'GLM Streaming',
            success: true,
            responseTime: Date.now() - startTime,
            content: content,
        };
    } catch (error) {
        return {
            name: 'GLM Streaming',
            success: false,
            responseTime: Date.now() - startTime,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}

async function main() {
    printHeader('GLM Streaming Test');
    const result = await testGlmStreaming();
    printResult(result);
    process.exit(result.success ? 0 : 1);
}

main();
