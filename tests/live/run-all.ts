/**
 * Run All Live Tests
 * Run: npx ts-node tests/live/run-all.ts
 * 
 * Or run specific category:
 *   npx ts-node tests/live/run-all.ts chat
 *   npx ts-node tests/live/run-all.ts flux
 *   npx ts-node tests/live/run-all.ts wan
 *   npx ts-node tests/live/run-all.ts uncensored
 *   npx ts-node tests/live/run-all.ts tavily
 */
import { execSync } from 'child_process';

const TESTS = {
    chat: [
        'chat-streaming.live.ts',
        'chat-nonstreaming.live.ts',
    ],
    flux: [
        'flux-t2i.live.ts',
        'flux-i2i.live.ts',
        'flux-blend.live.ts',
    ],
    wan: [
        'wan-i2v.live.ts',
    ],
    uncensored: [
        'uncensored-t2i.live.ts',
        'uncensored-i2i.live.ts',
        'uncensored-video.live.ts',
    ],
    tavily: [
        'tavily-search.live.ts',
    ],
};

function runTest(filename: string): boolean {
    console.log(`\n🏃 Running ${filename}...`);
    try {
        execSync(`npx ts-node tests/live/${filename}`, {
            stdio: 'inherit',
            cwd: process.cwd().replace('/tests/live', '')
        });
        return true;
    } catch {
        return false;
    }
}

async function main() {
    const category = process.argv[2];
    const results: { name: string; success: boolean }[] = [];

    console.log('🚀 EternalAI SDK Live Tests\n');

    const categoriesToRun = category && TESTS[category as keyof typeof TESTS]
        ? { [category]: TESTS[category as keyof typeof TESTS] }
        : TESTS;

    for (const [cat, tests] of Object.entries(categoriesToRun)) {
        console.log(`\n📦 Category: ${cat.toUpperCase()}`);
        console.log('─'.repeat(40));

        for (const test of tests) {
            const success = runTest(test);
            results.push({ name: test, success });
        }
    }

    // Summary
    console.log('\n\n' + '='.repeat(50));
    console.log('📊 SUMMARY');
    console.log('='.repeat(50));

    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    for (const r of results) {
        console.log(`${r.success ? '✅' : '❌'} ${r.name}`);
    }

    console.log(`\n🏆 ${passed}/${results.length} passed`);
    if (failed > 0) {
        console.log(`⚠️  ${failed} failed`);
    }

    process.exit(failed > 0 ? 1 : 0);
}

main();
