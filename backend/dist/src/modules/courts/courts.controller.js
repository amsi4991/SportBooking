"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourtsController = void 0;
const common_1 = require("@nestjs/common");
const courts_service_1 = require("./courts.service");
let CourtsController = class CourtsController {
    constructor(service) {
        this.service = service;
    }
    async list(query) {
        return this.service.listCourts({
            city: query.city,
            sport: query.sport,
            priceMin: query.priceMin ? parseInt(query.priceMin) : undefined,
            priceMax: query.priceMax ? parseInt(query.priceMax) : undefined
        });
    }
    async getById(id) {
        return this.service.getCourtById(id);
    }
    async getSlots(id, date) {
        return this.service.getAvailableSlots(id, new Date(date));
    }
};
exports.CourtsController = CourtsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CourtsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CourtsController.prototype, "getById", null);
__decorate([
    (0, common_1.Get)(':id/slots'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CourtsController.prototype, "getSlots", null);
exports.CourtsController = CourtsController = __decorate([
    (0, common_1.Controller)('courts'),
    __metadata("design:paramtypes", [courts_service_1.CourtsService])
], CourtsController);
