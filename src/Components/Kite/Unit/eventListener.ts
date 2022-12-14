/**
 * @file: bind methods
 * @date: 2021-05-20 14:19
 * @author: xuejie.he
 * @lastModify: xuejie.he 2021-05-20 14:20
 */

export interface EventParams {
    type: keyof WindowEventMap;
    listener: EventListenerOrEventListenerObject;
    option?: boolean | AddEventListenerOptions;
}

// window event add
export function addEventList(el: typeof window | Document | Element, params: EventParams[]): void {
    for (const param of params) {
        el.addEventListener(param.type, param.listener, param.option);
    }
}

/**
 * @param {window | Document | Element} el element
 * @param {EventParams[]} params eventParams
 */
// window event remove
export function removeEventList(
    el: typeof window | Document | Element,
    params: EventParams[],
): void {
    for (const param of params) {
        el.removeEventListener(param.type, param.listener, param.option);
    }
}
