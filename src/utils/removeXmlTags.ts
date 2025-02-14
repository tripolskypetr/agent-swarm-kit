export const removeXmlTags = (input: string) => {
    return input
        .replace(/<[^>]+>[\s\S]*?<\/[^>]+>/g, '')
        .replace(/\n\s*\n/g, '\n')
        .trim();
};


export default removeXmlTags;
