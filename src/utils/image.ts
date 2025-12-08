/**
 * Upload base64 image to EternalAI storage
 * @param base64Data - Base64 encoded image data
 * @param mimeType - MIME type of the image (e.g., 'image/png')
 * @returns Public URL of the uploaded image
 */
export async function uploadImageToStorage(base64Data: string, mimeType: string): Promise<string> {
    const uploadUrl = 'https://api.eternalai.org/api/agent/upload-image?admin_key=eai2024';

    // Convert base64 to blob
    const binaryData = Buffer.from(base64Data, 'base64');

    // Create form data
    const formData = new FormData();
    const blob = new Blob([binaryData], { type: mimeType });
    const filename = `${Date.now()}.${mimeType.split('/')[1] || 'png'}`;

    formData.append('file', blob, filename);

    const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to upload image: ${response.status} - ${errorText}`);
    }

    const responseText = await response.text();

    let result: { status?: number; data?: string };
    try {
        result = JSON.parse(responseText) as { status?: number; data?: string };
    } catch (e) {
        throw new Error(`Failed to parse upload response: ${responseText}`);
    }

    return result.data || '';
}
