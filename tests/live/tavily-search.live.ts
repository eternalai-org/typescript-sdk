/**
 * Tavily Search Live Test
 * Run: npx ts-node tests/live/tavily-search.live.ts
 */
import { getClient, printResult, printHeader, TestResult } from './_utils';
import type { ChatCompletionResponse } from '../../src/types';

async function testTavilySearch(): Promise<TestResult> {
    const eai = getClient();
    const startTime = Date.now();

    try {
        const result = await eai.chat.send({
            messages: [{ role: 'user', content: 'Latest AI news in December 2024' }],
            model: 'tavily/search',
            stream: false,
        } as any) as unknown as ChatCompletionResponse;

        const content = result.choices[0]?.message?.content || '';

        return {
            name: 'Tavily Search',
            success: true,
            responseTime: Date.now() - startTime,
            content: content,
        };
    } catch (error) {
        return {
            name: 'Tavily Search',
            success: false,
            responseTime: Date.now() - startTime,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}

async function main() {
    printHeader('Tavily Search Test');
    const result = await testTavilySearch();
    printResult(result);
    process.exit(result.success ? 0 : 1);
}

main();
