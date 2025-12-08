/**
 * Shared utilities for live API tests
 */
import { EternalAI } from '../../src/index';

export interface TestResult {
    name: string;
    success: boolean;
    responseTime: number;
    content?: string;
    error?: string;
}

export function getClient(): EternalAI {
    const apiKey = process.env.ETERNALAI_API_KEY;
    if (!apiKey) {
        console.error('❌ ETERNALAI_API_KEY not set');
        process.exit(1);
    }
    return new EternalAI({ apiKey });
}

export function printResult(result: TestResult): void {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name} (${result.responseTime}ms)`);
    if (result.content) {
        const preview = result.content.length > 100
            ? result.content.substring(0, 100) + '...'
            : result.content;
        console.log(`   📝 ${preview}`);
    }
    if (result.error) {
        console.log(`   ❌ ${result.error}`);
    }
}

export function printHeader(title: string): void {
    console.log('\n' + '='.repeat(50));
    console.log(`🧪 ${title}`);
    console.log('='.repeat(50));
}
