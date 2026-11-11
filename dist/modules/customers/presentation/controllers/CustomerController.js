"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerController = void 0;
const customer_schemas_js_1 = require("../schemas/customer.schemas.js");
class CustomerController {
    createCustomerUseCase;
    listCustomersUseCase;
    createPetUseCase;
    customerRepo;
    constructor(createCustomerUseCase, listCustomersUseCase, createPetUseCase, customerRepo) {
        this.createCustomerUseCase = createCustomerUseCase;
        this.listCustomersUseCase = listCustomersUseCase;
        this.createPetUseCase = createPetUseCase;
        this.customerRepo = customerRepo;
    }
    createCustomer = async (req, res, next) => {
        try {
            const validatedData = customer_schemas_js_1.createCustomerSchema.parse(req.body);
            const result = await this.createCustomerUseCase.execute(validatedData);
            return res.status(201).json(result);
        }
        catch (err) {
            next(err);
        }
    };
    listCustomers = async (_req, res, next) => {
        try {
            const result = await this.listCustomersUseCase.execute();
            return res.status(200).json(result);
        }
        catch (err) {
            next(err);
        }
    };
    createPet = async (req, res, next) => {
        try {
            const validatedData = customer_schemas_js_1.createPetSchema.parse(req.body);
            const result = await this.createPetUseCase.execute(validatedData);
            return res.status(201).json(result);
        }
        catch (err) {
            next(err);
        }
    };
    deleteCustomer = async (req, res, next) => {
        try {
            if (this.customerRepo) {
                await this.customerRepo.delete(String(req.params.id));
            }
            return res.status(204).send();
        }
        catch (err) {
            next(err);
        }
    };
}
exports.CustomerController = CustomerController;
