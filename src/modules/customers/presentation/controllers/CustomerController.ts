import { Request, Response, NextFunction } from 'express';
import { CreateCustomerUseCase } from '../../application/use-cases/CreateCustomerUseCase.js';
import { ListCustomersUseCase } from '../../application/use-cases/ListCustomersUseCase.js';
import { CreatePetUseCase } from '../../application/use-cases/CreatePetUseCase.js';
import { createCustomerSchema, createPetSchema } from '../schemas/customer.schemas.js';

import { ICustomerRepository } from '../../domain/repositories/ICustomerRepository.js';

export class CustomerController {
  constructor(
    private createCustomerUseCase: CreateCustomerUseCase,
    private listCustomersUseCase: ListCustomersUseCase,
    private createPetUseCase: CreatePetUseCase,
    private customerRepo?: ICustomerRepository
  ) {}

  createCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = createCustomerSchema.parse(req.body);
      const result = await this.createCustomerUseCase.execute(validatedData);
      return res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  listCustomers = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.listCustomersUseCase.execute();
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  createPet = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = createPetSchema.parse(req.body);
      const result = await this.createPetUseCase.execute(validatedData);
      return res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  deleteCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (this.customerRepo) {
        await this.customerRepo.delete(String(req.params.id));
      }
      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}
