/**
 * Flux Blend (2 Images) Live Test
 * Run: npx ts-node tests/live/flux-blend.live.ts
 */
import { getClient, printResult, printHeader, TestResult } from './_utils';
import type { ChatCompletionResponse } from '../../src/types';

async function testFluxBlend(): Promise<TestResult> {
    const eai = getClient();
    const startTime = Date.now();

    try {
        const result = await eai.chat.send({
            messages: [{
                role: 'user',
                content: [
                    { type: 'text', text: 'Blend subject from first image with artistic style from second' },
                    { type: 'image_url', image_url: { url: 'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/e73f1f4d-16ae-46bf-8c98-970f9d95e570/original=true,quality=90/29227RGZ1J118M7X9TAAJG5MB0.jpeg' } },
                    { type: 'image_url', image_url: { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg' } }
                ]
            }],
            model: 'flux/flux-2-pro',
            width: 1024,
            height: 1024,
            stream: false,
        } as any) as unknown as ChatCompletionResponse;

        const imageUrl = result.choices[0]?.message?.content || '';

        return {
            name: 'Flux Blend (2 Images)',
            success: true,
            responseTime: Date.now() - startTime,
            content: imageUrl,
        };
    } catch (error) {
        return {
            name: 'Flux Blend (2 Images)',
            success: false,
            responseTime: Date.now() - startTime,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}

async function main() {
    printHeader('Flux Blend (2 Images) Test');
    const result = await testFluxBlend();
    printResult(result);
    process.exit(result.success ? 0 : 1);
}

main();
