"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Customer = void 0;
const PhoneNumber_js_1 = require("../../../../domain/value-objects/PhoneNumber.js");
class Customer {
    props;
    constructor(props) {
        // Valida telefone via Value Object
        const phoneVO = new PhoneNumber_js_1.PhoneNumber(props.phone);
        this.props = {
            ...props,
            phone: phoneVO.getValue(),
            pets: props.pets ?? [],
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
    get phone() {
        return this.props.phone;
    }
    get email() {
        return this.props.email;
    }
    get pets() {
        return this.props.pets ?? [];
    }
    get createdAt() {
        return this.props.createdAt;
    }
    get updatedAt() {
        return this.props.updatedAt;
    }
    update(name, phone, email) {
        const phoneVO = new PhoneNumber_js_1.PhoneNumber(phone);
        this.props.name = name;
        this.props.phone = phoneVO.getValue();
        this.props.email = email;
        this.props.updatedAt = new Date();
    }
    toJSON() {
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
exports.Customer = Customer;
