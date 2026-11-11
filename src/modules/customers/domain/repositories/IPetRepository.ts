import { Pet } from '../entities/Pet.js';

export interface IPetRepository {
  findById(id: string): Promise<Pet | null>;
  findByCustomerId(customerId: string): Promise<Pet[]>;
  findAll(): Promise<Pet[]>;
  create(pet: Pet): Promise<Pet>;
  update(pet: Pet): Promise<Pet>;
  delete(id: string): Promise<void>;
}
