import { EternalAI } from './src/index';
import * as fs from 'fs';

const MODELS_TO_TEST = [
    'anthropic/claude-opus-4-5',
    'openai/gpt-5.1',
    'gemini/gemini-2.5-flash',
    'xai/grok-4-1-fast',
    'qwen/qwen-flash-2025-07-28',
    'tavily/search', // Tavily search (non-streaming only)
];

// Nano-Banana custom endpoint models (using nano-banana/ prefix)
const NANO_BANANA_MODELS = [
    'nano-banana/gemini-2.5-flash-image',
];

// Uncensored AI models (using uncensored-ai/ prefix)
const UNCENSORED_AI_MODELS = [
    'uncensored-ai/uncensored-image',
    'uncensored-ai/uncensored-video',
];

interface TestResult {
    model: string;
    success: boolean;
    responseTime: number;
    content?: string;
    error?: string;
}

async function testModelStreaming(eternalApi: EternalAI, model: string): Promise<TestResult> {
    console.log(`\n🔄 Testing model (streaming): ${model}`);
    const startTime = Date.now();

    try {
        const result = await eternalApi.chat.send({
            messages: [
                {
                    role: 'user',
                    content: 'Say "Hello from EternalAI streaming!" in exactly 5 words.',
                },
            ],
            model: model,
            stream: true,
        });

        let content = '';
        let chunkCount = 0;

        for await (const chunk of result) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) {
                content += delta;
                chunkCount++;
            }
        }

        const responseTime = Date.now() - startTime;

        console.log(`   ✅ Success! Response time: ${responseTime}ms, Chunks: ${chunkCount}`);
        console.log(`   📝 Response: "${content.substring(0, 100)}${content.length > 100 ? '...' : ''}"`);

        return {
            model,
            success: true,
            responseTime,
            content,
        };
    } catch (error) {
        const responseTime = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : String(error);

        console.log(`   ❌ Failed! Error: ${errorMessage}`);

        return {
            model,
            success: false,
            responseTime,
            error: errorMessage,
        };
    }
}

async function testModelNonStreaming(eternalApi: EternalAI, model: string): Promise<TestResult> {
    console.log(`\n🔍 Testing model (non-streaming): ${model}`);
    const startTime = Date.now();

    try {
        const result = await eternalApi.chat.send({
            messages: [
                {
                    role: 'user',
                    content: 'Who is Leo Messi?',
                },
            ],
            model: model,
            stream: false,
        });

        const responseTime = Date.now() - startTime;
        const content = result.choices[0]?.message?.content || '';

        console.log(`   ✅ Success! Response time: ${responseTime}ms`);
        console.log(`   📝 Response: "${content.substring(0, 200)}${content.length > 200 ? '...' : ''}"`);

        return {
            model,
            success: true,
            responseTime,
            content,
        };
    } catch (error) {
        const responseTime = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : String(error);

        console.log(`   ❌ Failed! Error: ${errorMessage}`);

        return {
            model,
            success: false,
            responseTime,
            error: errorMessage,
        };
    }
}

async function testNanoBananaText(eternalApi: EternalAI, model: string): Promise<TestResult> {
    console.log(`\n🍌 Testing NanoBanana (text via chat.send): ${model}`);
    const startTime = Date.now();

    try {
        // Using chat.send() - model prefix nano-banana/ is auto-detected
        const result = await eternalApi.chat.send({
            messages: [
                {
                    role: 'user',
                    content: 'Say "Hello from NanoBanana!" in exactly 5 words.',
                },
            ],
            model: model,
        });

        const responseTime = Date.now() - startTime;
        const content = result.choices[0]?.message?.content || '';

        console.log(`   ✅ Success! Response time: ${responseTime}ms`);
        console.log(`   📝 Response: "${content.substring(0, 100)}${content.length > 100 ? '...' : ''}"`);

        return {
            model: model,
            success: true,
            responseTime,
            content,
        };
    } catch (error) {
        const responseTime = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : String(error);

        console.log(`   ❌ Failed! Error: ${errorMessage}`);

        return {
            model: model,
            success: false,
            responseTime,
            error: errorMessage,
        };
    }
}

async function testNanoBananaImage(eternalApi: EternalAI, model: string): Promise<TestResult> {
    console.log(`\n🍌 Testing NanoBanana (image generation): ${model}`);
    const startTime = Date.now();

    // Extract actual model name from nano-banana/model-name format
    const actualModel = model.startsWith('nano-banana/') ? model.slice('nano-banana/'.length) : model;

    try {
        const imageResult = await eternalApi.nanoBanana.generateImage(
            'Create a picture of a nano banana dish in a fancy restaurant with a Gemini theme',
            actualModel
        );

        const responseTime = Date.now() - startTime;

        if (imageResult) {
            // Save image to file
            const fileName = `nano-banana-test-${Date.now()}.png`;
            const buffer = Buffer.from(imageResult.data, 'base64');
            fs.writeFileSync(fileName, buffer);

            console.log(`   ✅ Success! Response time: ${responseTime}ms`);
            console.log(`   🖼️  Image saved to: ${fileName}`);
            console.log(`   📐 Image size: ${buffer.length} bytes, MIME: ${imageResult.mimeType}`);

            return {
                model: `${model} (image)`,
                success: true,
                responseTime,
                content: `Image saved: ${fileName}`,
            };
        } else {
            console.log(`   ⚠️  No image in response. Response time: ${responseTime}ms`);
            return {
                model: `${model} (image)`,
                success: false,
                responseTime,
                error: 'No image data in response',
            };
        }
    } catch (error) {
        const responseTime = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : String(error);

        console.log(`   ❌ Failed! Error: ${errorMessage}`);

        return {
            model: `${model} (image)`,
            success: false,
            responseTime,
            error: errorMessage,
        };
    }
}

