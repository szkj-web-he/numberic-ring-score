/**
 * @file
 * @date 2022-09-29
 * @author xuejie.he
 * @lastModify xuejie.he 2022-09-29
 */
/* <------------------------------------ **** DEPENDENCE IMPORT START **** ------------------------------------ */
/** This section will include all the necessary dependence for this tsx file */
import React, { forwardRef, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { DropdownProps, useDropdownContext } from "../Dropdown";
import { useDropdownClick } from "../Hooks/useDropdownClick";
import Portal from "../Unit/position";
import { CustomEventAction } from "../Unit/type";
import { useDropdownPropsContext } from "./../Dropdown/index";
import { ActionType, useHover } from "./../Hooks/useHover";
import { isCustom } from "./Unit/isCustom";
/* <------------------------------------ **** DEPENDENCE IMPORT END **** ------------------------------------ */
/* <------------------------------------ **** INTERFACE START **** ------------------------------------ */
/** This section will include all the interface for this tsx file */
export interface DropdownContentProps extends DropdownProps, React.HTMLAttributes<HTMLDivElement> {
    /**
     * body className
     */
    bodyClassName?: string;
    /**
     * fn when visible change
     */
    handleVisibleChange?: (visible: boolean) => void;
    /**
     * 修改content是否可见的方法
     */
    changeVisibleFn?: React.MutableRefObject<
        React.Dispatch<React.SetStateAction<boolean>> | undefined
    >;

    /**
     * 这个组件的事件id
     */
    eventId?: string;
}
/* <------------------------------------ **** INTERFACE END **** ------------------------------------ */
/* <------------------------------------ **** FUNCTION COMPONENT START **** ------------------------------------ */
export const DropdownContent = forwardRef<HTMLDivElement, DropdownContentProps>(
    (
        {
            show,
            removeOnHide,
            cache,
            trigger,
            placement,
            direction,
            animate,
            triangle,
            offset,
            mount,
            disable,
            hideOnClick,
            delayOnShow,
            delayOnHide,
            changeVisibleFn,
            onClickCapture,
            onMouseEnter,
            onMouseLeave,
            onMouseDown,
            onFocus,
            onBlur,
            handleVisibleChange,
            eventId,

            children,
            ...props
        },
        ref,
    ) => {
        DropdownContent.displayName = "DropdownContent";
        /* <------------------------------------ **** STATE START **** ------------------------------------ */
        /************* This section will include this component HOOK function *************/
        /**
         * dropdown的参数
         */
        const dropdownProps = useDropdownPropsContext();

        const disableVal = useMemo(
            () => disable ?? dropdownProps.disable,
            [disable, dropdownProps.disable],
        );

        const triggerVal = useMemo(
            () => trigger ?? dropdownProps.trigger,
            [dropdownProps.trigger, trigger],
        );

        /**
         * 默认可见状态
         *
         */
        const [visible, setVisible] = useState(show ?? dropdownProps.show ?? false);

        /**
         * 组件间通讯的id
         */
        const { eventName } = useDropdownPropsContext();

        /**
         * 获取活跃的id
         * */
        const [activeId, setActiveId] = useState<string>();

        const destroy = useRef(false);

        const { btn } = useDropdownContext();

        const visibleChangeFn = useRef(handleVisibleChange);

        const eventIdRef = useRef(eventId);

        const hoverFn = useHover(
            delayOnShow ?? dropdownProps.delayOnShow,
            delayOnHide ?? dropdownProps.delayOnHide,
        );

        const hoverFnRef = useRef(hoverFn);

        const oldBtnId = useRef<string>();

        const timer = useDropdownClick(
            visible,
            () => {
                setVisible(false);
            },
            eventId,
            triggerVal,
            disableVal,
        );

        const transitionEndRef = useRef(true);

        /**
         * 旧的展示状态
         */
        const oldShow = useRef<boolean>();
        /**
         * 过渡状态
         *
         */
        const [, setTransitionEnd] = useState(true);

        /**
         * 可见的次数
         */
        const count = useRef(0);

        /**
         * 监听 局部的show和全局的show
         */
        useEffect(() => {
            setVisible((pre) => show ?? dropdownProps.show ?? pre);
        }, [show, dropdownProps.show]);

        /**
         * 将修改visible的方法暴露出去
         * 这样不仅可以做组件内的交互
         * 也可以让使用者自己做交互
         * 让两个交互合并起来都可以执行
         */
        useEffect(() => {
            if (changeVisibleFn) {
                changeVisibleFn.current = setVisible;
            }
        }, [changeVisibleFn, setVisible]);

        useLayoutEffect(() => {
            hoverFnRef.current = hoverFn;
        }, [hoverFn]);

        useLayoutEffect(() => {
            visibleChangeFn.current = handleVisibleChange;
        }, [handleVisibleChange]);

        useLayoutEffect(() => {
            eventIdRef.current = eventId;
        }, [eventId]);

        /**
         * 当visible变化时
         */
        useEffect(() => {
            visibleChangeFn.current?.(visible);
        }, [visible]);

        useLayoutEffect(() => {
            const fn = (e: Event) => {
                const event = e as CustomEvent<CustomEventAction>;
                const eventData = event.detail;

                const hoveCallback = (res: boolean) => {
                    if (destroy.current) {
                        return;
                    }
                    setVisible(res);
                };

                switch (eventData.event) {
                    case "focus":
                        if (eventData.eventId !== eventIdRef.current) {
                            break;
                        }
                        setActiveId(eventData.id);
                        void hoverFnRef.current({
                            type: ActionType.UpdateBtnAction,
                            payload: { value: true, callback: hoveCallback },
                        });

                        break;
                    case "blur":
                        if (eventData.eventId !== eventIdRef.current) {
                            break;
                        }
                        void hoverFnRef.current({
                            type: ActionType.UpdateBtnAction,
                            payload: { value: false, callback: hoveCallback },
                        });

                        break;
                    case "click":
                        timer.current && window.clearTimeout(timer.current);

                        if (eventData.eventId !== eventIdRef.current || !eventData.todo) {
                            break;
                        }

                        setActiveId(eventData.id);
                        if (eventData.id === oldBtnId.current) {
                            setVisible((pre) => !pre);
                        } else {
                            oldBtnId.current = eventData.id;
                            setVisible(true);
                        }
                        break;
                    case "mouseenter":
                        if (eventData.eventId !== eventIdRef.current) {
                            break;
                        }
                        setActiveId(eventData.id);
                        hoverFnRef.current({
                            type: ActionType.UpdateBtnAction,
                            payload: {
                                value: true,
                                callback: hoveCallback,
                            },
                        });
                        break;
                    case "mouseleave":
                        if (eventData.eventId !== eventIdRef.current) {
                            break;
                        }
                        void hoverFnRef.current({
                            type: ActionType.UpdateBtnAction,
                            payload: { value: false, callback: hoveCallback },
                        });
                        break;
                    case "contextmenu":
                        timer.current && window.clearTimeout(timer.current);

                        if (eventData.eventId !== eventIdRef.current || !eventData.todo) {
                            break;
                        }

                        setActiveId(eventData.id);
                        if (eventData.id === oldBtnId.current) {
                            setVisible((pre) => !pre);
                        } else {
                            oldBtnId.current = eventData.id;
                            setVisible(true);
                        }
                        break;
                    case "changeShow":
                        setActiveId(eventData.id);
                        break;
                }
            };
            document.addEventListener(eventName, fn);
            return () => {
                document.removeEventListener(eventName, fn);
            };
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [eventName]);

        useEffect(() => {
            destroy.current = false;
            return () => {
                destroy.current = true;
            };
        }, []);

        /**
         * 下拉列表内容不做右击事件
         * 所以合并到click事件内
         *
         * 如需新增此事件 请做新的逻辑
         */
        const handleClick = () => {
            if (disableVal) {
                return;
            }
            timer.current && window.clearTimeout(timer.current);
            /**
             * 如果有自定义的展示状态
             * 则取消内部的交互
             */
            if (isCustom(show ?? dropdownProps.show)) {
                return;
            }

            const hideOnClickVal = hideOnClick ?? dropdownProps.hideOnClick ?? true;

            if (
                (triggerVal === "click" ||
                    triggerVal?.includes("click") ||
                    triggerVal === "contextmenu" ||
                    triggerVal?.includes("contextmenu")) &&
                hideOnClickVal
            ) {
                setVisible(false);
            }
        };

        /**
         * use hover dispatch的callback
         * @param status
         * @returns
         */
        const hoverFnParams = (status: boolean) => {
            return {
                value: status,
                callback: (res: boolean) => {
                    if (destroy.current) {
                        return;
                    }
                    setVisible(res);
                },
            };
        };

        /**
         * 鼠标移入
         * @returns
         */
        const handleMouseEnter = () => {
            if (disableVal) {
                return;
            }

            if (triggerVal === "hover" || triggerVal?.includes("hover")) {
                hoverFn({
                    type: ActionType.UpdateContentAction,
                    payload: hoverFnParams(true),
                });
            }
        };

        /**
         * 鼠标移开
         * @returns
         */
        const handleMouseLeave = () => {
            if (disableVal) {
                return;
            }

            if (triggerVal === "hover" || triggerVal?.includes("hover")) {
                hoverFn({
                    type: ActionType.UpdateContentAction,
                    payload: hoverFnParams(false),
                });
            }
        };

        const handleFocus = () => {
            if (disableVal) {
                return;
            }

            if (triggerVal === "focus" || triggerVal?.includes("focus")) {
                hoverFn({
                    type: ActionType.UpdateContentAction,
                    payload: hoverFnParams(true),
                });
            }
        };
        const handleBlur = () => {
            if (disableVal) {
                return;
            }

            if (triggerVal === "focus" || triggerVal?.includes("focus")) {
                hoverFn({
                    type: ActionType.UpdateContentAction,
                    payload: hoverFnParams(false),
                });
            }
        };

        const isRemove = () => {
            if (removeOnHide ?? dropdownProps.removeOnHide) {
                if (cache ?? dropdownProps.cache) {
                    if (!visible && !count.current && transitionEndRef.current) {
                        return true;
                    }
                } else if (!visible && transitionEndRef.current) {
                    return true;
                }
            }
            return false;
        };

        /**
         * 这里做次数判断
         */
        if (visible !== oldShow.current) {
            if (visible) {
                ++count.current;
            }
            transitionEndRef.current = false;
            setTransitionEnd(false);
            oldShow.current = visible;
        }

        const transitionEndFn = () => {
            setTransitionEnd(true);
            transitionEndRef.current = true;
        };

        /* <------------------------------------ **** FUNCTION END **** ------------------------------------ */

        return (
            <Portal
                show={visible}
                isRemove={isRemove()}
                direction={direction ?? dropdownProps.direction ?? "vertical"}
                placement={placement ?? dropdownProps.placement ?? "cb"}
                ref={(el) => {
                    // portalRef.current = el;

                    if (typeof ref === "function") {
                        ref(el);
                    } else if (ref !== null) {
                        (ref as React.MutableRefObject<HTMLElement | null>).current = el;
                    }
                }}
                root={(activeId ? btn.current[activeId] : undefined) as Element | undefined}
                handleTransitionEnd={transitionEndFn}
                handleTransitionCancel={transitionEndFn}
                animation={animate ?? dropdownProps.animate}
                triangleOffset={triangle ?? dropdownProps.triangle}
                portalOffset={offset ?? dropdownProps.offset}
                mount={mount ?? dropdownProps.mount}
                onClickCapture={(e) => {
                    onClickCapture?.(e);
                    handleClick();
                }}
                onMouseEnter={(e) => {
                    onMouseEnter?.(e);
                    handleMouseEnter();
                }}
                onMouseLeave={(e) => {
                    onMouseLeave?.(e);
                    handleMouseLeave();
                }}
                onMouseDown={(e) => {
                    onMouseDown?.(e);
                }}
                onFocus={(e) => {
                    onFocus?.(e);
                    handleFocus();
                }}
                onBlur={(e) => {
                    onBlur?.(e);
                    handleBlur();
                }}
                {...props}
                tabIndex={
                    (triggerVal === "focus" || triggerVal?.includes("focus")) && !disableVal
                        ? -1
                        : undefined
                }
            >
                {children}
            </Portal>
        );
    },
);
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */
DropdownContent.displayName = "DropdownContent";
