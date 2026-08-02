CREATE TABLE incidents (
    id          UUID NOT NULL,
    title       VARCHAR(255) NOT NULL,
    service     VARCHAR(255) NOT NULL,
    severity    VARCHAR(255) NOT NULL,
    status      VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    CONSTRAINT incidents_pkey PRIMARY KEY (id),
    CONSTRAINT incidents_severity_check CHECK (severity IN ('P1', 'P2', 'P3', 'P4'))
);