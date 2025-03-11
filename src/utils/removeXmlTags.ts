export const removeXmlTags = (input: string) => {
    if (!input) {
        return "";
    }
    return input
        .replace(/<[^>]+>[\s\S]*?<\/[^>]+>/g, '')
        .replace(/\n\s*\n/g, '\n')
        .trim();
};


export default removeXmlTags;
