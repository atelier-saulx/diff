import { Options } from '.';
declare type Operation = 'delete' | 'insert' | 'update' | 'merge';
export declare type ArrayDiffDescriptor = {
    type: 'array';
    values: {
        index: number;
        fromIndex?: number;
        type: Operation;
        value?: any;
        values?: any[];
    }[];
};
export declare type ValueUpdate = {
    type: Operation;
    value?: any;
};
export declare type CreatePartialDiff = (currentValue?: any) => ArrayDiffDescriptor | ValueUpdate | false;
export declare const execCreatePartialDiff: (fn: CreatePartialDiff, currentValue?: any, ctx?: Options) => any[];
export {};
