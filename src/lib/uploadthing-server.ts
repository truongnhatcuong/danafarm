import "server-only";

import { UTApi } from "uploadthing/server";

let client: UTApi | null = null;

function getUploadThingClient() {
    client ??= new UTApi();
    return client;
}

export async function deleteUploadThingFiles(
    keys: Array<string | null | undefined> | string | null | undefined,
) {
    const normalizedKeys = (Array.isArray(keys) ? keys : [keys]).filter(
        (key): key is string => Boolean(key),
    );

    if (normalizedKeys.length === 0) return { success: true } as const;

    return getUploadThingClient().deleteFiles([...new Set(normalizedKeys)]);
}
