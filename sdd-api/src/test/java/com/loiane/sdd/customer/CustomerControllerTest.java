package com.loiane.sdd.customer;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(CustomerController.class)
class CustomerControllerTest {

  @Autowired MockMvc mockMvc;

  @MockitoBean CustomerService customerService;

  @Test
  @DisplayName(
      "given valid customer request,"
          + " when POST /api/customers,"
          + " then 201 Created with response body is returned")
  void createReturns201WithBodyForValidRequest() throws Exception {
    CustomerResponse response =
        new CustomerResponse(1L, "John", "Doe", "john@example.com", null, null);
    when(customerService.create(any(CustomerRequest.class))).thenReturn(response);

    mockMvc
        .perform(
            post("/api/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"firstName":"John","lastName":"Doe","email":"john@example.com"}
                    """))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").value(1L))
        .andExpect(jsonPath("$.firstName").value("John"))
        .andExpect(jsonPath("$.email").value("john@example.com"));
  }

  @Test
  @DisplayName(
      "given blank firstName,"
          + " when POST /api/customers,"
          + " then 400 Bad Request with errors array is returned")
  void createReturns400WithErrorsForBlankFirstName() throws Exception {
    mockMvc
        .perform(
            post("/api/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"firstName":"","lastName":"Doe","email":"john@example.com"}
                    """))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.errors").isArray())
        .andExpect(jsonPath("$.errors[0].field").exists())
        .andExpect(jsonPath("$.errors[0].message").exists());
  }

  @Test
  @DisplayName(
      "given duplicate email,"
          + " when POST /api/customers,"
          + " then 409 Conflict with email field error is returned")
  void createReturns409WithEmailErrorForDuplicateEmail() throws Exception {
    when(customerService.create(any(CustomerRequest.class)))
        .thenThrow(new DuplicateEmailException("john@example.com"));

    mockMvc
        .perform(
            post("/api/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"firstName":"John","lastName":"Doe","email":"john@example.com"}
                    """))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.errors").isArray())
        .andExpect(jsonPath("$.errors[0].field").value("email"));
  }

  @Test
  @DisplayName(
      "given unexpected exception from service,"
          + " when POST /api/customers,"
          + " then 500 Internal Server Error with detail is returned")
  void createReturns500WithDetailForUnexpectedException() throws Exception {
    when(customerService.create(any(CustomerRequest.class)))
        .thenThrow(new RuntimeException("unexpected"));

    mockMvc
        .perform(
            post("/api/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"firstName":"John","lastName":"Doe","email":"john@example.com"}
                    """))
        .andExpect(status().isInternalServerError())
        .andExpect(jsonPath("$.detail").exists());
  }

  @Test
  @DisplayName(
      "given DataIntegrityViolationException from service (race-condition duplicate email),"
          + " when POST /api/customers,"
          + " then 409 Conflict with email field error is returned")
  void createReturns409ForDataIntegrityViolation() throws Exception {
    when(customerService.create(any(CustomerRequest.class)))
        .thenThrow(new DataIntegrityViolationException("uk_customer_email"));

    mockMvc
        .perform(
            post("/api/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"firstName":"John","lastName":"Doe","email":"john@example.com"}
                    """))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.errors").isArray())
        .andExpect(jsonPath("$.errors[0].field").value("email"));
  }
}
