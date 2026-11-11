"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pet = void 0;
class Pet {
    props;
    constructor(props) {
        this.props = {
            ...props,
            createdAt: props.createdAt ?? new Date(),
            updatedAt: props.updatedAt ?? new Date(),
        };
    }
    get id() {
        return this.props.id;
    }
    get name() {
        return this.props.name;
    }
    get breed() {
        return this.props.breed;
    }
    get size() {
        return this.props.size;
    }
    get customerId() {
        return this.props.customerId;
    }
    get createdAt() {
        return this.props.createdAt;
    }
    get updatedAt() {
        return this.props.updatedAt;
    }
    update(name, breed, size) {
        this.props.name = name;
        this.props.breed = breed;
        this.props.size = size;
        this.props.updatedAt = new Date();
    }
    toJSON() {
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
exports.Pet = Pet;
