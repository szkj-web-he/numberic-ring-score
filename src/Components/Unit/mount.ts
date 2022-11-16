/**
 * @file mount
 * @date 2022-01-10
 * @author xuejie.he
 * @lastModify xuejie.he 2022-01-10
 */

export const mountElement = (el?: Element): Element => {
    if (el) {
        return el;
    }
    let node = document.querySelector("body > div[data-key=r_portal]");
    if (!node) {
        node = document.createElement("div");
        node.setAttribute("style", `height: 0;position: absolute;top: 0;left: 0;`);
        node.setAttribute("data-key", "r_portal");
        document.body.appendChild(node);
    }
    return node;
};
