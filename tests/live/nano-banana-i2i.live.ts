/**
 * Nano Banana Image-to-Image Live Test
 * Run: npx ts-node tests/live/nano-banana-i2i.live.ts
 */
import { getClient, printResult, printHeader, TestResult } from './_utils';
import type { ChatCompletionResponse } from '../../src/types';

async function testNanoBananaI2I(): Promise<TestResult> {
    const eai = getClient();
    const startTime = Date.now();

    try {
        const stream = await eai.chat.send({
            messages: [{
                role: 'user',
                content: [
                    { type: 'text', text: 'Transform this image into an oil painting style' },
                    { type: 'image_url', image_url: { url: 'https://picsum.photos/512/512' } }
                ]
            }],
            model: 'nano-banana/gemini-2.5-flash-image',
            stream: true,
        });

        let fullContent = '';

        for await (const chunk of stream as AsyncIterable<any>) {
            const delta = chunk.choices?.[0]?.delta;
            if (delta?.content) {
                fullContent += delta.content;
            }
        }

        return {
            name: 'Nano Banana Image-to-Image',
            success: true,
            responseTime: Date.now() - startTime,
            content: fullContent,
        };
    } catch (error) {
        return {
            name: 'Nano Banana Image-to-Image',
            success: false,
            responseTime: Date.now() - startTime,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}

async function main() {
    printHeader('Nano Banana Image-to-Image Test');
    const result = await testNanoBananaI2I();
    printResult(result);
    process.exit(result.success ? 0 : 1);
}

main();
