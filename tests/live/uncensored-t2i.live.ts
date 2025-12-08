/**
 * Uncensored AI Text-to-Image Live Test
 * Run: npx ts-node tests/live/uncensored-t2i.live.ts
 */
import { getClient, printResult, printHeader, TestResult } from './_utils';
import type { ChatCompletionResponse } from '../../src/types';

async function testUncensoredT2I(): Promise<TestResult> {
    const eai = getClient();
    const startTime = Date.now();

    try {
        const result = await eai.chat.send({
            messages: [{ role: 'user', content: [{ type: 'text', text: 'A beautiful sunset over the ocean' }] }],
            model: 'uncensored-ai/uncensored-image',
            type: 'new',
            stream: false,
        } as any) as unknown as ChatCompletionResponse;

        const imageUrl = result.choices[0]?.message?.content || '';

        return {
            name: 'Uncensored Text-to-Image',
            success: true,
            responseTime: Date.now() - startTime,
            content: imageUrl,
        };
    } catch (error) {
        return {
            name: 'Uncensored Text-to-Image',
            success: false,
            responseTime: Date.now() - startTime,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}

async function main() {
    printHeader('Uncensored AI Text-to-Image Test');
    const result = await testUncensoredT2I();
    printResult(result);
    process.exit(result.success ? 0 : 1);
}

main();
