/**
 * Uncensored AI Video Generation Live Test
 * Run: npx ts-node tests/live/uncensored-video.live.ts
 */
import { getClient, printResult, printHeader, TestResult } from './_utils';
import type { ChatCompletionResponse } from '../../src/types';

async function testUncensoredVideo(): Promise<TestResult> {
    const eai = getClient();
    const startTime = Date.now();

    try {
        const result = await eai.chat.send({
            messages: [{
                role: 'user',
                content: [
                    { type: 'text', text: 'Animate this image with smooth motion' },
                    { type: 'image_url', image_url: { url: 'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/e73f1f4d-16ae-46bf-8c98-970f9d95e570/original=true,quality=90/29227RGZ1J118M7X9TAAJG5MB0.jpeg' } }
                ]
            }],
            model: 'uncensored-ai/uncensored-video',
            type: 'edit',
            is_magic_prompt: true,
            duration: 5,
            audio: false,
            stream: false,
        } as any) as unknown as ChatCompletionResponse;

        const videoUrl = result.choices[0]?.message?.content || '';

        return {
            name: 'Uncensored Video',
            success: true,
            responseTime: Date.now() - startTime,
            content: videoUrl,
        };
    } catch (error) {
        return {
            name: 'Uncensored Video',
            success: false,
            responseTime: Date.now() - startTime,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}

async function main() {
    printHeader('Uncensored AI Video Test');
    console.log('⏳ This may take several minutes...\n');
    const result = await testUncensoredVideo();
    printResult(result);
    process.exit(result.success ? 0 : 1);
}

main();
