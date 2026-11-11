import { PhoneNumber } from '../../../../domain/value-objects/PhoneNumber.js';
import { Pet } from './Pet.js';

export interface CustomerProps {
  id?: string;
  name: string;
  phone: string;
  email?: string | null;
  pets?: Pet[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class Customer {
  private props: CustomerProps;

  constructor(props: CustomerProps) {
    // Valida telefone via Value Object
    const phoneVO = new PhoneNumber(props.phone);
    this.props = {
      ...props,
      phone: phoneVO.getValue(),
      pets: props.pets ?? [],
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

  get phone(): string {
    return this.props.phone;
  }

  get email(): string | null | undefined {
    return this.props.email;
  }

  get pets(): Pet[] {
    return this.props.pets ?? [];
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  public update(name: string, phone: string, email?: string | null): void {
    const phoneVO = new PhoneNumber(phone);
    this.props.name = name;
    this.props.phone = phoneVO.getValue();
    this.props.email = email;
    this.props.updatedAt = new Date();
  }

  public toJSON() {
    return {
      id: this.props.id,
      name: this.props.name,
      phone: this.props.phone,
      email: this.props.email,
      pets: this.props.pets?.map(p => p.toJSON()),
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
