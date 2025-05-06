package net.sampsoftware.genai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import net.sampsoftware.genai.dto.ModelConfigurationDto;
import net.sampsoftware.genai.model.Model;
import net.sampsoftware.genai.repository.ModelConfigurationRepository;
import net.sampsoftware.genai.repository.ModelRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ModelConfigurationControllerTest extends AbstractPostgresTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private ModelRepository modelRepository;
    @Autowired private ModelConfigurationRepository configRepository;

    @Test
    void createAndFetchModelConfiguration() throws Exception {
        // Create required Model
        Model model = new Model();
        model.setModelName("gpt-4");
        model.setModelProvider("openai");
        model.setModelApiUrl("https://api.openai.com");
        model.setComment("test model");
        model = modelRepository.save(model);

        // Build config DTO
        ModelConfigurationDto dto = new ModelConfigurationDto();
        dto.setModelId(model.getId());
        dto.setComment("some comment");
        JsonNode config = objectMapper.readTree("{\"temperature\":0.7}");
        dto.setModelConfig(config);

        String payload = objectMapper.writeValueAsString(dto);

        // POST config
        String response = mockMvc.perform(post("/api/model-configurations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.modelName").value("gpt-4"))
                .andExpect(jsonPath("$.modelProvider").value("openai"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        ModelConfigurationDto returned = objectMapper.readValue(response, ModelConfigurationDto.class);
        assertThat(returned.getModelConfig().get("temperature").asDouble()).isEqualTo(0.7);
    }
}
