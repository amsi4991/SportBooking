"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const admin_module_1 = require("./modules/admin/admin.module");
const auth_module_1 = require("./modules/auth/auth.module");
const pricing_module_1 = require("./modules/pricing/pricing.module");
const wallet_module_1 = require("./modules/wallet/wallet.module");
const bookings_module_1 = require("./modules/bookings/bookings.module");
const courts_module_1 = require("./modules/courts/courts.module");
const profile_module_1 = require("./modules/profile/profile.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
            admin_module_1.AdminModule,
            pricing_module_1.PricingModule,
            wallet_module_1.WalletModule,
            bookings_module_1.BookingsModule,
            courts_module_1.CourtsModule,
            profile_module_1.ProfileModule
        ],
    })
], AppModule);
