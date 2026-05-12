package com.loiane.sdd.customer;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

record CustomerRequest(
    @NotBlank @Size(max = 100) @Pattern(regexp = "[\\p{L}\\-']+") String firstName,
    @NotBlank @Size(max = 100) @Pattern(regexp = "[\\p{L}\\-']+") String lastName,
    @NotBlank @Size(max = 255) @Email String email,
    @Size(max = 20) @Pattern(regexp = "[0-9 +()\\-]*") String phone,
    @Size(max = 150) String company) {}
