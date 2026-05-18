package com.loiane.sdd.customer;

import org.springframework.stereotype.Service;

@Service
class CustomerService {

  private final CustomerRepository repository;

  CustomerService(CustomerRepository repository) {
    this.repository = repository;
  }

  CustomerResponse create(CustomerRequest request) {
    if (repository.existsByEmail(request.email())) {
      throw new DuplicateEmailException(request.email());
    }
    Customer customer = toEntity(request);
    Customer saved = repository.save(customer);
    return toResponse(saved);
  }

  private Customer toEntity(CustomerRequest request) {
    Customer customer = new Customer();
    customer.setFirstName(request.firstName());
    customer.setLastName(request.lastName());
    customer.setEmail(request.email());
    customer.setPhone(request.phone());
    customer.setCompany(request.company());
    return customer;
  }

  private CustomerResponse toResponse(Customer customer) {
    return new CustomerResponse(
        customer.getId(),
        customer.getFirstName(),
        customer.getLastName(),
        customer.getEmail(),
        customer.getPhone(),
        customer.getCompany());
  }
}
