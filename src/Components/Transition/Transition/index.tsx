/**
 * @file transition component
 * @date 2021-11-26
 * @author xuejie.he
 * @lastModify xuejie.he 2021-11-26
 */
/* <------------------------------------ **** DEPENDENCE IMPORT START **** ------------------------------------ */
/** This section will include all the necessary dependence for this tsx file */
import React, { forwardRef, useEffect, useLayoutEffect, useRef, useState } from "react";
import { deepCloneData } from "../../../unit";
import { ActionType, useCssTransition } from "../Hooks/useCssTransition";

/* <------------------------------------ **** DEPENDENCE IMPORT END **** ------------------------------------ */
/* <------------------------------------ **** INTERFACE START **** ------------------------------------ */
/** This section will include all the interface for this tsx file */

export interface TransitionProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * is child component visible
     */
    show: boolean;
    /**
     * enter className
     * * Intersection of fromEnter and toEnter
     */
    enterActive?: string;
    /**
     * leave className
     * * Intersection of fromLeave and toLeave
     */
    leaveActive?: string;
    /**
     * ClassName when entering
     */
    toEnter?: string;
    /**
     * ClassName when leaving
     */
    toLeave?: string;
    /**
     * ClassName when starting to enter
     */
    fromEnter?: string;
    /**
     * ClassName when starting to leave
     */
    fromLeave?: string;
    /**
     * children of ReactNode
     */
    children?: React.ReactNode;
    /**
     * first animation
     */
    firstAnimation?: boolean;
    /**
     * The component library encapsulates several default animation libraries
     */
    animationType?:
        | "fade"
        | "zoom"
        | "taller"
        | "wider"
        | "inLeft"
        | "inRight"
        | "inTop"
        | "inBottom"
        | "slideDown"
        | "slideUp"
        | "slideLeft"
        | "slideRight";
    /**
     * ontransitionEnd callback
     */
    handleTransitionEnd?: () => void;

    /**
     * Remove when the element is hidden
     */
    removeOnHidden?: boolean;
    /**
     * Cache only works if removeOnHidden=true.
     * When cache=true, as long as the element has been rendered, it will no longer be removed.  The opposite is the state of cache=false.
     */
    cache?: boolean;
    /**
     * transitionStart callback
     */
    handleTransitionStart?: () => void;
    /**
     * transition cancel callback
     */
    handleTransitionCancel?: () => void;
}
/* <------------------------------------ **** INTERFACE END **** ------------------------------------ */
/* <------------------------------------ **** FUNCTION COMPONENT START **** ------------------------------------ */
export const Transition = forwardRef<HTMLDivElement, TransitionProps>(
    (
        {
            show,
            enterActive,
            leaveActive,
            toEnter,
            toLeave,
            fromEnter,
            fromLeave,
            children,
            firstAnimation = false,
            animationType,
            handleTransitionEnd,
            handleTransitionStart,
            handleTransitionCancel,
            style,
            className,
            removeOnHidden = false,
            cache,
            ...props
        },
        ref,
    ) => {
        Transition.displayName = "Transition";
        /* <------------------------------------ **** HOOKS START **** ------------------------------------ */
        /************* This section will include this component HOOK function *************/

        /**
         * 计数器
         * show 用来 判断是否有过渡效果
         * removeOnHidden 用来判断 时候可以cache
         */
        const count = useRef({
            show: -1,
            removeOnHidden: 0,
        });

        /***
         * 记录上一次的show的状态
         */
        const oldShow = useRef<boolean>();

        /**
         * 过渡动画是否结束
         */
        const [, setTransitionEnd] = useState(true);

        const transitionEndRef = useRef(true);

        const cloneRef = useRef<HTMLDivElement | null>(null);
        /**
         *
         */
        const [dispatch, classList, currentStyle] = useCssTransition(
            style,
            undefined,
            handleTransitionStart,
            () => {
                handleTransitionEnd?.();
                setTransitionEnd(true);
                transitionEndRef.current = true;
            },
            () => {
                handleTransitionCancel?.();
                setTransitionEnd(true);
                transitionEndRef.current = true;
            },
            cloneRef,
        );

        /**
         * 是否有应该有过渡效果
         *
         *
         * 不在其范围内  ==> css有问题的话
         */
        const isTransition = useRef(false);

        /* <------------------------------------ **** HOOKS END **** ------------------------------------ */

        if (show !== oldShow.current) {
            setTransitionEnd(false);
            transitionEndRef.current = false;
            if (show) {
                ++count.current.removeOnHidden;
            }
            ++count.current.show;
            isTransition.current = count.current.show ? true : firstAnimation;

            oldShow.current = show;
        }

        useLayoutEffect(() => {
            dispatch({
                type: ActionType.SetClassNameAction,
                payload: {
                    type: animationType,
                    enterActive,
                    fromEnter,
                    fromLeave,
                    leaveActive,
                    toEnter,
                    toLeave,
                },
            });
        }, [
            animationType,
            enterActive,
            fromEnter,
            fromLeave,
            leaveActive,
            toEnter,
            toLeave,
            dispatch,
        ]);

        /**
         * 每当show改变时 要执行
         *  前提 先要获取到子节点的宽高
         */
        useEffect(() => {
            dispatch({
                type: ActionType.SwitchVisibleStatusAction,
                payload: {
                    value: show,
                    isTransition: isTransition.current,
                },
            });
        }, [show, dispatch]);

        // /**
        //  * 测试逻辑
        //  */

        // const cRef = useRef<HTMLDivElement | null>(null);
        // useLayoutEffect(() => {
        //     const node = root;
        //     if (!node) {
        //         return;
        //     }

        //     const fn = () => {
        //         console.log(" ******************** ");
        //         console.log("style", node.getAttribute("style"));
        //         console.log("className", node.getAttribute("class"));
        //         console.log(" ******************** ");
        //     };

        //     const ob = new MutationObserver(fn);
        //     ob.observe(node, {
        //         attributes: true,
        //     });
        //     return () => {
        //         ob.disconnect();
        //     };
        // }, [root]);

        const setClassName = () => {
            const arr = deepCloneData(classList);
            return arr.join(" ") + (className ? ` ${className}` : "");
        };

        const mainEl = () => {
            return (
                <div
                    ref={(el) => {
                        cloneRef.current = el;
                        if (typeof ref === "function") {
                            ref(el);
                        } else if (ref !== null) {
                            (ref as React.MutableRefObject<HTMLElement | null>).current = el;
                        }
                    }}
                    {...{ "transition-clock": "true" }}
                    style={currentStyle}
                    className={setClassName()}
                    {...props}
                >
                    {children}
                </div>
            );
        };

        if (removeOnHidden) {
            if (cache) {
                if (!show && !count.current.removeOnHidden && transitionEndRef.current) {
                    return <></>;
                }
            } else if (!show && transitionEndRef.current) {
                return <></>;
            }
            return mainEl();
        }
        return <>{mainEl()}</>;
    },
);
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */
Transition.displayName = "Transition";
