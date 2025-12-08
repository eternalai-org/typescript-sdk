/**
 * Nano Banana Text-to-Image Live Test
 * Run: npx ts-node tests/live/nano-banana-t2i.live.ts
 */
import { getClient, printResult, printHeader, TestResult } from './_utils.ts';
import type { ChatCompletionResponse } from '../../src/types/index.ts';

async function testNanoBananaT2I(): Promise<TestResult> {
    const eai = getClient();
    const startTime = Date.now();

    try {
        const result = await eai.chat.send({
            messages: [{ role: 'user', content: 'A beautiful mountain landscape at dawn with vibrant colors' }],
            model: 'nano-banana/gemini-2.5-flash-image',
            stream: false,
        }) as ChatCompletionResponse;

        const imageUrl = result.choices[0]?.message?.content || '';

        return {
            name: 'Nano Banana Text-to-Image',
            success: true,
            responseTime: Date.now() - startTime,
            content: imageUrl,
        };
    } catch (error) {
        return {
            name: 'Nano Banana Text-to-Image',
            success: false,
            responseTime: Date.now() - startTime,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}

async function main() {
    printHeader('Nano Banana Text-to-Image Test');
    const result = await testNanoBananaT2I();
    printResult(result);
    process.exit(result.success ? 0 : 1);
}

main();
