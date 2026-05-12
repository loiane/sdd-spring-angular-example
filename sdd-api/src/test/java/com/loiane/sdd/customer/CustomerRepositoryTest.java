package com.loiane.sdd.customer;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.dao.DataIntegrityViolationException;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class CustomerRepositoryTest {

  @Autowired private CustomerRepository repository;

  @Test
  @DisplayName("given valid customer data, when saved, then id is assigned and email is findable")
  void saveValidCustomer() {
    Customer customer = new Customer();
    customer.setFirstName("John");
    customer.setLastName("Doe");
    customer.setEmail("john.doe@example.com");

    Customer saved = repository.save(customer);

    assertThat(saved.getId()).isNotNull();
    assertThat(repository.existsByEmail("john.doe@example.com")).isTrue();
  }

  @Test
  @DisplayName("given customer with all optional fields, when saved and reloaded, then all field values are preserved")
  void saveCustomerWithAllFieldsAndReadBack() {
    Customer customer = new Customer();
    customer.setFirstName("Jane");
    customer.setLastName("Smith");
    customer.setEmail("jane.smith@example.com");
    customer.setPhone("+1 555 123 4567");
    customer.setCompany("Acme Corp");

    Customer saved = repository.saveAndFlush(customer);

    assertThat(saved.getFirstName()).isEqualTo("Jane");
    assertThat(saved.getLastName()).isEqualTo("Smith");
    assertThat(saved.getEmail()).isEqualTo("jane.smith@example.com");
    assertThat(saved.getPhone()).isEqualTo("+1 555 123 4567");
    assertThat(saved.getCompany()).isEqualTo("Acme Corp");
  }

  @Test
  @DisplayName("given email not in database, when existsByEmail is called, then returns false")
  void existsByEmailReturnsFalseForUnknownEmail() {
    assertThat(repository.existsByEmail("nobody@example.com")).isFalse();
  }

  @Test
  @DisplayName("given duplicate email, when second customer is saved, then DataIntegrityViolationException is thrown")
  void duplicateEmailThrowsDataIntegrityViolation() {
    Customer first = new Customer();
    first.setFirstName("Alice");
    first.setLastName("Smith");
    first.setEmail("alice@example.com");
    repository.saveAndFlush(first);

    Customer duplicate = new Customer();
    duplicate.setFirstName("Bob");
    duplicate.setLastName("Jones");
    duplicate.setEmail("alice@example.com");

    assertThatThrownBy(() -> repository.saveAndFlush(duplicate))
        .isInstanceOf(DataIntegrityViolationException.class);
  }
}
