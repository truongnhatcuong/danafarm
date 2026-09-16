/**
 * Render structured data (schema.org) as an inline <script type="application/ld+json">.
 * `<` is escaped to prevent breaking out of the script tag when data contains user content.
 */
export function JsonLd({ data }: { data: object }) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
        />
    );
}
