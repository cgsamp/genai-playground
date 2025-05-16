-- GPT-3.5-Turbo parameters
INSERT INTO model_parameter (model_id, param_name, description, data_type, min_value, max_value, default_value, display_order)
VALUES
    ((SELECT id FROM model WHERE model_name = 'GPT-3.5-Turbo'), 'temperature', 'Controls randomness: Lowering results in less random completions', 'float', '0', '2', '0.7', 1),
    ((SELECT id FROM model WHERE model_name = 'GPT-3.5-Turbo'), 'max_tokens', 'The maximum number of tokens in the response', 'integer', '1', '4096', '1024', 2),
    ((SELECT id FROM model WHERE model_name = 'GPT-3.5-Turbo'), 'top_p', 'Controls diversity via nucleus sampling', 'float', '0', '1', '0.95', 3),
    ((SELECT id FROM model WHERE model_name = 'GPT-3.5-Turbo'), 'presence_penalty', 'Penalizes repeated tokens', 'float', '-2', '2', '0', 4),
    ((SELECT id FROM model WHERE model_name = 'GPT-3.5-Turbo'), 'frequency_penalty', 'Penalizes frequent tokens', 'float', '-2', '2', '0', 5);

-- GPT-4o parameters
INSERT INTO model_parameter (model_id, param_name, description, data_type, min_value, max_value, default_value, display_order)
VALUES
    ((SELECT id FROM model WHERE model_name = 'GPT-4o'), 'temperature', 'Controls randomness: Lowering results in less random completions', 'float', '0', '2', '0.7', 1),
    ((SELECT id FROM model WHERE model_name = 'GPT-4o'), 'max_tokens', 'The maximum number of tokens in the response', 'integer', '1', '8192', '1024', 2),
    ((SELECT id FROM model WHERE model_name = 'GPT-4o'), 'top_p', 'Controls diversity via nucleus sampling', 'float', '0', '1', '0.95', 3),
    ((SELECT id FROM model WHERE model_name = 'GPT-4o'), 'presence_penalty', 'Penalizes repeated tokens', 'float', '-2', '2', '0', 4),
    ((SELECT id FROM model WHERE model_name = 'GPT-4o'), 'frequency_penalty', 'Penalizes frequent tokens', 'float', '-2', '2', '0', 5);

-- Claude 3 Opus parameters
INSERT INTO model_parameter (model_id, param_name, description, data_type, min_value, max_value, default_value, display_order)
VALUES
    ((SELECT id FROM model WHERE model_name = 'Claude 3 Opus'), 'temperature', 'Controls randomness in generation', 'float', '0', '1', '0.7', 1),
    ((SELECT id FROM model WHERE model_name = 'Claude 3 Opus'), 'max_tokens', 'Maximum tokens to generate', 'integer', '1', '4096', '1024', 2),
    ((SELECT id FROM model WHERE model_name = 'Claude 3 Opus'), 'top_p', 'Nucleus sampling parameter', 'float', '0', '1', '0.9', 3),
    ((SELECT id FROM model WHERE model_name = 'Claude 3 Opus'), 'top_k', 'Limits vocabulary to top K tokens', 'integer', '1', '500', '50', 4);

-- Claude 3 Sonnet parameters
INSERT INTO model_parameter (model_id, param_name, description, data_type, min_value, max_value, default_value, display_order)
VALUES
    ((SELECT id FROM model WHERE model_name = 'Claude 3 Sonnet'), 'temperature', 'Controls randomness in generation', 'float', '0', '1', '0.7', 1),
    ((SELECT id FROM model WHERE model_name = 'Claude 3 Sonnet'), 'max_tokens', 'Maximum tokens to generate', 'integer', '1', '4096', '1024', 2),
    ((SELECT id FROM model WHERE model_name = 'Claude 3 Sonnet'), 'top_p', 'Nucleus sampling parameter', 'float', '0', '1', '0.9', 3),
    ((SELECT id FROM model WHERE model_name = 'Claude 3 Sonnet'), 'top_k', 'Limits vocabulary to top K tokens', 'integer', '1', '500', '50', 4);

-- Llama-3-70b parameters
INSERT INTO model_parameter (model_id, param_name, description, data_type, min_value, max_value, default_value, display_order)
VALUES
    ((SELECT id FROM model WHERE model_name = 'Llama-3-70b'), 'temperature', 'Controls randomness', 'float', '0', '2', '0.8', 1),
    ((SELECT id FROM model WHERE model_name = 'Llama-3-70b'), 'max_tokens', 'Maximum tokens to generate', 'integer', '1', '4096', '1024', 2),
    ((SELECT id FROM model WHERE model_name = 'Llama-3-70b'), 'top_p', 'Nucleus sampling parameter', 'float', '0', '1', '0.9', 3),
    ((SELECT id FROM model WHERE model_name = 'Llama-3-70b'), 'repetition_penalty', 'Penalizes repetition', 'float', '1', '2', '1.1', 4);
