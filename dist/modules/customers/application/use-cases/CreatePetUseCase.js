"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePetUseCase = void 0;
const Pet_js_1 = require("../../domain/entities/Pet.js");
const AppError_js_1 = require("../../../../shared/errors/AppError.js");
class CreatePetUseCase {
    petRepo;
    customerRepo;
    constructor(petRepo, customerRepo) {
        this.petRepo = petRepo;
        this.customerRepo = customerRepo;
    }
    async execute(input) {
        const customer = await this.customerRepo.findById(input.customerId);
        if (!customer) {
            throw new AppError_js_1.NotFoundError('Tutor', input.customerId);
        }
        const pet = new Pet_js_1.Pet({
            name: input.name,
            breed: input.breed,
            size: input.size,
            customerId: input.customerId,
        });
        const savedPet = await this.petRepo.create(pet);
        return savedPet.toJSON();
    }
}
exports.CreatePetUseCase = CreatePetUseCase;
