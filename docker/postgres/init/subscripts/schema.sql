-- GenAI Playground Schema Create

CREATE SEQUENCE messages_id_seq;
CREATE SEQUENCE model_id_seq;
CREATE SEQUENCE model_configuration_id_seq;
CREATE SEQUENCE entity_summary_id_seq;
CREATE SEQUENCE model_parameter_id_seq;
CREATE SEQUENCE model_calls_id_seq;

DROP TABLE IF EXISTS model_calls CASCADE;
DROP TABLE IF EXISTS summaries CASCADE;
DROP TABLE IF EXISTS relationships CASCADE;
DROP TABLE IF EXISTS entity_summary CASCADE;
DROP TABLE IF EXISTS model_parameter CASCADE;
DROP TABLE IF EXISTS model_configuration CASCADE;
DROP TABLE IF EXISTS ranked_books CASCADE;
DROP TABLE IF EXISTS book_rank_source CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS people CASCADE;
DROP TABLE IF EXISTS model CASCADE;
DROP TABLE IF EXISTS messages CASCADE;

CREATE TABLE messages (
    id bigint NOT NULL DEFAULT nextval('messages_id_seq'::regclass),
    content text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT messages_pkey PRIMARY KEY (id)
);

CREATE TABLE model (
    id bigint NOT NULL DEFAULT nextval('model_id_seq'::regclass),
    model_name varchar(200) NOT NULL,
    model_provider varchar(200) NOT NULL,
    model_api_url varchar(500),
    comment text,
    CONSTRAINT model_pkey PRIMARY KEY (id),
    CONSTRAINT model_name_provider_unique UNIQUE (model_name, model_provider)
);

CREATE TABLE model_configuration (
    id bigint NOT NULL DEFAULT nextval('model_configuration_id_seq'::regclass),
    model_id bigint NOT NULL,
    model_config jsonb NOT NULL DEFAULT '{}',
    comment text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT model_configuration_pkey PRIMARY KEY (id),
    CONSTRAINT model_configuration_model_id_fkey FOREIGN KEY (model_id)
     REFERENCES model (id) MATCH SIMPLE
     ON UPDATE NO ACTION
     ON DELETE CASCADE
);

