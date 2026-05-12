CREATE TABLE customer (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name  VARCHAR(100) NOT NULL,
    email      VARCHAR(255) NOT NULL,
    phone      VARCHAR(20),
    company    VARCHAR(150),
    PRIMARY KEY (id),
    UNIQUE KEY uk_customer_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