async function testNanoBananaStreaming(eternalApi: EternalAI, model: string): Promise<TestResult> {
    console.log(`\n🍌 Testing NanoBanana (streaming via chat.send): ${model}`);
    const startTime = Date.now();

    try {
        // Using chat.send() with stream: true - model prefix nano-banana/ is auto-detected
        const stream = await eternalApi.chat.send({
            messages: [
                {
                    role: 'user',
                    content: 'Write a short haiku about bananas.',
                },
            ],
            model: model,
            stream: true,
        });

        let content = '';
        let chunkCount = 0;

        for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) {
                content += delta;
                chunkCount++;
            }
        }

        const responseTime = Date.now() - startTime;

        console.log(`   ✅ Success! Response time: ${responseTime}ms, Chunks: ${chunkCount}`);
        console.log(`   📝 Response: "${content.substring(0, 100)}${content.length > 100 ? '...' : ''}"`);

        return {
            model: `${model} (stream)`,
            success: true,
            responseTime,
            content,
        };
    } catch (error) {
        const responseTime = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : String(error);

        console.log(`   ❌ Failed! Error: ${errorMessage}`);

        return {
            model: `${model} (stream)`,
            success: false,
            responseTime,
            error: errorMessage,
        };
    }
}

async function testUncensoredAIImage(eternalApi: EternalAI, model: string): Promise<TestResult> {
    console.log(`\n🔓 Testing Uncensored AI (text-to-image): ${model}`);
    const startTime = Date.now();

    // Extract endpoint from model name (e.g., 'uncensored-ai/uncensored-image' -> 'uncensored-image')
    const endpoint = model.startsWith('uncensored-ai/') ? model.slice('uncensored-ai/'.length) : model;

    try {
        // generate() automatically polls until completion and returns UncensoredResultResponse
        const result = await eternalApi.uncensoredAI.generate(
            {
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: 'A beautiful sunset over the ocean with vibrant orange and pink colors',
                            },
                        ],
                    },
                ] as any,
                model: model,
            },
            endpoint,
            {
                interval: 3000,
                maxAttempts: 60,
                onStatusUpdate: (status, attempt) => {
                    console.log(`   ⏳ [${attempt}] Status: ${status}`);
                },
            }
        );

        const responseTime = Date.now() - startTime;

        // Extract URL from result (UncensoredResultResponse format)
        const imageUrl = result.result_url;

        if (imageUrl) {
            console.log(`   ✅ Success! Response time: ${responseTime}ms`);
            console.log(`   🖼️  Image generated successfully`);
            console.log(`   🔗 Image URL: ${imageUrl.substring(0, 80)}...`);

            return {
                model: `${model}`,
                success: true,
                responseTime,
                content: `Image generated: ${imageUrl}`,
            };
        } else {
            console.log(`   ✅ Success! Response time: ${responseTime}ms`);
            console.log(`   📝 Response: ${result.result_url}`);

            return {
                model: `${model}`,
                success: true,
                responseTime,
                content: result.result_url,
            };
        }
    } catch (error) {
        const responseTime = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : String(error);

        console.log(`   ❌ Failed! Error: ${errorMessage}`);

        return {
            model: `${model}`,
            success: false,
            responseTime,
            error: errorMessage,
        };
    }
}

