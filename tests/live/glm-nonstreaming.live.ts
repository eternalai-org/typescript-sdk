/**
 * GLM Non-Streaming Live Test
 * Run: npx ts-node tests/live/glm-nonstreaming.live.ts
 */
import { getClient, printResult, printHeader, TestResult } from './_utils';

async function testGlmNonStreaming(): Promise<TestResult> {
    const eai = getClient();
    const startTime = Date.now();

    try {
        const result = await eai.chat.send({
            messages: [
                { role: 'system', content: 'You are a helpful AI assistant.' },
                { role: 'user', content: 'Say "Hello World" in 3 different languages' }
            ],
            model: 'glm/glm-4.5-flash',
            stream: false,
        });

        const content = result.choices[0]?.message?.content || '';
        console.log('Response:', content);
        console.log('\n');

        return {
            name: 'GLM Non-Streaming',
            success: true,
            responseTime: Date.now() - startTime,
            content: content,
        };
    } catch (error) {
        return {
            name: 'GLM Non-Streaming',
            success: false,
            responseTime: Date.now() - startTime,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}

async function main() {
    printHeader('GLM Non-Streaming Test');
    const result = await testGlmNonStreaming();
    printResult(result);
    process.exit(result.success ? 0 : 1);
}

main();
