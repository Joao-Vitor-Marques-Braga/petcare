import { IPetRepository } from '../../domain/repositories/IPetRepository.js';
import { ICustomerRepository } from '../../domain/repositories/ICustomerRepository.js';
import { Pet, PetSize } from '../../domain/entities/Pet.js';
import { NotFoundError } from '../../../../shared/errors/AppError.js';

export interface CreatePetInput {
  name: string;
  breed: string;
  size: PetSize;
  customerId: string;
}

export class CreatePetUseCase {
  constructor(
    private petRepo: IPetRepository,
    private customerRepo: ICustomerRepository
  ) {}

  async execute(input: CreatePetInput) {
    const customer = await this.customerRepo.findById(input.customerId);
    if (!customer) {
      throw new NotFoundError('Tutor', input.customerId);
    }

    const pet = new Pet({
      name: input.name,
      breed: input.breed,
      size: input.size,
      customerId: input.customerId,
    });

    const savedPet = await this.petRepo.create(pet);
    return savedPet.toJSON();
  }
}