async function testUncensoredAIVideo(eternalApi: EternalAI, model: string): Promise<TestResult> {
    console.log(`\n🎬 Testing Uncensored AI (video generation): ${model}`);
    const startTime = Date.now();

    // Extract endpoint from model name
    const endpoint = model.startsWith('uncensored-ai/') ? model.slice('uncensored-ai/'.length) : model;

    try {
        // generate() automatically polls until completion and returns UncensoredResultResponse
        const result = await eternalApi.uncensoredAI.generate(
            {
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: 'Create a gentle animation with smooth motion',
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/e73f1f4d-16ae-46bf-8c98-970f9d95e570/original=true,quality=90/29227RGZ1J118M7X9TAAJG5MB0.jpeg",
                                    filename: "your-image.jpg"
                                }
                            }
                        ],
                    },
                ] as any,
                model: model,
                type: 'edit',
            },
            endpoint,
            {
                interval: 5000, // Video takes longer, use 5s interval
                maxAttempts: 120, // Allow more attempts for video
                onStatusUpdate: (status, attempt) => {
                    console.log(`   ⏳ [${attempt}] Status: ${status}`);
                },
            }
        );

        const responseTime = Date.now() - startTime;

        // Extract URL from result (UncensoredResultResponse format)
        const videoUrl = result.result_url;

        if (videoUrl) {
            console.log(`   ✅ Success! Response time: ${responseTime}ms`);
            console.log(`   🎬 Video generated successfully`);
            console.log(`   🔗 Video URL: ${videoUrl.substring(0, 80)}...`);

            return {
                model: `${model}`,
                success: true,
                responseTime,
                content: `Video generated: ${videoUrl}`,
            };
        } else {
            console.log(`   ✅ Success! Response time: ${responseTime}ms`);
            console.log(`   📝 Response: ${result.result_url}`);

            return {
                model: `${model}`,
                success: true,
                responseTime,
                content: result.result_url,
            };
        }
    } catch (error) {
        const responseTime = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : String(error);

        console.log(`   ❌ Failed! Error: ${errorMessage}`);

        return {
            model: `${model}`,
            success: false,
            responseTime,
            error: errorMessage,
        };
    }
}


async function main() {
    console.log('�🚀 EternalAI SDK - Multi-Model Integration Test\n');
    console.log('='.repeat(60));

    // Check for API key
    const apiKey = process.env.ETERNALAI_API_KEY;
    if (!apiKey) {
        console.error('❌ Error: ETERNALAI_API_KEY environment variable is not set');
        console.log('\nPlease set the API key in your .env file:');
        console.log('ETERNALAI_API_KEY=your_api_key_here');
        process.exit(1);
    }

    console.log(`✅ API Key found: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`);
    console.log(`📍 API Endpoint: https://open.eternalai.org/api/v1`);
    console.log(`🍌 NanoBanana Endpoint: https://open.eternalai.org/nano-banana/v1beta`);
    console.log(`🔓 UncensoredAI Endpoint: https://open.eternalai.org/uncensored-ai`);
    console.log(`📋 Standard models: ${MODELS_TO_TEST.length}`);
    console.log(`📋 NanoBanana models: ${NANO_BANANA_MODELS.length}`);
    console.log(`📋 UncensoredAI models: ${UNCENSORED_AI_MODELS.length}`);
    console.log('='.repeat(60));

    const eternalApi = new EternalAI({
        apiKey: apiKey,
    });

    const allResults: TestResult[] = [];

    // Test standard models
    console.log('\n\n📌 STANDARD MODELS TESTS');
    console.log('-'.repeat(40));

    for (const model of MODELS_TO_TEST) {
        // Tavily doesn't support streaming, use non-streaming test
        if (model.startsWith('tavily/')) {
            const result = await testModelNonStreaming(eternalApi, model);
            allResults.push(result);
        } else {
            const result = await testModelStreaming(eternalApi, model);
            allResults.push(result);
        }
    }

    // Test NanoBanana custom endpoints
    console.log('\n\n🍌 NANO-BANANA TESTS (Custom Endpoints)');
    console.log('-'.repeat(40));

    for (const model of NANO_BANANA_MODELS) {
        // Test text generation
        const textResult = await testNanoBananaText(eternalApi, model);
        allResults.push(textResult);

        // Test streaming
        const streamResult = await testNanoBananaStreaming(eternalApi, model);
        allResults.push(streamResult);

        // Test image generation
        const imageResult = await testNanoBananaImage(eternalApi, model);
        allResults.push(imageResult);
    }

    // Test Uncensored AI endpoints
    console.log('\n\n🔓 UNCENSORED AI TESTS (Image/Video Generation)');
    console.log('-'.repeat(40));

    for (const model of UNCENSORED_AI_MODELS) {
        if (model.includes('uncensored-image')) {
            const imageResult = await testUncensoredAIImage(eternalApi, model);
            allResults.push(imageResult);
        } else if (model.includes('uncensored-video')) {
            const videoResult = await testUncensoredAIVideo(eternalApi, model);
            allResults.push(videoResult);
        }
    }

    // Summary
    console.log('\n\n');
    console.log('='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));

    console.log('\n📌 All Results:');
    console.log('-'.repeat(40));
    for (const result of allResults) {
        const status = result.success ? '✅' : '❌';
        console.log(`${status} ${result.model.padEnd(35)} ${result.responseTime}ms`);
        if (!result.success) {
            console.log(`   └─ Error: ${result.error}`);
        }
    }

    // Final summary
    const successCount = allResults.filter((r) => r.success).length;
    const totalTests = allResults.length;

    console.log('\n' + '='.repeat(60));
    console.log(`🏆 FINAL RESULT: ${successCount}/${totalTests} tests passed`);

    if (successCount === totalTests) {
        console.log('🎉 All tests passed successfully!');
    } else {
        console.log('⚠️  Some tests failed. Please check the errors above.');
        process.exit(1);
    }

    console.log('='.repeat(60) + '\n');
}

main().catch((error) => {
    console.error('\n❌ Test runner failed:', error);
    process.exit(1);
});
