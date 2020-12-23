import { Middleware } from 'natur';


const isPromise = (target: any): target is Promise<any> => typeof target?.then === 'function' && typeof target?.catch === 'function' && typeof target?.finally === 'function';

export const createPromiseWatcherMiddleware = () => {
	let promiseTask: Array<Promise<any>> = [];
	let isWatching = false;

	const collectPromiseMiddleware: Middleware<any> = () => next => record => {
		if (isPromise(record.state)) {
			const res = next(record);
			promiseTask.push(res);
			return res;
		}
		return next(record);
	};

	const promiseActionsFinishedPromise = (lastLoopLength: number = promiseTask.length) => new Promise<void>((resolve, reject) => {
		// 当前系统添加promise任务后
		setTimeout(() => {
			const currentLoopLength = promiseTask.length;
			if (lastLoopLength !== currentLoopLength || (isWatching === false && currentLoopLength > 0)) {
				isWatching = true;
				// 第一层，本次loop与上次loop的promise一样多，则向下一层递归，确认，是不是确实没有更多的promise需要加入
				Promise.all(promiseTask).then(() => promiseActionsFinishedPromise(currentLoopLength))
					.then(resolve)
					.catch(err => {
						promiseTask = [];
						reject(err);
					});
			} else {
				promiseTask = [];
				isWatching = false;
				resolve();
			}
		}, 0);
	});

	return {
		collectPromiseMiddleware,
		promiseActionsFinishedPromise,
	};
};
