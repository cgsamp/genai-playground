
INSERT INTO model_configuration (model_id, model_config, comment, created_at)
VALUES
    (
        (SELECT id FROM model WHERE model_name = 'GPT-3.5-Turbo'),
        '{"temperature": 0.7, "max_tokens": 1024, "top_p": 0.95}',
        'Default configuration for general usage',
        NOW()
    ),
    (
        (SELECT id FROM model WHERE model_name = 'GPT-3.5-Turbo'),
        '{"temperature": 0.2, "max_tokens": 2048, "top_p": 0.9, "frequency_penalty": 0.5}',
        'More deterministic output, good for factual responses',
        NOW()
    ),
    (
        (SELECT id FROM model WHERE model_name = 'GPT-3.5-Turbo'),
        '{"temperature": 1.2, "max_tokens": 500, "top_p": 1.0, "presence_penalty": 0.6}',
        'Creative configuration for brainstorming and idea generation',
        NOW()
    );

-- GPT-4o configurations
INSERT INTO model_configuration (model_id, model_config, comment, created_at)
VALUES
    (
        (SELECT id FROM model WHERE model_name = 'GPT-4o'),
        '{"temperature": 0.7, "max_tokens": 1500, "top_p": 0.95}',
        'Default configuration for balanced performance',
        NOW()
    ),
    (
        (SELECT id FROM model WHERE model_name = 'GPT-4o'),
        '{"temperature": 0.1, "max_tokens": 4000, "top_p": 0.8}',
        'Academic configuration optimized for detailed explanations',
        NOW()
    );

-- Claude 3 Opus configurations
INSERT INTO model_configuration (model_id, model_config, comment, created_at)
VALUES
    (
        (SELECT id FROM model WHERE model_name = 'Claude 3 Opus'),
        '{"temperature": 0.7, "max_tokens": 1024, "top_p": 0.9}',
        'Balanced configuration for general usage',
        NOW()
    ),
    (
        (SELECT id FROM model WHERE model_name = 'Claude 3 Opus'),
        '{"temperature": 0.3, "max_tokens": 2000, "top_p": 0.85, "top_k": 40}',
        'Precise configuration for technical content',
        NOW()
    );

-- Claude 3 Sonnet configurations
INSERT INTO model_configuration (model_id, model_config, comment, created_at)
VALUES
    (
        (SELECT id FROM model WHERE model_name = 'Claude 3 Sonnet'),
        '{"temperature": 0.7, "max_tokens": 1024, "top_p": 0.9}',
        'Default configuration for everyday use',
        NOW()
    );

-- Llama-3-70b configurations
INSERT INTO model_configuration (model_id, model_config, comment, created_at)
VALUES
    (
        (SELECT id FROM model WHERE model_name = 'Llama-3-70b'),
        '{"temperature": 0.8, "max_tokens": 1024, "top_p": 0.9, "repetition_penalty": 1.1}',
        'Default open source model configuration',
        NOW()
    );
