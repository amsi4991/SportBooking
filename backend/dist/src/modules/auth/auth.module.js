"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const jwt_strategy_1 = require("./jwt.strategy");
const fs = __importStar(require("fs"));
const auth_service_1 = require("./auth.service");
const prisma_service_1 = require("../../database/prisma.service");
const auth_controller_1 = require("./auth.controller");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            jwt_1.JwtModule.registerAsync({
                useFactory: async () => {
                    const privateKeyPath = process.env.JWT_PRIVATE_KEY_PATH || './keys/private.pem';
                    const publicKeyPath = process.env.JWT_PUBLIC_KEY_PATH || './keys/public.pem';
                    console.log(`[JWT] Reading keys from: ${privateKeyPath}, ${publicKeyPath}`);
                    try {
                        const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
                        const publicKey = fs.readFileSync(publicKeyPath, 'utf8');
                        console.log(`[JWT] ✅ Keys loaded successfully (priv: ${privateKey.length} bytes, pub: ${publicKey.length} bytes)`);
                        return {
                            privateKey,
                            publicKey,
                            signOptions: { expiresIn: '15m', algorithm: 'RS256' }
                        };
                    }
                    catch (error) {
                        console.error(`[JWT] ❌ FAILED to load keys:`, error);
                        throw error;
                    }
                }
            })
        ],
        providers: [jwt_strategy_1.JwtStrategy, auth_service_1.AuthService, prisma_service_1.PrismaService],
        controllers: [auth_controller_1.AuthController],
        exports: [jwt_1.JwtModule, auth_service_1.AuthService]
    })
], AuthModule);
