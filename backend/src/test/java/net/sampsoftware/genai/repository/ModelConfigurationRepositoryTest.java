package net.sampsoftware.genai.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import net.sampsoftware.genai.model.Model;
import net.sampsoftware.genai.model.ModelConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
public class ModelConfigurationRepositoryTest {

    @Autowired
    private ModelConfigurationRepository configRepo;

    @Autowired
    private ModelRepository modelRepo;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void canSaveAndLoadModelConfiguration() {
        Model model = modelRepo.save(new Model(null, "gpt-4", "openai", "https://api.openai.com/v1", "", 0.03, 0.06, 8192));

        ObjectNode configJson = objectMapper.createObjectNode();
        configJson.put("temperature", 0.7);

        ModelConfiguration config = ModelConfiguration.builder()
            .model(model)
            .modelConfig(configJson)
            .comment("Initial config")
            .createdAt(Instant.now())
            .build();

        ModelConfiguration saved = configRepo.save(config);
        assertThat(saved.getId()).isNotNull();
        ModelConfiguration loaded = configRepo.findById(saved.getId()).orElseThrow();
        assertThat(loaded.getModel().getId()).isEqualTo(model.getId());
        assertThat(loaded.getComment()).isEqualTo("Initial config");
        assertThat(loaded.getModelConfig().get("temperature").asDouble()).isEqualTo(0.7);

    }
}
