export declare const arrayDiff: (a: any, b: any, ctx?: Options) => any[];
export declare type Options = {
    parseDiffFunctions?: boolean;
};
export declare const createPatch: (a: any, b: any, ctx?: Options) => {
    [key: string]: any;
};
