CREATE TABLE customers (
                           customer_id   BIGSERIAL PRIMARY KEY,
                           public_id     VARCHAR(32) NOT NULL UNIQUE,
                           full_name     VARCHAR(200) NOT NULL,
                           email         VARCHAR(320) NOT NULL UNIQUE,
                           status        VARCHAR(32) NOT NULL,
                           version       BIGINT NOT NULL DEFAULT 0,
                           created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
                           updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
                           CONSTRAINT ck_customer_status CHECK (status IN ('PROSPECT', 'ACTIVE', 'CLOSED'))
);

CREATE TABLE interactions (
                              interaction_id BIGSERIAL PRIMARY KEY,
                              customer_id    BIGINT,
                              summary        VARCHAR(200),
                              created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
                              CONSTRAINT fk_interaction_customer
                                  FOREIGN KEY (customer_id)
                                      REFERENCES customers (customer_id)
                                      ON DELETE SET NULL
);