/**
 * @file get element Fiber
 * @date 2021-12-31
 * @author xuejie.he
 * @lastModify xuejie.he 2021-12-31
 */

import { Fiber, fiberKey } from "./findDomNode";

/**
 *
 * @param {Element} el
 * @returns {Fiber|null}
 */
export const getElFiber = (el: Element): Fiber | null => {
    const keys = Object.keys(el);
    let key = "";
    for (let i = 0; i < keys.length; ) {
        const item = keys[i];
        if (item.includes(fiberKey)) {
            i = keys.length;
            key = item;
        } else {
            ++i;
        }
    }
    return key ? ((el as unknown as Record<string, unknown>)[key] as Fiber) : null;
};
