package com.loiane.sdd.customer;

import static org.assertj.core.api.Assertions.assertThat;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import javax.sql.DataSource;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class CustomerRepositoryIT {

  @Autowired private DataSource dataSource;

  @Test
  @DisplayName(
      "given a running database,"
          + " when the schema is inspected,"
          + " then the customer table has all expected columns")
  void customerTableExistsWithAllColumns() throws Exception {
    try (Connection conn = dataSource.getConnection()) {
      DatabaseMetaData meta = conn.getMetaData();
      List<String> columns = new ArrayList<>();
      try (ResultSet rs = meta.getColumns(conn.getCatalog(), null, "customer", null)) {
        while (rs.next()) {
          columns.add(rs.getString("COLUMN_NAME"));
        }
      }
      assertThat(columns)
          .containsExactlyInAnyOrder("id", "first_name", "last_name", "email", "phone", "company");
    }
  }

  @Test
  @DisplayName(
      "given a running database,"
          + " when unique indexes are inspected,"
          + " then uk_customer_email constraint is present")
  void customerEmailColumnHasUniqueConstraint() throws Exception {
    try (Connection conn = dataSource.getConnection()) {
      DatabaseMetaData meta = conn.getMetaData();
      List<String> indexNames = new ArrayList<>();
      try (ResultSet rs = meta.getIndexInfo(conn.getCatalog(), null, "customer", true, false)) {
        while (rs.next()) {
          String indexName = rs.getString("INDEX_NAME");
          if (indexName != null) {
            indexNames.add(indexName);
          }
        }
      }
      assertThat(indexNames).contains("uk_customer_email");
    }
  }
}
