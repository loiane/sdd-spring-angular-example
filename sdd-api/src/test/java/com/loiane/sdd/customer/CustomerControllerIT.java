package com.loiane.sdd.customer;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.web.client.DefaultResponseErrorHandler;
import org.springframework.web.client.RestTemplate;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class CustomerControllerIT {

  @LocalServerPort int port;

  private RestTemplate restTemplate;

  @BeforeEach
  void setUp() {
    restTemplate = new RestTemplate();
    restTemplate.setErrorHandler(
        new DefaultResponseErrorHandler() {
          @Override
          public boolean hasError(ClientHttpResponse response) throws IOException {
            return false;
          }
        });
  }

  private String baseUrl() {
    return "http://localhost:" + port;
  }

  @Test
  @DisplayName(
      "given valid customer request,"
          + " when POST /api/customers,"
          + " then 201 Created with assigned id in body is returned")
  void createReturns201WithIdForValidRequest() {
    CustomerRequest request =
        new CustomerRequest(
            "Jane", "Doe", "jane." + System.nanoTime() + "@example.com", null, null);

    ResponseEntity<CustomerResponse> response =
        restTemplate.postForEntity(baseUrl() + "/api/customers", request, CustomerResponse.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
    assertThat(response.getBody()).isNotNull();
    assertThat(response.getBody().id()).isNotNull().isPositive();
  }

  @Test
  @DisplayName(
      "given same email sent twice,"
          + " when POST /api/customers for the second time,"
          + " then 409 Conflict is returned")
  void createReturns409ForDuplicateEmail() {
    String uniqueEmail = "dup." + System.nanoTime() + "@example.com";
    CustomerRequest request = new CustomerRequest("Jane", "Doe", uniqueEmail, null, null);

    restTemplate.postForEntity(baseUrl() + "/api/customers", request, CustomerResponse.class);
    ResponseEntity<String> second =
        restTemplate.postForEntity(baseUrl() + "/api/customers", request, String.class);

    assertThat(second.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
  }
}
