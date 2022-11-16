/**
 * @file
 * @date 2022-10-19
 * @author xuejie.he
 * @lastModify xuejie.he 2022-10-19
 */
/* <------------------------------------ **** DEPENDENCE IMPORT START **** ------------------------------------ */
/** This section will include all the necessary dependence for this tsx file */
import React, { forwardRef, memo, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { deepCloneData, getScrollValue } from "../../unit";
import { ActionType, useCssTransition } from "../Transition/Hooks/useCssTransition";
import { setStyle } from "../Transition/Transition/Unit/addStyle";
import { forceReflow } from "../Transition/Transition/Unit/forceReflow";
import { Placement, TriangleProps } from "../Unit/type";
import { AutoPositionResult, main, OffsetProps } from "./autoPosition";
import { addEventList, EventParams, removeEventList } from "./eventListener";
import { getTriangle } from "./getTriangle";
import { listenDomChange } from "./listenDomChange";
import { mountElement } from "./mount";
import "./style.scss";
import { toFixed } from "./toFixed";
import { getTransitionClass, TransitionClassProps } from "./transitionClass";
import Triangle from "./triangle";
import { Direction, SizeProps } from "./type";
/* <------------------------------------ **** DEPENDENCE IMPORT END **** ------------------------------------ */
/* <------------------------------------ **** INTERFACE START **** ------------------------------------ */
/** This section will include all the interface for this tsx file */
interface TempProps extends React.HTMLAttributes<HTMLDivElement> {
    isRemove: boolean;
    root?: Element;
    direction: Direction;
    placement: Placement;
    portalOffset?: OffsetProps;
    triangleOffset?: TriangleProps;
    animation?: "fade";
    handleTransitionStart?: () => void;
    handleTransitionEnd?: () => void;
    handleTransitionCancel?: () => void;
    mount?: Element;
    bodyClassName?: string;
    show?: boolean;
    hashId?: string;
    children?: React.ReactNode;
}
/* <------------------------------------ **** INTERFACE END **** ------------------------------------ */
/* <------------------------------------ **** FUNCTION COMPONENT START **** ------------------------------------ */
const Temp = forwardRef<HTMLDivElement, TempProps>(
    (
        {
            isRemove,
            root,
            direction,
            placement,
            portalOffset,
            triangleOffset,
            animation,
            handleTransitionStart,
            handleTransitionEnd,
            handleTransitionCancel,
            style,
            className,
            mount,
            show,
            hashId,

            bodyClassName,
            children,
            ...props
        },
        ref,
    ) => {
        Temp.displayName = "PositionPortal";
        /* <------------------------------------ **** STATE START **** ------------------------------------ */
        /************* This section will include this component HOOK function *************/

        const positionalRef = useRef<string>();
        const [positional, setPositional] = useState<AutoPositionResult>();
        const autoPositionFn = useRef(main());
        const transitionEnd = useRef(true);
        const [initStyle, setInitStyle] = useState(style);

        const count = useRef(0);
        /**
         * 用来diff比较
         */
        const portalSize = useRef<SizeProps>();
        const triangleSize = useRef<SizeProps>();
        /**
         * root节点的属性
         */
        const rootAttr = useRef<{
            width: number;
            height: number;
            left: number;
            top: number;
        }>();

        const directionRef = useRef(direction);
        const placementRef = useRef(placement);
        const portalOffsetRef = useRef(portalOffset);
        const triangleOffsetRef = useRef(triangleOffset);
        const animationRef = useRef(animation);
        const styleRef = useRef(style);
        const rootRef = useRef(root);
        const mountRef = useRef(mount);

        const portalRef = useRef<HTMLDivElement | null>(null);

        const showRef = useRef<boolean>();

        /**
         * 每当 show改变时触发
         * 每当 可见且 btn或者 content产生变化时触发
         *
         * 开始使用的是callback进行调用触发
         * 但考虑到dom的获取在useEffect等等里才能稳定的读取
         *
         * 决定使用setState进行触发更新
         *
         */

        const [visible, setVisible] = useState<boolean>();

        const [refresh, setRefresh] = useState(0);

        const transitionStart = useRef(false);

        const [dispatch, currentClassName, currentStyle] = useCssTransition(
            initStyle,
            undefined,
            () => {
                handleTransitionStart?.();
                transitionStart.current = true;
            },
            () => {
                handleTransitionEnd?.();
                transitionStart.current = false;
                transitionEnd.current = true;
                setRefresh((pre) => ++pre);
            },

            () => {
                handleTransitionCancel?.();
            },
            portalRef,
        );

        const dispatchRef = useRef(dispatch);

        /* <------------------------------------ **** STATE END **** ------------------------------------ */
        /* <------------------------------------ **** PARAMETER START **** ------------------------------------ */
        /************* This section will include this component parameter *************/

        useEffect(() => {
            showRef.current = show;
            transitionEnd.current = false;
            if (show) {
                ++count.current;
            }

            setVisible(show);
        }, [show]);

        /**
         * 将监听的数据转化为静态变量
         * start
         */
        useLayoutEffect(() => {
            rootRef.current = root;
        }, [root]);
        useLayoutEffect(() => {
            directionRef.current = direction;
        }, [direction]);
        useLayoutEffect(() => {
            dispatchRef.current = dispatch;
        }, [dispatch]);
        useLayoutEffect(() => {
            placementRef.current = placement;
        }, [placement]);
        useLayoutEffect(() => {
            portalOffsetRef.current = portalOffset;
        }, [portalOffset]);
        useLayoutEffect(() => {
            triangleOffsetRef.current = triangleOffset;
        }, [triangleOffset]);
        useLayoutEffect(() => {
            animationRef.current = animation;
        }, [animation]);
        useLayoutEffect(() => {
            styleRef.current = style;
        }, [style]);
        useLayoutEffect(() => {
            mountRef.current = mount;
        }, [mount]);

        /**
         * end
         * 将监听的数据转化为静态变量
         */

        useEffect(() => {
            const diffChild = () => {
                const el = portalRef.current;
                if (!el || window.getComputedStyle(el, null).display === "none") {
                    return;
                }

                const rect = el.getBoundingClientRect();

                portalSize.current = {
                    width: rect.width,
                    height: rect.height,
                };
            };

            const diffRoot = () => {
                const el = rootRef.current;
                if (!el) {
                    return;
                }

                const rect = el.getBoundingClientRect();

                rootAttr.current = {
                    width: rect.width,
                    height: rect.height,
                    left: rect.left,
                    top: rect.top,
                };
            };

            const mainFn = () => {
                if (!showRef.current || !transitionEnd.current) {
                    return;
                }
                diffChild();
                diffRoot();
                setRefresh((pre) => ++pre);
            };

            const event: EventParams[] = [
                {
                    type: "scroll",
                    listener: mainFn,
                    option: true,
                },
                {
                    type: "resize",
                    listener: mainFn,
                },
            ];

            addEventList(window, event);

            return () => {
                removeEventList(window, event);
            };
        }, []);
        /**
         * 监听 kite的root element的变化
         * 如果 top、left、width、height和之前不同 就得重新计算位置
         */
        useLayoutEffect(() => {
            const fn = () => {
                if (!root || !showRef.current || !transitionEnd.current) {
                    return;
                }

                const rect = root.getBoundingClientRect();

                const data = rootAttr.current;
                if (
                    data &&
                    rect.top === data.top &&
                    rect.left === data.left &&
                    rect.width === data.width &&
                    rect.height === data.height
                ) {
                    return;
                }

                rootAttr.current = {
                    width: rect.width,
                    height: rect.height,
                    left: rect.left,
                    top: rect.top,
                };
                // 计算fn
                setRefresh((pre) => ++pre);
            };

            let observer: MutationObserver | null = null;

            if (root) {
                const rect = root.getBoundingClientRect();
                rootAttr.current = {
                    width: rect.width,
                    height: rect.height,
                    left: rect.left,
                    top: rect.top,
                };
                observer = listenDomChange(root, fn);
            }
            return () => {
                observer?.disconnect();
            };
        }, [root]);

        /**
         * 比较children element的变化
         */
        useEffect(() => {
            const fn = () => {
                const el = portalRef.current;
                if (!el || !showRef.current || !transitionEnd.current) {
                    return;
                }

                const rect = el.getBoundingClientRect();
                if (
                    portalSize.current &&
                    rect.width === portalSize.current.width &&
                    rect.height === portalSize.current.height
                ) {
                    return;
                }
                // 计算fn
                portalSize.current = {
                    width: rect.width,
                    height: rect.height,
                };
                setRefresh((pre) => ++pre);
            };

            let observer: MutationObserver | null = null;

            if (portalRef.current) {
                observer = listenDomChange(portalRef.current, fn);
            }
            return () => {
                observer?.disconnect();
            };
        }, []);

        useEffect(() => {
            if (showRef.current && transitionEnd.current) {
                setRefresh((pre) => ++pre);
            }
        }, [root, direction, placement, portalOffset, triangleOffset, mount]);

        useLayoutEffect(() => {
            const portal = portalRef.current;
            const btn = rootRef.current;
            /**
             * 设置portal的位置
             */
            const setLatLng = (res: AutoPositionResult | undefined) => {
                if (res) {
                    let left = toFixed(res.menu[0]);
                    let top = toFixed(res.menu[1]);
                    if (mountRef.current) {
                        const pRect = mountRef.current.getBoundingClientRect();
                        const scrollData = getScrollValue();

                        if (pRect) {
                            const x = pRect.left + scrollData.x;
                            const y = pRect.top + scrollData.y;
                            left = toFixed(res.menu[0] - x);
                            top = toFixed(res.menu[1] - y);
                        }
                    }

                    if (portal) {
                        setStyle(
                            portal,
                            Object.assign({}, styleRef.current, {
                                left: `${left}px`,
                                top: `${top}px`,
                            }),
                        );
                    }
                    setInitStyle(
                        Object.assign({}, styleRef.current, {
                            left: `${left}px`,
                            top: `${top}px`,
                        }),
                    );
                }
            };

            /***
             * 赋值过渡所需要的class name
             */
            const setTransitionClass = (position: AutoPositionResult | undefined) => {
                let classList: undefined | TransitionClassProps = undefined;

                const arr = placementRef.current.split("");
                const x = arr[0] as "l" | "r" | "c";
                const y = arr[1] as "t" | "b" | "c";
                switch (directionRef.current) {
                    case "horizontal":
                        if (x === "l") {
                            classList = position?.reverse
                                ? getTransitionClass("r", y, directionRef.current)
                                : getTransitionClass("l", y, directionRef.current);
                        } else {
                            classList = position?.reverse
                                ? getTransitionClass("l", y, directionRef.current)
                                : getTransitionClass("r", y, directionRef.current);
                        }
                        break;
                    case "vertical":
                        if (y === "t") {
                            classList = position?.reverse
                                ? getTransitionClass(x, "b", directionRef.current)
                                : getTransitionClass(x, "t", directionRef.current);
                        } else {
                            classList = position?.reverse
                                ? getTransitionClass(x, "t", directionRef.current)
                                : getTransitionClass(x, "b", directionRef.current);
                        }
                        break;
                }
                dispatchRef.current({
                    type: ActionType.SetClassNameAction,
                    payload: {
                        type: animationRef.current,
                        enterActive: classList.enter.active,
                        toEnter: classList.enter.to,
                        fromEnter: classList.enter.from,
                        leaveActive: classList.leave.active,
                        toLeave: classList.leave.to,
                        fromLeave: classList.leave.from,
                    },
                });
            };

            /**
             * 计算位置
             */

            if (refresh && typeof showRef.current === "boolean" && btn) {
                const btnRect = btn.getBoundingClientRect();
                let data: AutoPositionResult | undefined = undefined;
                if (btnRect && portalSize.current) {
                    data = autoPositionFn.current({
                        btnRect,
                        triangleSize: [
                            triangleSize.current?.width ?? 0,
                            triangleSize.current?.height ?? 0,
                        ],
                        menuSize: portalSize.current,
                        direction: directionRef.current,
                        placement: placementRef.current,
                        offset: {
                            menu: portalOffsetRef.current,
                            triangle: triangleOffsetRef.current?.offset,
                        },
                    });
                }
                if (JSON.stringify(data) !== positionalRef.current) {
                    positionalRef.current = JSON.stringify(data);
                    setPositional(data ? { ...data } : undefined);
                    setLatLng(data);
                    setTransitionClass(data);
                }
                dispatchRef.current({
                    type: ActionType.SwitchVisibleStatusAction,
                    payload: {
                        value: showRef.current,
                        isTransition: !!count.current,
                    },
                });
            }
        }, [refresh]);

        /**
         * 当show切换时触发的
         */
        useEffect(() => {
            const portal = portalRef.current;
            let displayStyle = portal?.style.display;
            let timer: null | number = null;
            let destroy = false;
            let addLock = false;
            let addDisplay = false;
            let hiddenClassName: string | undefined = undefined;

            /**
             * 赋值 portal的size
             */
            const setSize = (el: HTMLElement) => {
                const rect = el.getBoundingClientRect();
                portalSize.current = {
                    width: rect.width,
                    height: rect.height,
                };

                const triangleNode = getTriangle(el, "kite_triangle");
                if (triangleNode) {
                    const _rect = triangleNode.getBoundingClientRect();
                    triangleSize.current = {
                        width: _rect.width,
                        height: _rect.height,
                    };
                }
            };

            /**
             * 当可见时
             */
            const hasShow = (el: HTMLDivElement, callback: () => void) => {
                /**
                 * 回归不可见状态
                 */
                displayStyle = el.style.display;
                el.style.display = "none";
                addDisplay = true;
                forceReflow();

                /**
                 * 开始为获取宽高 添加它应有的属性
                 */
                timer = window.setTimeout(() => {
                    if (destroy) {
                        return;
                    }

                    if (!el.hasAttribute("transition-clock")) {
                        addLock = true;
                        el.setAttribute("transition-clock", "true");
                    }

                    el.style.display = displayStyle ?? "";
                    addDisplay = false;
                    forceReflow();

                    /**
                     * 开始获取
                     */
                    timer = window.setTimeout(() => {
                        if (destroy) {
                            return;
                        }
                        setSize(el);

                        addLock && el.removeAttribute("transition-clock");
                        addLock = false;
                        forceReflow();
                        /**
                         * 获取完成
                         */
                        callback();
                    });
                });
            };

            /**
             * 当 display等于none时
             */
            const hasHidden = (el: HTMLDivElement, callback: () => void) => {
                for (let i = 0; i < el.classList.length; ) {
                    const classNameValue = el.classList[i];
                    if (classNameValue.includes("transition_hidden")) {
                        hiddenClassName = classNameValue;
                        i = el.classList.length;
                    } else {
                        ++i;
                    }
                    hiddenClassName && el.classList.remove(hiddenClassName);
                }

                if (!el.hasAttribute("transition-clock")) {
                    addLock = true;
                    el.setAttribute("transition-clock", "true");
                }
                forceReflow();
                timer = window.setTimeout(() => {
                    if (destroy) {
                        return;
                    }

                    setSize(el);

                    forceReflow();

                    timer = window.setTimeout(() => {
                        if (destroy) {
                            return;
                        }
                        addLock && el.removeAttribute("transition-clock");
                        hiddenClassName && el.classList.add(hiddenClassName);

                        addLock = false;
                        hiddenClassName = undefined;

                        callback();
                    });
                });
            };

            const refreshPosition = () => {
                setRefresh((pre) => ++pre);
            };

            if (typeof visible === "boolean" && portal) {
                if (transitionStart.current) {
                    refreshPosition();
                } else {
                    const isNone = window.getComputedStyle(portal, null).display === "none";
                    if (visible) {
                        if (isNone) {
                            hasHidden(portal, refreshPosition);
                        } else {
                            hasShow(portal, refreshPosition);
                        }
                    } else {
                        if (!isNone) {
                            setSize(portal);
                        }
                        refreshPosition();
                    }
                }
            }
            return () => {
                destroy = true;
                timer && window.clearTimeout(timer);
                addLock && portal?.removeAttribute("transition-clock");
                hiddenClassName && portal?.classList.add(hiddenClassName);
                if (addDisplay && portal) {
                    portal.style.display = displayStyle ?? "";
                }
            };
        }, [visible]);

        /* <------------------------------------ **** PARAMETER END **** ------------------------------------ */
        /* <------------------------------------ **** FUNCTION START **** ------------------------------------ */
        /************* This section will include this component general function *************/

        const getClassName = () => {
            const arr = [
                `kite_${direction}${placement.slice(0, 1).toUpperCase()}${placement.slice(1, 2)}`,
                ...deepCloneData(currentClassName),
            ];

            if (positional?.reverse) {
                arr.push("kite_reverse");
            }
            return arr.join(" ") + (className ? ` ${className}` : "");
        };
        /* <------------------------------------ **** FUNCTION END **** ------------------------------------ */
        if (isRemove) {
            return <></>;
        }
        return createPortal(
            <div
                key={hashId ? `${hashId}-main` : undefined}
                className={getClassName()}
                ref={(el) => {
                    portalRef.current = el;

                    if (typeof ref === "function") {
                        ref(el);
                    } else if (ref !== null) {
                        (ref as React.MutableRefObject<HTMLElement | null>).current = el;
                    }
                }}
                {...{ "transition-clock": "true" }}
                style={currentStyle}
                {...props}
            >
                <Triangle
                    className={"kite_triangle"}
                    attr={triangleOffset}
                    position={positional}
                    d={direction}
                    placement={placement}
                />

                <div className={"kite_body" + (bodyClassName ? ` ${bodyClassName}` : "")}>
                    {children}
                </div>
            </div>,
            mountElement(mount),
        );
    },
);
Temp.displayName = "PositionPortal";
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */
export default memo(Temp);
