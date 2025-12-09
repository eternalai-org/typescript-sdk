/**
 * Wan Image-to-Video Live Test
 * Run: npx ts-node tests/live/wan-i2v.live.ts
 */
import { getClient, printResult, printHeader, TestResult } from './_utils';
import type { ChatCompletionResponse } from '../../src/types';

async function testWanI2V(): Promise<TestResult> {
    const eai = getClient();
    const startTime = Date.now();

    try {
        const result = await eai.chat.send({
            messages: [{
                role: 'user',
                content: [
                    { type: 'text', text: 'The dad and son in a boat on the ocean' },
                    { type: 'image_url', image_url: { url: 'https://cdn.eternalai.org/agents/1765262355579_1765262355.png' } }
                ]
            }],
            model: 'wan/wan2.5-i2v-preview',
            resolution: '480P',
            duration: 5,
            prompt_extend: true,
            stream: false,
        } as any) as unknown as ChatCompletionResponse;

        const videoUrl = result.choices[0]?.message?.content || '';

        return {
            name: 'Wan Image-to-Video',
            success: true,
            responseTime: Date.now() - startTime,
            content: videoUrl,
        };
    } catch (error) {
        return {
            name: 'Wan Image-to-Video',
            success: false,
            responseTime: Date.now() - startTime,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}

async function main() {
    printHeader('Wan Image-to-Video Test');
    console.log('⏳ This may take 5-10 minutes...\n');
    const result = await testWanI2V();
    printResult(result);
    process.exit(result.success ? 0 : 1);
}

main();
