export async function handleListFiles(env) {
    try {
        const list = await env.adelaidereader.list({ prefix: 'picture/' });
        
        // 为每个文件添加 URL
        const filesWithUrls = list.objects.map(obj => ({
            ...obj,
            url: `https://pub-ecb3f89848ab43e9994824d78aadd3c2.r2.dev/${obj.key}`
        }));

        return {
            status: 200,
            body: JSON.stringify(filesWithUrls),
            headers: { 'Content-Type': 'application/json' }
        };
    } catch (error) {
        console.error("Error listing files:", error);
        return {
            status: 500,
            body: JSON.stringify({ error: 'Internal server error' }),
            headers: { 'Content-Type': 'application/json' }
        };
    }
}
