/**
 * Flux Text-to-Image Live Test
 * Run: npx ts-node tests/live/flux-t2i.live.ts
 */
import { getClient, printResult, printHeader, TestResult } from './_utils';
import type { ChatCompletionResponse } from '../../src/types';

async function testFluxT2I(): Promise<TestResult> {
    const eai = getClient();
    const startTime = Date.now();

    try {
        const result = await eai.chat.send({
            messages: [{ role: 'user', content: 'Cinematic shot of a futuristic city at sunset, 85mm lens' }],
            model: 'flux/flux-2-pro',
            width: 1024,
            height: 1024,
            safety_tolerance: 2,
            stream: false,
        } as any) as unknown as ChatCompletionResponse;

        const imageUrl = result.choices[0]?.message?.content || '';

        return {
            name: 'Flux Text-to-Image',
            success: true,
            responseTime: Date.now() - startTime,
            content: imageUrl,
        };
    } catch (error) {
        return {
            name: 'Flux Text-to-Image',
            success: false,
            responseTime: Date.now() - startTime,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}

async function main() {
    printHeader('Flux Text-to-Image Test');
    const result = await testFluxT2I();
    printResult(result);
    process.exit(result.success ? 0 : 1);
}

main();