CREATE TABLE model_parameter (
    id bigint NOT NULL DEFAULT nextval('model_parameter_id_seq'::regclass),
    model_id bigint NOT NULL,
    param_name varchar(100) NOT NULL,
    description text,
    data_type varchar(50) NOT NULL DEFAULT 'string',
    min_value varchar(50),
    max_value varchar(50),
    default_value varchar(100),
    display_order integer DEFAULT 0,
    CONSTRAINT model_parameter_pkey PRIMARY KEY (id),
    CONSTRAINT model_parameter_model_id_fkey FOREIGN KEY (model_id)
    REFERENCES model (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE,
    CONSTRAINT model_parameter_model_id_param_name_key UNIQUE (model_id, param_name)
);

CREATE TABLE entities (
    id BIGSERIAL PRIMARY KEY,
    entity_type VARCHAR(100) NOT NULL,
    name VARCHAR(500) NOT NULL,
    description TEXT,
    creator VARCHAR(255),      -- author, director, researcher, etc.
    created_year VARCHAR(10),  -- publish year, release year, etc.
    external_id VARCHAR(255),  -- ISBN, DOI, IMDB ID, etc.
    source VARCHAR(255),       -- where this entity came from
    attributes JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT entities_pkey PRIMARY KEY (id)
);

-- Relationship and summary tables
CREATE TABLE relationships (
    id bigserial PRIMARY KEY,
    name varchar(255) NOT NULL,
    relationship_type varchar(100) NOT NULL,
    source_type varchar(100) NOT NULL,
    source_id bigint NOT NULL,
    target_type varchar(100) NOT NULL,
    target_id bigint NOT NULL,
    attributes jsonb NOT NULL DEFAULT '{}',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE summaries (
    id bigserial PRIMARY KEY,
    name varchar(255) NOT NULL,
    batch_id bigint,
    model_configuration_id bigint,
    entity_type varchar(100) NOT NULL,
    entity_id bigint NOT NULL,
    content text,
    source varchar(255),
    attributes jsonb NOT NULL DEFAULT '{}',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT summaries_model_configuration_id_fkey FOREIGN KEY (model_configuration_id)
    REFERENCES model_configuration (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE SET NULL
);

-- Legacy entity_summary table (consider migrating to summaries)
CREATE TABLE entity_summary (
    id bigint NOT NULL DEFAULT nextval('entity_summary_id_seq'::regclass),
    model_configuration_id bigint,
    type varchar(200),
    entity_id bigint,
    summary text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    batch_id bigint,
    CONSTRAINT entity_summary_pkey PRIMARY KEY (id),
    CONSTRAINT entity_summary_model_configuration_id_fkey FOREIGN KEY (model_configuration_id)
    REFERENCES model_configuration (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE SET NULL
);

-- Enhanced model calls logging table
CREATE TABLE model_calls (
    id bigint NOT NULL DEFAULT nextval('model_calls_id_seq'::regclass),
    model_configuration_id bigint,
    model_configuration_json jsonb,
    provider varchar(255),
    prompt_text text,
    prompt_json jsonb,
    response_text text,
    response_json jsonb,
    token_usage jsonb,
    chat_options jsonb,
    metadata jsonb,
    success boolean NOT NULL DEFAULT false,
    error_message text,
    error_class varchar(255),
    error_stacktrace text,
    start_time timestamp with time zone,
    end_time timestamp with time zone,
    duration_ms bigint,
    api_duration_ms bigint,
    processing_duration_ms bigint,
    batch_id bigint,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    model_name varchar(255),
    model_provider varchar(255),
    correlation_id varchar(255),
    user_id varchar(255),
    request_context varchar(255),
    CONSTRAINT model_calls_pkey PRIMARY KEY (id),
    CONSTRAINT model_calls_model_configuration_id_fkey FOREIGN KEY (model_configuration_id)
    REFERENCES model_configuration (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE SET NULL
);

CREATE INDEX idx_entities_type ON entities(entity_type);
CREATE INDEX idx_entities_name ON entities(name);
CREATE INDEX idx_entities_creator ON entities(creator);
CREATE INDEX idx_entities_created_year ON entities(created_year);
CREATE INDEX idx_entities_external_id ON entities(external_id);
CREATE INDEX idx_entities_source ON entities(source);
CREATE INDEX idx_entities_attributes ON entities USING GIN (attributes);
CREATE INDEX idx_summaries_entity ON summaries(entity_type, entity_id);
CREATE INDEX idx_summaries_batch ON summaries(batch_id) WHERE batch_id IS NOT NULL;
CREATE INDEX idx_relationships_type ON relationships(relationship_type);
CREATE INDEX idx_relationships_source ON relationships(source_type, source_id);
CREATE INDEX idx_relationships_target ON relationships(target_type, target_id);

CREATE INDEX idx_entities_type_name ON entities(entity_type, name);
CREATE INDEX idx_entities_type_creator ON entities(entity_type, creator);


-- Model calls performance indexes
CREATE INDEX idx_model_calls_config_id ON model_calls(model_configuration_id);
CREATE INDEX idx_model_calls_batch_id ON model_calls(batch_id) WHERE batch_id IS NOT NULL;
CREATE INDEX idx_model_calls_created_at ON model_calls(created_at DESC);
CREATE INDEX idx_model_calls_success ON model_calls(success);
CREATE INDEX idx_model_calls_duration ON model_calls(duration_ms) WHERE success = true;
CREATE INDEX idx_model_calls_model_name ON model_calls(model_name);
CREATE INDEX idx_model_calls_model_provider ON model_calls(model_provider);
CREATE INDEX idx_model_calls_correlation_id ON model_calls(correlation_id);
CREATE INDEX idx_model_calls_user_id ON model_calls(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_model_calls_request_context ON model_calls(request_context);

-- Performance analysis composite indexes
CREATE INDEX idx_model_calls_provider_success_time ON model_calls(model_provider, success, created_at DESC);
CREATE INDEX idx_model_calls_batch_performance ON model_calls(batch_id, success, duration_ms) WHERE batch_id IS NOT NULL;

-- JSONB indexes for efficient querying
CREATE INDEX idx_books_attributes ON books USING GIN (attributes);
CREATE INDEX idx_summaries_attributes ON summaries USING GIN (attributes);
CREATE INDEX idx_relationships_attributes ON relationships USING GIN (attributes);
CREATE INDEX idx_people_attributes ON people USING GIN (attributes);
CREATE INDEX idx_model_calls_token_usage ON model_calls USING GIN (token_usage);
CREATE INDEX idx_model_calls_chat_options ON model_calls USING GIN (chat_options);
CREATE INDEX idx_model_calls_metadata ON model_calls USING GIN (metadata);
CREATE INDEX idx_model_calls_response_json ON model_calls USING GIN (response_json);


-- Comments for documentation
COMMENT ON TABLE entities IS 'Unified table for all entity types (books, movies, papers, people, etc.)';
COMMENT ON COLUMN entities.entity_type IS 'Type of entity: book, movie, person, paper, collection, etc.';
COMMENT ON COLUMN entities.name IS 'Primary name/title of the entity';
COMMENT ON COLUMN entities.description IS 'Optional description or summary of the entity';
COMMENT ON COLUMN entities.creator IS 'Creator of the entity (author, director, researcher, etc.)';
COMMENT ON COLUMN entities.created_year IS 'Year the entity was created/published/released';
COMMENT ON COLUMN entities.external_id IS 'External identifier (ISBN, DOI, IMDB ID, etc.)';
COMMENT ON COLUMN entities.source IS 'Source where this entity data came from';
COMMENT ON COLUMN entities.attributes IS 'Type-specific attributes stored as JSON';


-- Column comments for documentation
COMMENT ON COLUMN model_calls.model_configuration_json IS 'Snapshot of model configuration at execution time';
COMMENT ON COLUMN model_calls.chat_options IS 'Complete ChatOptions object captured via introspection';
COMMENT ON COLUMN model_calls.metadata IS 'Additional request/response metadata (headers, rate limits, etc.)';
COMMENT ON COLUMN model_calls.api_duration_ms IS 'Network/API call duration only';
COMMENT ON COLUMN model_calls.processing_duration_ms IS 'Local processing duration (serialization, etc.)';
COMMENT ON COLUMN model_calls.correlation_id IS 'Request correlation ID for distributed tracing';
COMMENT ON COLUMN model_calls.request_context IS 'Source context (batch_summary, chat, operations, etc.)';

-- Table comments
COMMENT ON TABLE model_calls IS 'Comprehensive logging of all AI model API interactions';
COMMENT ON TABLE summaries IS 'New unified summary table replacing entity_summary';
COMMENT ON TABLE entity_summary IS 'Legacy summary table - migrate to summaries table';

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_people_updated_at BEFORE UPDATE ON people FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_relationships_updated_at BEFORE UPDATE ON relationships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_summaries_updated_at BEFORE UPDATE ON summaries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
