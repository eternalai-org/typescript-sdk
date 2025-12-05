import { EternalAI } from '../src';

/**
 * Example: Generate video from image using Wan model
 */
async function generateVideo() {
    const client = new EternalAI({
        apiKey: process.env.ETERNAL_API_KEY || 'your-api-key-here',
    });

    try {
        console.log('Starting video generation...');

        // Using the chat interface with wan/ prefix
        const response = await client.chat.send({
            model: 'wan/wan2.5-i2v-preview',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: 'A scene of urban fantasy art. A dynamic graffiti art character. A boy painted with spray paint comes to life from a concrete wall. He sings an English rap song at a very fast pace while striking a classic, energetic rapper pose. The scene is set under an urban railway bridge at night. The lighting comes from a single streetlight, creating a cinematic atmosphere full of high energy and amazing detail. The audio of the video consists entirely of the boy\'s rap, with no other dialogue or noise.',
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: 'https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20250925/wpimhv/rap.png',
                            },
                        },
                    ],
                } as any, // Type assertion needed due to ChatMessage type limitation
            ],
            resolution: '480P',
            prompt_extend: true,
            duration: 10,
            audio: true,
        } as any); // Type assertion needed for custom options

        console.log('Video generated successfully!');
        console.log('Video URL:', response.choices[0].message.content);
    } catch (error) {
        console.error('Error generating video:', error);
    }
}

/**
 * Example: Direct use of Wan service with polling callbacks
 */
async function generateVideoWithPolling() {
    const client = new EternalAI({
        apiKey: process.env.ETERNAL_API_KEY || 'your-api-key-here',
    });

    try {
        console.log('Starting video generation with polling...');

        // Direct use of wan service
        const result = await client.wan.generate(
            {
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: 'A dynamic graffiti art character coming to life...',
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: 'https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20250925/wpimhv/rap.png',
                                },
                            },
                        ],
                    } as any,
                ],
                model: 'wan/wan2.5-i2v-preview',
                resolution: '480P',
                prompt_extend: true,
                duration: 10,
                audio: true,
            } as any,
            'wan2.5-i2v-preview',
            {
                interval: 5000,
                maxAttempts: 120,
                onStatusUpdate: (status, attempt) => {
                    console.log(`[Attempt ${attempt}] Status: ${status}`);
                },
            }
        );

        console.log('Video generated successfully!');
        console.log('Video URL:', result.output?.results?.[0]?.url);
    } catch (error) {
        console.error('Error generating video:', error);
    }
}

// Run the examples
if (require.main === module) {
    // Choose which example to run
    const usePolling = process.argv.includes('--polling');

    if (usePolling) {
        generateVideoWithPolling();
    } else {
        generateVideo();
    }
}
