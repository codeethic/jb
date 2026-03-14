"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRole = exports.FeatureStatus = exports.MealPeriod = void 0;
var MealPeriod;
(function (MealPeriod) {
    MealPeriod["LUNCH"] = "lunch";
    MealPeriod["DINNER"] = "dinner";
})(MealPeriod || (exports.MealPeriod = MealPeriod = {}));
var FeatureStatus;
(function (FeatureStatus) {
    FeatureStatus["DRAFT"] = "draft";
    FeatureStatus["PUBLISHED"] = "published";
    FeatureStatus["EIGHTY_SIXED"] = "86d";
})(FeatureStatus || (exports.FeatureStatus = FeatureStatus = {}));
var UserRole;
(function (UserRole) {
    UserRole["SERVER"] = "server";
    UserRole["CHEF"] = "chef";
    UserRole["MANAGER"] = "manager";
    UserRole["ADMIN"] = "admin";
})(UserRole || (exports.UserRole = UserRole = {}));
//# sourceMappingURL=index.js.map