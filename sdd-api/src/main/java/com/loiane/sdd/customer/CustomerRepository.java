package com.loiane.sdd.customer;

import org.springframework.data.jpa.repository.JpaRepository;

interface CustomerRepository extends JpaRepository<Customer, Long> {
  boolean existsByEmail(String email);
}
