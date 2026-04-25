"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const postcss_1 = __importDefault(require("postcss"));
function parseScreens(root) {
    const screens = new Map();
    root.walkAtRules('screens', (rule) => {
        rule.walkDecls((decl) => {
            screens.set(decl.prop.trim(), decl.value.trim());
        });
        rule.remove();
    });
    return screens;
}
function adaptScreens(root, screens) {
    root.walkAtRules((rule) => {
        var _a;
        if (!screens.has(rule.name))
            return;
        const mediaQuery = screens.get(rule.name);
        const clonedParent = rule.parent.clone();
        clonedParent.removeAll();
        clonedParent.raws.before = '\n  ';
        (_a = rule.nodes) === null || _a === void 0 ? void 0 : _a.forEach(node => {
            clonedParent.append(node.clone());
        });
        clonedParent.raws.semicolon = true;
        clonedParent.raws.after = '\n  ';
        const mediaRule = postcss_1.default.atRule({
            name: 'media',
            params: mediaQuery,
            nodes: [clonedParent],
            raws: {
                afterName: ' ',
                between: ' ',
                after: '\n',
                before: '\n'
            }
        });
        mediaRule.raws.after = '\n';
        rule.parent.after(mediaRule);
        rule.remove();
    });
}
const screenAdapt = {
    postcssPlugin: 'screen-adapt',
    Once(root) {
        const screens = parseScreens(root);
        if (screens.size === 0)
            return;
        adaptScreens(root, screens);
        root.walkRules((rule) => {
            rule.raws.semicolon = true;
        });
    }
};
exports.default = screenAdapt;
