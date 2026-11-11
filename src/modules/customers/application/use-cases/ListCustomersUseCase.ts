import { ICustomerRepository } from '../../domain/repositories/ICustomerRepository.js';

export class ListCustomersUseCase {
  constructor(private customerRepo: ICustomerRepository) {}

  async execute() {
    const customers = await this.customerRepo.findAll();
    return customers.map((c) => c.toJSON());
  }
}
