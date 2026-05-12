package com.loiane.sdd.customer;

record CustomerResponse(
    Long id, String firstName, String lastName, String email, String phone, String company) {}
