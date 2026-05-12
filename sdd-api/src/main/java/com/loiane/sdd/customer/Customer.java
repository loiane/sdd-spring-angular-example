package com.loiane.sdd.customer;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "customer")
class Customer {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "first_name", nullable = false, length = 100)
  private String firstName;

  @Column(name = "last_name", nullable = false, length = 100)
  private String lastName;

  @Column(name = "email", nullable = false, unique = true, length = 255)
  private String email;

  @Column(name = "phone", length = 20)
  private String phone;

  @Column(name = "company", length = 150)
  private String company;

  Long getId() {
    return id;
  }

  void setFirstName(String firstName) {
    this.firstName = firstName;
  }

  void setLastName(String lastName) {
    this.lastName = lastName;
  }

  void setEmail(String email) {
    this.email = email;
  }

  void setPhone(String phone) {
    this.phone = phone;
  }

  void setCompany(String company) {
    this.company = company;
  }

  String getFirstName() {
    return firstName;
  }

  String getLastName() {
    return lastName;
  }

  String getEmail() {
    return email;
  }

  String getPhone() {
    return phone;
  }

  String getCompany() {
    return company;
  }
}
