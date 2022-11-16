/**
 * @file css过渡
 * @date 2022-09-08
 * @author xuejie.he
 * @lastModify xuejie.he 2022-09-08
 */

import { useCallback, useLayoutEffect, useRef, useEffect, useState } from "react";
import { forceReflow } from "../Transition/Unit/forceReflow";
import {
    GetClassNameProps,
    initClassName,
    InitClassNameProps,
} from "../Transition/Unit/initClassName";

import "../Transition/style.scss";
import { setStyle } from "../Transition/Unit/addStyle";
import { getTransitionAttr } from "../Transition/Unit/getTransitionAttr";

/**
 * 过滤数组
 * @param { Array<string>} original 原始的数组
 * @param { Array<string>} exclude 剔除的数组
 * @returns {string[]} 新的数组
 */
const filterArray = (original: Array<string>, exclude: Array<string>): Array<string> => {
    const arr: string[] = [];
    for (let i = 0; i < original.length; i++) {
        let status = false;
        for (let j = 0; j < exclude.length; ) {
            if (original[i] === exclude[j]) {
                status = true;
                j = exclude.length;
            } else {
                ++j;
            }
        }
        if (!status) {
            arr.push(original[i]);
        }
    }
    return arr;
};

export enum ActionType {
    SetClassNameAction = "SETCLASSNAME",
    SwitchVisibleStatusAction = "SWITCHVISIBLESTATUS",
}

type SetClassNameAction = {
    type: ActionType.SetClassNameAction;
    payload: InitClassNameProps;
};

type SwitchVisibleStatusAction = {
    type: ActionType.SwitchVisibleStatusAction;
    payload: {
        value: boolean;
        isTransition: boolean;
    };
};

type TransitionAction = SetClassNameAction | SwitchVisibleStatusAction;

export interface ObjectDOMRect {
    readonly height: number;
    readonly width: number;
}

/**
 * 过渡状态
 *
 * 0 => 还未开始
 * 1 => 开始
 * 2 => 结束
 * 3 => 取消
 */
export type TransitionStatusProps = 0 | 1 | 2 | 3;

/**
 * transition-clock  用来获取过渡之前的数据
 * @param initStyle 初始的样式
 * @param extraStyle 通过计算 后 又想要加的额外样式
 * @param onTransitionStart 过渡开始
 * @param onTransitionEnd 过渡结束
 * @param onTransitionCancel 过渡取消
 * @param onTransitionCancel 过渡取消
 * @param root 要变化的节点
 * @returns
 */
