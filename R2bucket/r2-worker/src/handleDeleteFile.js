export async function handleDeleteFile(key, env) {
    try {
        // 确保 key 是完整的路径
        const fullKey = key.startsWith('picture/') ? key : `picture/${key}`;
        
        // 先检查文件是否存在
        const object = await env.adelaidereader.get(fullKey);
        if (!object) {
            return {
                status: 404,
                body: JSON.stringify({ 
                    error: 'File not found',
                    key: fullKey
                }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // 执行删除操作
        await env.adelaidereader.delete(fullKey);
        console.log("File deleted from R2 with key:", fullKey);

        return {
            status: 200,
            body: JSON.stringify({ 
                message: 'File deleted successfully',
                key: fullKey
            }),
            headers: { 'Content-Type': 'application/json' }
        };
    } catch (error) {
        console.error("Error deleting file:", error);
        return {
            status: 500,
            body: JSON.stringify({ 
                error: 'Internal server error',
                details: error.message,
                key: key
            }),
            headers: { 'Content-Type': 'application/json' }
        };
    }
}
