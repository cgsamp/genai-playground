/*
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS entity_summary;
DROP TABLE IF EXISTS ranked_books;
DROP TABLE IF EXISTS book_rank_source;
DROP TABLE IF EXISTS model_configuration;
DROP TABLE IF EXISTS model;
*/

CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    content TEXT,
    created_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS book_rank_source (
    id BIGSERIAL PRIMARY KEY,
    org_name VARCHAR(200),
    publish_date DATE
);

CREATE TABLE IF NOT EXISTS ranked_books (
    id BIGSERIAL PRIMARY KEY,
    list_id BIGINT REFERENCES book_rank_source(id),
    rank INTEGER,
    title varchar(200),
    author_name varchar(200),
    publish_year varchar(10)
);

CREATE TABLE IF NOT EXISTS model (
    id BIGSERIAL PRIMARY KEY,
    model_name VARCHAR(200),
    model_provider VARCHAR(200),
    model_api_url VARCHAR(200),
    comment TEXT
);

CREATE TABLE IF NOT EXISTS model_configuration (
    id BIGSERIAL PRIMARY KEY,
    model_id BIGINT REFERENCES model(id),
    model_config JSONB,
    comment TEXT,
    created_at TIMESTAMPTZ
);


CREATE TABLE IF NOT EXISTS entity_summary (
    id BIGSERIAL PRIMARY KEY,
    model_configuration_id BIGINT REFERENCES model_configuration(id),
    entity varchar(200),
	entity_id BIGINT,
    summary TEXT,
    created_at TIMESTAMPTZ
);

