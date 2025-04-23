CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS book_rank_source (
    id SERIAL PRIMARY KEY,
    org_name VARCHAR(200),
    publish_date DATE
);

CREATE TABLE IF NOT EXISTS ranked_books (
    id SERIAL PRIMARY KEY,
    list_id INTEGER REFERENCES book_rank_source(id),
    rank INTEGER,
    title varchar(200),
    author_name varchar(200),
    publish_year varchar(10)
);