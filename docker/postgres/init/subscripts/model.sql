INSERT INTO model (model_name, model_provider, model_api_url, comment)
VALUES
    ('GPT-3.5-Turbo', 'OpenAI', 'https://api.openai.com/v1/chat/completions', 'General purpose model, good balance of capabilities and cost'),
    ('GPT-4o', 'OpenAI', 'https://api.openai.com/v1/chat/completions', 'Advanced model with strong reasoning and instruction-following'),
    ('Claude 3 Opus', 'Anthropic', 'https://api.anthropic.com/v1/messages', 'Anthropic''s most capable model for complex tasks'),
    ('Claude 3 Sonnet', 'Anthropic', 'https://api.anthropic.com/v1/messages', 'Balanced performance and cost for most use cases'),
    ('Llama-3-70b', 'Meta', 'https://api.together.xyz/v1/completions', 'Open source model with strong general capabilities');
