-- SQL script with properly escaped apostrophes

-- First, ensure we have the models
INSERT INTO model (model_name, model_provider, model_api_url, comment) 
SELECT 'gpt-3.5-turbo', 'OpenAI', 'https://api.openai.com/v1', 'GPT-3.5 Turbo model'
WHERE NOT EXISTS (SELECT 1 FROM model WHERE model_name = 'gpt-3.5-turbo');

INSERT INTO model (model_name, model_provider, model_api_url, comment) 
SELECT 'gpt-4', 'OpenAI', 'https://api.openai.com/v1', 'GPT-4 model'
WHERE NOT EXISTS (SELECT 1 FROM model WHERE model_name = 'gpt-4');

-- Get model IDs for insertion
DO $$
DECLARE
    gpt35_id bigint;
    gpt4_id bigint;
BEGIN
    SELECT id INTO gpt35_id FROM model WHERE model_name = 'gpt-3.5-turbo';
    SELECT id INTO gpt4_id FROM model WHERE model_name = 'gpt-4';
    
    -- Common parameters for GPT-3.5 Turbo
    -- Temperature
    INSERT INTO model_parameter (model_id, param_name, description, data_type, min_value, max_value, default_value, display_order)
    SELECT gpt35_id, 'temperature', 
           'Controls randomness in token selection. Lower values make output more deterministic and focused (0 is deterministic), higher values make output more random and creative.', 
           'number', '0.0', '2.0', '0.7', 1
    WHERE NOT EXISTS (SELECT 1 FROM model_parameter WHERE model_id = gpt35_id AND param_name = 'temperature');

    -- Top_p
    INSERT INTO model_parameter (model_id, param_name, description, data_type, min_value, max_value, default_value, display_order)
    SELECT gpt35_id, 'top_p', 
           'Controls diversity via nucleus sampling. The model considers tokens with top_p probability mass. 0.1 means only the tokens comprising the top 10% probability are considered.', 
           'number', '0.0', '1.0', '1.0', 2
    WHERE NOT EXISTS (SELECT 1 FROM model_parameter WHERE model_id = gpt35_id AND param_name = 'top_p');

    -- Max_tokens
    INSERT INTO model_parameter (model_id, param_name, description, data_type, min_value, max_value, default_value, display_order)
    SELECT gpt35_id, 'max_tokens', 
           'Maximum number of tokens to generate. The total length of input tokens and output tokens is limited by the model context length.', 
           'integer', '1', '4096', '1024', 3
    WHERE NOT EXISTS (SELECT 1 FROM model_parameter WHERE model_id = gpt35_id AND param_name = 'max_tokens');

    -- Frequency_penalty
    INSERT INTO model_parameter (model_id, param_name, description, data_type, min_value, max_value, default_value, display_order)
    SELECT gpt35_id, 'frequency_penalty', 
           'Reduces repetition by penalizing tokens based on how frequently they''ve appeared in the text so far. Higher values decrease repetition.', 
           'number', '-2.0', '2.0', '0.0', 4
    WHERE NOT EXISTS (SELECT 1 FROM model_parameter WHERE model_id = gpt35_id AND param_name = 'frequency_penalty');

    -- Presence_penalty
    INSERT INTO model_parameter (model_id, param_name, description, data_type, min_value, max_value, default_value, display_order)
    SELECT gpt35_id, 'presence_penalty', 
           'Reduces repetition by penalizing tokens that have appeared at all in the text so far. Higher values increase the model''s likelihood to talk about new topics.', 
           'number', '-2.0', '2.0', '0.0', 5
    WHERE NOT EXISTS (SELECT 1 FROM model_parameter WHERE model_id = gpt35_id AND param_name = 'presence_penalty');

    -- Common parameters for GPT-4
    -- Temperature
    INSERT INTO model_parameter (model_id, param_name, description, data_type, min_value, max_value, default_value, display_order)
    SELECT gpt4_id, 'temperature', 
           'Controls randomness in token selection. Lower values make output more deterministic and focused (0 is deterministic), higher values make output more random and creative.', 
           'number', '0.0', '2.0', '0.7', 1
    WHERE NOT EXISTS (SELECT 1 FROM model_parameter WHERE model_id = gpt4_id AND param_name = 'temperature');

    -- Top_p
    INSERT INTO model_parameter (model_id, param_name, description, data_type, min_value, max_value, default_value, display_order)
    SELECT gpt4_id, 'top_p', 
           'Controls diversity via nucleus sampling. The model considers tokens with top_p probability mass. 0.1 means only the tokens comprising the top 10% probability are considered.', 
           'number', '0.0', '1.0', '1.0', 2
    WHERE NOT EXISTS (SELECT 1 FROM model_parameter WHERE model_id = gpt4_id AND param_name = 'top_p');

    -- Max_tokens
    INSERT INTO model_parameter (model_id, param_name, description, data_type, min_value, max_value, default_value, display_order)
    SELECT gpt4_id, 'max_tokens', 
           'Maximum number of tokens to generate. The total length of input tokens and output tokens is limited by the model context length.', 
           'integer', '1', '8192', '1500', 3
    WHERE NOT EXISTS (SELECT 1 FROM model_parameter WHERE model_id = gpt4_id AND param_name = 'max_tokens');

    -- Frequency_penalty
    INSERT INTO model_parameter (model_id, param_name, description, data_type, min_value, max_value, default_value, display_order)
    SELECT gpt4_id, 'frequency_penalty', 
           'Reduces repetition by penalizing tokens based on how frequently they''ve appeared in the text so far. Higher values decrease repetition.', 
           'number', '-2.0', '2.0', '0.0', 4
    WHERE NOT EXISTS (SELECT 1 FROM model_parameter WHERE model_id = gpt4_id AND param_name = 'frequency_penalty');

    -- Presence_penalty
    INSERT INTO model_parameter (model_id, param_name, description, data_type, min_value, max_value, default_value, display_order)
    SELECT gpt4_id, 'presence_penalty', 
           'Reduces repetition by penalizing tokens that have appeared at all in the text so far. Higher values increase the model''s likelihood to talk about new topics.', 
           'number', '-2.0', '2.0', '0.0', 5
    WHERE NOT EXISTS (SELECT 1 FROM model_parameter WHERE model_id = gpt4_id AND param_name = 'presence_penalty');
END $$;