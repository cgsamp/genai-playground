
CREATE SEQUENCE IF NOT EXISTS messages_id_seq;
CREATE SEQUENCE IF NOT EXISTS book_rank_source_id_seq;
CREATE SEQUENCE IF NOT EXISTS ranked_books_id_seq;
CREATE SEQUENCE IF NOT EXISTS model_id_seq;
CREATE SEQUENCE IF NOT EXISTS model_configuration_id_seq;
CREATE SEQUENCE IF NOT EXISTS entity_summary_id_seq;
CREATE SEQUENCE IF NOT EXISTS model_parameter_id_seq;

CREATE TABLE IF NOT EXISTS public.messages
(
    id bigint NOT NULL DEFAULT nextval('messages_id_seq'::regclass),
    content text COLLATE pg_catalog."default",
    created_at timestamp with time zone,
    CONSTRAINT messages_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.book_rank_source
(
    id bigint NOT NULL DEFAULT nextval('book_rank_source_id_seq'::regclass),
    org_name character varying(200) COLLATE pg_catalog."default",
    publish_date date,
    CONSTRAINT book_rank_source_pkey PRIMARY KEY (id)
);


CREATE TABLE IF NOT EXISTS public.ranked_books
(
    id bigint NOT NULL DEFAULT nextval('ranked_books_id_seq'::regclass),
    list_id bigint,
    rank integer,
    title character varying(200) COLLATE pg_catalog."default",
    author_name character varying(200) COLLATE pg_catalog."default",
    publish_year character varying(10) COLLATE pg_catalog."default",
    CONSTRAINT ranked_books_pkey PRIMARY KEY (id),
    CONSTRAINT ranked_books_list_id_fkey FOREIGN KEY (list_id)
        REFERENCES public.book_rank_source (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS public.model
(
    id bigint NOT NULL DEFAULT nextval('model_id_seq'::regclass),
    model_name character varying(200) COLLATE pg_catalog."default",
    model_provider character varying(200) COLLATE pg_catalog."default",
    model_api_url character varying(200) COLLATE pg_catalog."default",
    comment text COLLATE pg_catalog."default",
    CONSTRAINT model_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.model_configuration
(
    id bigint NOT NULL DEFAULT nextval('model_configuration_id_seq'::regclass),
    model_id bigint,
    model_config jsonb,
    comment text COLLATE pg_catalog."default",
    created_at timestamp with time zone,
    CONSTRAINT model_configuration_pkey PRIMARY KEY (id),
    CONSTRAINT model_configuration_model_id_fkey FOREIGN KEY (model_id)
        REFERENCES public.model (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);


CREATE TABLE IF NOT EXISTS public.entity_summary
(
    id bigint NOT NULL DEFAULT nextval('entity_summary_id_seq'::regclass),
    model_configuration_id bigint,
    type character varying(200) COLLATE pg_catalog."default",
    entity_id bigint,
    summary text COLLATE pg_catalog."default",
    created_at timestamp with time zone,
    batch_id bigint,
    CONSTRAINT entity_summary_pkey PRIMARY KEY (id),
    CONSTRAINT entity_summary_model_configuration_id_fkey FOREIGN KEY (model_configuration_id)
        REFERENCES public.model_configuration (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS public.model_parameter
(
    id bigint NOT NULL DEFAULT nextval('model_parameter_id_seq'::regclass),
    model_id bigint NOT NULL,
    param_name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default",
    data_type character varying(50) COLLATE pg_catalog."default",
    min_value character varying(50) COLLATE pg_catalog."default",
    max_value character varying(50) COLLATE pg_catalog."default", 
    default_value character varying(100) COLLATE pg_catalog."default",
    display_order integer,
    CONSTRAINT model_parameter_pkey PRIMARY KEY (id),
    CONSTRAINT model_parameter_model_id_fkey FOREIGN KEY (model_id)
        REFERENCES public.model (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT model_parameter_model_id_param_name_key UNIQUE (model_id, param_name)
);

CREATE TABLE IF NOT EXISTS public.books (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    author_name VARCHAR(255),
    publish_year VARCHAR(50),
    attributes JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE  IF NOT EXISTS public.summaries (
   id BIGSERIAL PRIMARY KEY,
   name VARCHAR(255) NOT NULL,
    batch_id bigint,
    model_configuration_id bigint,
   entity_type VARCHAR(100) NOT NULL,
   entity_id BIGINT NOT NULL,
   content TEXT,
   source VARCHAR(255),
   attributes JSONB NOT NULL DEFAULT '{}',
   created_at TIMESTAMP NOT NULL,
   updated_at TIMESTAMP NOT NULL,
    CONSTRAINT summary_pkey PRIMARY KEY (id),
    CONSTRAINT summary_model_configuration_id_fkey FOREIGN KEY (model_configuration_id)
    REFERENCES public.model_configuration (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION

    );

CREATE TABLE  IF NOT EXISTS public.relationships (
   id BIGSERIAL PRIMARY KEY,
   name VARCHAR(255) NOT NULL,
   relationship_type VARCHAR(100) NOT NULL,
   source_type VARCHAR(100) NOT NULL,
   source_id BIGINT NOT NULL,
   target_type VARCHAR(100) NOT NULL,
   target_id BIGINT NOT NULL,
   attributes JSONB NOT NULL DEFAULT '{}',
   created_at TIMESTAMP NOT NULL,
   updated_at TIMESTAMP NOT NULL
);

CREATE TABLE  IF NOT EXISTS public.people (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    birth_date DATE,
    occupation VARCHAR(255),
    attributes JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_books_author ON books(author_name);
CREATE INDEX idx_books_year ON books(publish_year);
CREATE INDEX idx_summaries_entity ON summaries(entity_type, entity_id);
CREATE INDEX idx_relationships_type ON relationships(relationship_type);
CREATE INDEX idx_relationships_source ON relationships(source_type, source_id);
CREATE INDEX idx_relationships_target ON relationships(target_type, target_id);
CREATE INDEX idx_people_email ON people(email);
CREATE INDEX idx_people_occupation ON people(occupation);

CREATE INDEX idx_books_attributes ON books USING GIN (attributes);
CREATE INDEX idx_summaries_attributes ON summaries USING GIN (attributes);
CREATE INDEX idx_relationships_attributes ON relationships USING GIN (attributes);
CREATE INDEX idx_people_attributes ON people USING GIN (attributes);