export const useCssTransition = (
    initStyle: React.CSSProperties | undefined,
    extraStyle: React.CSSProperties | undefined,
    onTransitionStart: (() => void) | undefined,
    onTransitionEnd: (() => void) | undefined,
    onTransitionCancel: (() => void) | undefined,
    root: React.MutableRefObject<HTMLDivElement | null>,
): [(action: TransitionAction) => void, string[], React.CSSProperties | undefined] => {
    const transitionClassName = useRef<GetClassNameProps>();
    /**
     * 过渡状态
     *
     * 0 => 还未开始
     * 1 => 开始
     * 2 => 结束
     * 3 => 取消
     */
    const transitionEndStatus = useRef<TransitionStatusProps>(0);

    const insertedClassName = useRef<string[]>([]);

    const isTransition = useRef(false);

    const [show, setShow] = useState<boolean>();
    const showRef = useRef<boolean>();

    const animationName = useRef<InitClassNameProps["type"]>();

    const transitionCount = useRef(0);

    const initStyleRef = useRef(initStyle);
    const extraStyleRef = useRef(extraStyle);
    const transitionStartFn = useRef(onTransitionStart);
    const transitionEndFn = useRef(onTransitionEnd);
    const transitionCancelFn = useRef(onTransitionCancel);

    const moreStyle = useRef(initStyle);

    const nodeSize = useRef({
        width: 0,
        height: 0,
    });

    useLayoutEffect(() => {
        initStyleRef.current = initStyle;
        if (transitionEndStatus.current !== 1) {
            moreStyle.current = initStyle;
        }
    }, [initStyle]);
    useLayoutEffect(() => {
        extraStyleRef.current = extraStyle;
    }, [extraStyle]);
    useLayoutEffect(() => {
        transitionStartFn.current = onTransitionStart;
    }, [onTransitionStart]);
    useLayoutEffect(() => {
        transitionEndFn.current = onTransitionEnd;
    }, [onTransitionEnd]);
    useLayoutEffect(() => {
        transitionCancelFn.current = onTransitionCancel;
    }, [onTransitionCancel]);

    useEffect(() => {
        return () => {
            if (transitionEndStatus.current === 1) {
                transitionEndStatus.current = 3;
                transitionCancelFn.current?.();
            }
        };
    }, []);

    useLayoutEffect(() => {
        const node = root.current;
        return () => {
            node?.classList.remove(...insertedClassName.current);
            insertedClassName.current = [];
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useLayoutEffect(() => {
        const id = "dComponent-transition-clock";
        let styleNode = document.getElementById(id);
        if (!styleNode) {
            styleNode = document.createElement("style");
            styleNode.setAttribute("id", id);
            styleNode.innerHTML = `
                    [transition-clock] {
                        z-index: -999999 !important;
                        pointer-events: none !important;
                        visibility: hidden !important;
                        opacity: 0 !important;
                        position: absolute !important;
                    }
                `;
            document.head.append(styleNode);
        }
    }, []);

    useEffect(() => {
        let timer: number | null = null;
        let isDestroy = false;
        let count = 0;
        let transitionAttr: ReturnType<typeof getTransitionAttr> | null = null;

        const node = root.current;
        const transitionClass = transitionClassName.current;
        if (!node || !transitionClass) {
            transitionEndStatus.current = 3;
            transitionCancelFn.current?.();
            return;
        }

        /**
         * 添加或删除className
         */
        const operationClassName = (type: "add" | "remove", cs: string[]) => {
            const arr: string[] = [];

            for (let i = 0; i < cs.length; i++) {
                if (cs[i]) {
                    arr.push(cs[i]);
                }
            }

            switch (type) {
                case "add":
                    node?.classList.add(...arr);
                    insertedClassName.current.push(...arr);
                    break;
                case "remove":
                    node?.classList.remove(...arr);
                    insertedClassName.current = filterArray(insertedClassName.current, arr);
                    break;
            }
        };

        /**
         * 当可见时
         * 过渡结束时
         */
        const transitionendWhenShow = (e: TransitionEvent) => {
            if (e.target === node) {
                ++count;
                if (count === transitionAttr?.propCount) {
                    timer && window.clearTimeout(timer);
                    enterEnd();
                }
            }
        };

        /**
         * 结束进入
         */
        const enterEnd = () => {
            transitionEndStatus.current = 2;
            operationClassName("remove", insertedClassName.current);
            setStyle(node, initStyleRef.current);
            count = 0;
            transitionAttr = null;
            moreStyle.current = initStyleRef.current;

            transitionEndFn.current?.();
            node.removeEventListener("transitionend", transitionendWhenShow, false);

            const rect = node.getBoundingClientRect();
            nodeSize.current = {
                width: rect.width,
                height: rect.height,
            };
        };

        /**
         *  进入 后
         */
        const enterTo = () => {
            operationClassName("remove", [transitionClass.enter.from]);

            let addStyle: React.CSSProperties | null = null;
            if (nodeSize.current) {
                switch (animationName.current) {
                    case "taller":
                        addStyle = {
                            height: `${nodeSize.current.height}px`,
                        };
                        break;
                    case "wider":
                        addStyle = {
                            width: `${nodeSize.current.width}px`,
                        };
                        break;
                    default:
                        break;
                }
            }
            if (extraStyleRef.current || addStyle) {
                moreStyle.current = Object.assign(
                    {},
                    initStyleRef.current,
                    extraStyleRef.current,
                    addStyle,
                );
                setStyle(node, moreStyle.current);
            }

            operationClassName("add", [transitionClass.enter.to]);

            transitionAttr = getTransitionAttr(node);

            timer = window.setTimeout(() => {
                if (isDestroy) {
                    return;
                }
                enterEnd();
            }, transitionAttr.timeout + 1);

            node.addEventListener("transitionend", transitionendWhenShow, false);
        };

        /**
         * 进入前
         *
         */
        const enterFrom = () => {
            operationClassName("add", [transitionClass.enter.from, transitionClass.enter.active]);
            operationClassName(
                "remove",
                filterArray(insertedClassName.current, [
                    transitionClass.enter.from,
                    transitionClass.enter.active,
                ]),
            );
            forceReflow();
            /***** 这里做是否有过渡动画判断 *********/
            const info = getTransitionAttr(node);
            let status = false;
            if (info.timeout > 0 || transitionClass.enter.to) {
                status = true;
            }
            /***** 这里做是否有过渡动画判断结束 *********/
            if (status) {
                timer = window.setTimeout(() => {
                    if (isDestroy) {
                        return;
                    }
                    enterTo();
                });
            } else {
                enterEnd();
            }
        };

        /**
         * 结束离开
         */
        const leaveEnd = () => {
            transitionEndStatus.current = 2;
            operationClassName("remove", insertedClassName.current);
            operationClassName("add", ["transition_hidden"]);
            count = 0;
            transitionAttr = null;
            moreStyle.current = initStyleRef.current;
            node.removeEventListener("transitionend", transitionendWhenHidden, false);
            transitionEndFn.current?.();
        };

        /**
         * 当transitionend事件结束时
         * 当可见度等于hidden
         */
        const transitionendWhenHidden = (e: TransitionEvent) => {
            if (e.target === node) {
                ++count;
                if (count === transitionAttr?.propCount) {
                    timer && window.clearTimeout(timer);
                    leaveEnd();
                }
            }
        };

        /**
         * 离开后
         */
        const leaveTo = () => {
            operationClassName("remove", [transitionClass.leave.from]);
            setStyle(node, initStyleRef.current);

            operationClassName("add", [transitionClass.leave.to]);

            transitionAttr = getTransitionAttr(node);

            timer = window.setTimeout(() => {
                if (isDestroy) {
                    return;
                }
                leaveEnd();
            }, transitionAttr.timeout + 1);

            node.addEventListener("transitionend", transitionendWhenHidden, false);
        };

        /**
         * 离开前
         */
        const leaveFrom = () => {
            if (node.hasAttribute("transition-clock")) {
                node.removeAttribute("transition-clock");
            }

            operationClassName("remove", insertedClassName.current);
            let addStyle: React.CSSProperties | null = null;
            if (nodeSize.current) {
                switch (animationName.current) {
                    case "taller":
                        addStyle = {
                            height: `${nodeSize.current.height}px`,
                        };
                        break;
                    case "wider":
                        addStyle = {
                            width: `${nodeSize.current.width}px`,
                        };
                        break;
                    default:
                        break;
                }
            }
            if (extraStyleRef.current || addStyle) {
                moreStyle.current = Object.assign(
                    {},
                    initStyleRef.current,
                    extraStyleRef.current,
                    addStyle,
                );
                setStyle(node, moreStyle.current);
            }

            operationClassName("add", [transitionClass.leave.from, transitionClass.leave.active]);
            forceReflow();

            /***** 这里做是否有过渡动画判断 *********/
            const info = getTransitionAttr(node);
            let status = false;
            if (info.timeout > 0 || transitionClass.leave.to) {
                status = true;
            }
            /***** 这里做是否有过渡动画判断结束 *********/
            if (status) {
                timer = window.setTimeout(() => {
                    if (isDestroy) {
                        return;
                    }
                    leaveTo();
                });
            } else {
                leaveEnd();
            }
        };

        const enterGetSize = (fn: () => void) => {
            if (animationName.current === "taller" || animationName.current === "wider") {
                node.setAttribute("transition-clock", "true");
                operationClassName("remove", ["transition_hidden"]);
                forceReflow();
                timer = window.setTimeout(() => {
                    if (isDestroy) {
                        return;
                    }
                    const rect = node.getBoundingClientRect();
                    nodeSize.current = {
                        width: rect.width,
                        height: rect.height,
                    };
                    operationClassName("add", ["transition_hidden"]);
                    node.removeAttribute("transition-clock");
                    forceReflow();
                    timer = window.setTimeout(() => {
                        if (isDestroy) {
                            return;
                        }
                        fn();
                    });
                });
            } else {
                fn();
            }
        };

        if (show) {
            if (isTransition.current) {
                if (!transitionCount.current || node.hasAttribute("transition-clock")) {
                    node.removeAttribute("transition-clock");
                    operationClassName("add", ["transition_hidden"]);
                    forceReflow();

                    timer = window.setTimeout(() => {
                        if (isDestroy) {
                            return;
                        }
                        enterGetSize(enterFrom);
                    });
                } else {
                    enterFrom();
                }
            } else {
                if (node.hasAttribute("transition-clock")) {
                    node.removeAttribute("transition-clock");
                }
                enterEnd();
            }
            ++transitionCount.current;
        } else if (show === false) {
            if (isTransition.current) {
                leaveFrom();
            } else {
                if (node.hasAttribute("transition-clock")) {
                    node.removeAttribute("transition-clock");
                }
                leaveEnd();
            }
        }

        return () => {
            timer && window.clearTimeout(timer);
            isDestroy = true;
            node.removeEventListener("transitionend", transitionendWhenHidden, false);
            node.removeEventListener("transitionend", transitionendWhenShow, false);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show]);

    const dispatch = useCallback((action: TransitionAction) => {
        switch (action.type) {
            case ActionType.SetClassNameAction:
                animationName.current = action.payload.type;
                transitionClassName.current = initClassName(action.payload);
                break;
            case ActionType.SwitchVisibleStatusAction:
                if (showRef.current === undefined && action.payload.value === false) {
                    return;
                } else if (action.payload.value !== showRef.current) {
                    showRef.current = action.payload.value;
                    if (transitionEndStatus.current === 1) {
                        transitionEndStatus.current = 3;
                        transitionCancelFn.current?.();
                    }
                    transitionEndStatus.current = 1;
                    transitionStartFn.current?.();
                    isTransition.current = action.payload.isTransition;
                    setShow(action.payload.value);
                }

                break;
        }
    }, []);
    return [dispatch, insertedClassName.current, moreStyle.current];
};
