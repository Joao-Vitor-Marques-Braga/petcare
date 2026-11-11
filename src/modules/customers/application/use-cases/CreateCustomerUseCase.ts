import { ICustomerRepository } from '../../domain/repositories/ICustomerRepository.js';
import { IPetRepository } from '../../domain/repositories/IPetRepository.js';
import { Customer } from '../../domain/entities/Customer.js';
import { Pet, PetSize } from '../../domain/entities/Pet.js';
import { BusinessRuleError } from '../../../../shared/errors/AppError.js';

export interface CreateCustomerInput {
  name: string;
  phone: string;
  email?: string | null;
  pets?: Array<{
    name: string;
    breed: string;
    size: PetSize;
  }>;
}

export class CreateCustomerUseCase {
  constructor(
    private customerRepo: ICustomerRepository,
    private petRepo: IPetRepository
  ) {}

  async execute(input: CreateCustomerInput) {
    const existing = await this.customerRepo.findByPhone(input.phone);
    if (existing) {
      throw new BusinessRuleError(`Já existe um tutor cadastrado com o telefone ${input.phone}`);
    }

    const customer = new Customer({
      name: input.name,
      phone: input.phone,
      email: input.email,
    });

    const savedCustomer = await this.customerRepo.create(customer);

    if (input.pets && input.pets.length > 0 && savedCustomer.id) {
      for (const petData of input.pets) {
        const pet = new Pet({
          name: petData.name,
          breed: petData.breed,
          size: petData.size,
          customerId: savedCustomer.id,
        });
        await this.petRepo.create(pet);
      }
    }

    // Retorna com os pets carregados
    return (await this.customerRepo.findById(savedCustomer.id!))?.toJSON();
  }
}
