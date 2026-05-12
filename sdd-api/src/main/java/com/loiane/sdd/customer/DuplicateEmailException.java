package com.loiane.sdd.customer;

class DuplicateEmailException extends RuntimeException {
  DuplicateEmailException(String email) {
    super("Email already in use: " + email);
  }
}
