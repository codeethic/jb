"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateMargin = calculateMargin;
/** Computed: (price - cost) / price */
function calculateMargin(price, cost) {
    if (price <= 0)
        return 0;
    return ((price - cost) / price) * 100;
}
//# sourceMappingURL=feature-item.js.map