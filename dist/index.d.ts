import { Middleware } from 'natur';
export declare const createPromiseWatcherMiddleware: () => {
    collectPromiseMiddleware: Middleware<any>;
    promiseActionsFinishedPromise: (lastLoopLength?: number) => Promise<void>;
};
