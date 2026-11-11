"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCustomerUseCase = void 0;
const Customer_js_1 = require("../../domain/entities/Customer.js");
const Pet_js_1 = require("../../domain/entities/Pet.js");
const AppError_js_1 = require("../../../../shared/errors/AppError.js");
class CreateCustomerUseCase {
    customerRepo;
    petRepo;
    constructor(customerRepo, petRepo) {
        this.customerRepo = customerRepo;
        this.petRepo = petRepo;
    }
    async execute(input) {
        const existing = await this.customerRepo.findByPhone(input.phone);
        if (existing) {
            throw new AppError_js_1.BusinessRuleError(`Já existe um tutor cadastrado com o telefone ${input.phone}`);
        }
        const customer = new Customer_js_1.Customer({
            name: input.name,
            phone: input.phone,
            email: input.email,
        });
        const savedCustomer = await this.customerRepo.create(customer);
        if (input.pets && input.pets.length > 0 && savedCustomer.id) {
            for (const petData of input.pets) {
                const pet = new Pet_js_1.Pet({
                    name: petData.name,
                    breed: petData.breed,
                    size: petData.size,
                    customerId: savedCustomer.id,
                });
                await this.petRepo.create(pet);
            }
        }
        // Retorna com os pets carregados
        return (await this.customerRepo.findById(savedCustomer.id))?.toJSON();
    }
}
exports.CreateCustomerUseCase = CreateCustomerUseCase;
