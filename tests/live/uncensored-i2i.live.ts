/**
 * Uncensored AI Image-to-Image Live Test
 * Run: npx ts-node tests/live/uncensored-i2i.live.ts
 */
import { getClient, printResult, printHeader, TestResult } from './_utils';
import type { ChatCompletionResponse } from '../../src/types';

async function testUncensoredI2I(): Promise<TestResult> {
    const eai = getClient();
    const startTime = Date.now();

    try {
        const result = await eai.chat.send({
            messages: [{
                role: 'user',
                content: [
                    { type: 'text', text: 'Transform this image with artistic style' },
                    { type: 'image_url', image_url: { url: 'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/e73f1f4d-16ae-46bf-8c98-970f9d95e570/original=true,quality=90/29227RGZ1J118M7X9TAAJG5MB0.jpeg', filename: 'input.jpg' } }
                ]
            }],
            model: 'uncensored-ai/uncensored-image',
            type: 'edit',
            stream: false,
        } as any) as unknown as ChatCompletionResponse;

        const imageUrl = result.choices[0]?.message?.content || '';

        return {
            name: 'Uncensored Image-to-Image',
            success: true,
            responseTime: Date.now() - startTime,
            content: imageUrl,
        };
    } catch (error) {
        return {
            name: 'Uncensored Image-to-Image',
            success: false,
            responseTime: Date.now() - startTime,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}

async function main() {
    printHeader('Uncensored AI Image-to-Image Test');
    const result = await testUncensoredI2I();
    printResult(result);
    process.exit(result.success ? 0 : 1);
}

main();
