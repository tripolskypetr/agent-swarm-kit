export const removeXmlTags = (input: string) => {
    return input.replace(/<[^>]*>.*?<\/[^>]*>/g, '');
};

export default removeXmlTags;
