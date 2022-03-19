export const stripTags = (body: string) => body.replace(/(<([^>]+)>)/gi, '')
