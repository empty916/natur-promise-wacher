var isPromise = function (target) { return typeof (target === null || target === void 0 ? void 0 : target.then) === 'function' && typeof (target === null || target === void 0 ? void 0 : target.catch) === 'function' && typeof (target === null || target === void 0 ? void 0 : target.finally) === 'function'; };
export var createPromiseWatcherMiddleware = function () {
    var promiseTask = [];
    var isWatching = false;
    var collectPromiseMiddleware = function () { return function (next) { return function (record) {
        if (isPromise(record.state)) {
            var res = next(record);
            promiseTask.push(res);
            return res;
        }
        return next(record);
    }; }; };
    var promiseActionsFinishedPromise = function (lastLoopLength) {
        if (lastLoopLength === void 0) { lastLoopLength = promiseTask.length; }
        return new Promise(function (resolve, reject) {
            // 当前系统添加promise任务后
            setTimeout(function () {
                var currentLoopLength = promiseTask.length;
                if (lastLoopLength !== currentLoopLength || (isWatching === false && currentLoopLength > 0)) {
                    isWatching = true;
                    // 第一层，本次loop与上次loop的promise一样多，则向下一层递归，确认，是不是确实没有更多的promise需要加入
                    Promise.all(promiseTask).then(function () { return promiseActionsFinishedPromise(currentLoopLength); })
                        .then(resolve)
                        .catch(function (err) {
                        promiseTask = [];
                        isWatching = false;
                        reject(err);
                    });
                }
                else {
                    promiseTask = [];
                    isWatching = false;
                    resolve();
                }
            }, 0);
        });
    };
    return {
        collectPromiseMiddleware: collectPromiseMiddleware,
        promiseActionsFinishedPromise: promiseActionsFinishedPromise,
    };
};
