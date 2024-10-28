export async function handleFileUpload(request, env) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');
        if (!file) {
            return {
                status: 400,
                body: JSON.stringify({ error: 'No file uploaded' })
            };
        }

        const r2Key = `${Date.now()}-${file.name}`;
        await env.adelaidereader.put(r2Key, file.stream());
        console.log("File uploaded to R2 with key:", r2Key);

        return {
            status: 200,
            body: JSON.stringify({ message: 'File uploaded successfully', r2Key })
        };
    } catch (error) {
        console.error("Error uploading file:", error);
        return {
            status: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
}
