insert into model (model_name, model_provider, model_api_url, comment) values ('Test model', 'Model Test Inc', 'https://example.com/api','This is here to test things.') returning id;
INSERT INTO model_configuration (model_id, model_config, comment, created_at)
VALUES (
  1,
  '{"temperature": 0.7, "max_tokens": 150, "top_p": 0.9}',
  'Sample config for testing',
  now()
);
insert into entity_summary (model_configuration_id, entity, entity_id, summary, created_at)
values (
1, 'ranked_books',3,'This book was less than wonderful.',now()
);
insert into entity_summary (model_configuration_id, entity, entity_id, summary, created_at)
values (
1, 'ranked_books',3,'I thought it was okay.',now()
);
