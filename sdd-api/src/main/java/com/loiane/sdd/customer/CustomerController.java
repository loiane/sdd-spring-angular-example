package com.loiane.sdd.customer;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/customers")
class CustomerController {

  private final CustomerService customerService;

  CustomerController(CustomerService customerService) {
    this.customerService = customerService;
  }

  @PostMapping
  ResponseEntity<CustomerResponse> create(@Valid @RequestBody CustomerRequest request) {
    CustomerResponse response = customerService.create(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }
}
