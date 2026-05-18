package com.loiane.sdd.customer;

import java.util.List;
import java.util.Map;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
class CustomerExceptionHandler {

  @ExceptionHandler(MethodArgumentNotValidException.class)
  ProblemDetail handleValidation(MethodArgumentNotValidException ex) {
    List<Map<String, String>> errors =
        ex.getBindingResult().getFieldErrors().stream()
            .map(fe -> Map.of("field", fe.getField(), "message", fe.getDefaultMessage()))
            .toList();
    ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
    pd.setProperty("errors", errors);
    return pd;
  }

  @ExceptionHandler(DuplicateEmailException.class)
  ProblemDetail handleDuplicateEmail(DuplicateEmailException ex) {
    return duplicateEmailConflict();
  }

  @ExceptionHandler(DataIntegrityViolationException.class)
  ProblemDetail handleDataIntegrity(DataIntegrityViolationException ex) {
    return duplicateEmailConflict();
  }

  private ProblemDetail duplicateEmailConflict() {
    ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.CONFLICT);
    pd.setProperty("errors", List.of(Map.of("field", "email", "message", "Email already in use")));
    return pd;
  }

  @ExceptionHandler(Exception.class)
  ProblemDetail handleGeneric(Exception ex) {
    ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.INTERNAL_SERVER_ERROR);
    pd.setDetail("An unexpected error occurred. Please try again later.");
    return pd;
  }
}
