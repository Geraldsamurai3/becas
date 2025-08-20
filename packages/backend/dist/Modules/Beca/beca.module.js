"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BecaModule = void 0;
const common_1 = require("@nestjs/common");
const beca_service_1 = require("./beca.service");
const beca_controller_1 = require("./beca.controller");
const pdf_module_1 = require("../Pdf/pdf.module");
const email_module_1 = require("../Email/email.module");
let BecaModule = class BecaModule {
};
exports.BecaModule = BecaModule;
exports.BecaModule = BecaModule = __decorate([
    (0, common_1.Module)({
        imports: [pdf_module_1.PdfModule, email_module_1.EmailModule],
        controllers: [beca_controller_1.BecaController],
        providers: [beca_service_1.BecaService],
    })
], BecaModule);
//# sourceMappingURL=beca.module.js.map