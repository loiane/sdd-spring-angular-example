package com.loiane.sdd.customer;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.lang.reflect.Field;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

  @Mock private CustomerRepository repository;

  @InjectMocks private CustomerService service;

  @Test
  @DisplayName(
      "given valid customer request, when create is called,"
          + " then CustomerResponse with assigned id is returned")
  void createReturnsCustomerResponseWithId() throws Exception {
    CustomerRequest request =
        new CustomerRequest("John", "Doe", "john@example.com", "+1 555 0100", "Acme");

    Customer saved = new Customer();
    saved.setFirstName("John");
    saved.setLastName("Doe");
    saved.setEmail("john@example.com");
    saved.setPhone("+1 555 0100");
    saved.setCompany("Acme");
    setId(saved, 42L);

    when(repository.existsByEmail("john@example.com")).thenReturn(false);
    when(repository.save(any(Customer.class))).thenReturn(saved);

    CustomerResponse response = service.create(request);

    assertThat(response.id()).isEqualTo(42L);
    assertThat(response.firstName()).isEqualTo("John");
    assertThat(response.lastName()).isEqualTo("Doe");
    assertThat(response.email()).isEqualTo("john@example.com");
    assertThat(response.phone()).isEqualTo("+1 555 0100");
    assertThat(response.company()).isEqualTo("Acme");
  }

  @Test
  @DisplayName(
      "given email already in database, when create is called,"
          + " then DuplicateEmailException is thrown and save is never called")
  void createThrowsDuplicateEmailExceptionWhenEmailExists() {
    CustomerRequest request = new CustomerRequest("John", "Doe", "john@example.com", null, null);

    when(repository.existsByEmail("john@example.com")).thenReturn(true);

    assertThatThrownBy(() -> service.create(request)).isInstanceOf(DuplicateEmailException.class);

    verify(repository, never()).save(any(Customer.class));
  }

  private static void setId(Customer customer, Long id) throws Exception {
    Field idField = Customer.class.getDeclaredField("id");
    idField.setAccessible(true);
    idField.set(customer, id);
  }
}
