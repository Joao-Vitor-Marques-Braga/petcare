"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListCustomersUseCase = void 0;
class ListCustomersUseCase {
    customerRepo;
    constructor(customerRepo) {
        this.customerRepo = customerRepo;
    }
    async execute() {
        const customers = await this.customerRepo.findAll();
        return customers.map((c) => c.toJSON());
    }
}
exports.ListCustomersUseCase = ListCustomersUseCase;
