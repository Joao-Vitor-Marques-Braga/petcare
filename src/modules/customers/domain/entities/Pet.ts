export type PetSize = 'PEQUENO' | 'MEDIO' | 'GRANDE';

export interface PetProps {
  id?: string;
  name: string;
  breed: string;
  size: PetSize;
  customerId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Pet {
  private props: PetProps;

  constructor(props: PetProps) {
    this.props = {
      ...props,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    };
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get breed(): string {
    return this.props.breed;
  }

  get size(): PetSize {
    return this.props.size;
  }

  get customerId(): string {
    return this.props.customerId;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  public update(name: string, breed: string, size: PetSize): void {
    this.props.name = name;
    this.props.breed = breed;
    this.props.size = size;
    this.props.updatedAt = new Date();
  }

  public toJSON() {
    return {
      id: this.props.id,
      name: this.props.name,
      breed: this.props.breed,
      size: this.props.size,
      customerId: this.props.customerId,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
