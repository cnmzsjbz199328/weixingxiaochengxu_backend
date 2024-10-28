export async function handleFileUpload(request, env) {
    try {
        // 只解析一次 formData
        const formData = await request.formData();
        const file = formData.get('file');
        
        if (!file) {
            return {
                status: 400,
                body: JSON.stringify({ error: 'No file uploaded' }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // 检查文件类型
        if (!file.type) {
            return {
                status: 400,
                body: JSON.stringify({ error: 'File type not detected' }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // 使用原始文件名，但确保文件名是安全的
        const fileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const r2Key = `picture/${Date.now()}-${fileName}`;

        // 获取文件数据
        const fileData = await file.arrayBuffer();

        // 上传到 R2
        await env.adelaidereader.put(r2Key, fileData, {
            httpMetadata: {
                contentType: file.type,
            }
        });
        
        // 构建 R2.dev URL
        const r2Url = `https://pub-ecb3f89848ab43e9994824d78aadd3c2.r2.dev/${r2Key}`;
        console.log("File uploaded to R2 with key:", r2Key);

        return {
            status: 200,
            body: JSON.stringify({ 
                message: 'File uploaded successfully', 
                key: r2Key,
                url: r2Url,
                type: file.type,
                size: fileData.byteLength
            }),
            headers: { 'Content-Type': 'application/json' }
        };
    } catch (error) {
        console.error("Error uploading file:", error);
        return {
            status: 500,
            body: JSON.stringify({ 
                error: 'Internal server error',
                details: error.message 
            }),
            headers: { 'Content-Type': 'application/json' }
        };
    }
}
