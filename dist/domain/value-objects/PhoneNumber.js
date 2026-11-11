"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhoneNumber = void 0;
const AppError_js_1 = require("../../shared/errors/AppError.js");
class PhoneNumber {
    value;
    constructor(rawPhone) {
        const cleaned = rawPhone.replace(/\D/g, '');
        // Validação mínima de telefone brasileiro (DDD + 8 ou 9 dígitos = 10 ou 11 dígitos)
        // Com DDI 55 = 12 ou 13 dígitos
        let normalized = cleaned;
        if (cleaned.length === 10 || cleaned.length === 11) {
            normalized = `55${cleaned}`;
        }
        if (normalized.length < 12 || normalized.length > 13) {
            throw new AppError_js_1.ValidationError(`Número de telefone inválido: '${rawPhone}'. Deve conter DDD e 8 ou 9 dígitos.`);
        }
        this.value = normalized;
    }
    getValue() {
        return this.value;
    }
    getFormatted() {
        // Retorna no formato (XX) 9XXXX-XXXX
        const withoutDDI = this.value.startsWith('55') ? this.value.slice(2) : this.value;
        const ddd = withoutDDI.slice(0, 2);
        const rest = withoutDDI.slice(2);
        if (rest.length === 9) {
            return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
        }
        return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
    }
}
exports.PhoneNumber = PhoneNumber;
