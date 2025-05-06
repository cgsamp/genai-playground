package net.sampsoftware.genai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import net.sampsoftware.genai.model.Model;
import net.sampsoftware.genai.repository.ModelRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.jayway.jsonpath.JsonPath;

@SpringBootTest
@AutoConfigureMockMvc
public class ModelConfigurationControllerTest extends AbstractPostgresTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ModelRepository modelRepository;

    @Test
    void createAndFetchModelConfiguration() throws Exception {
        // Create and save the Model entity first
        Model model = modelRepository.save(new Model(null, "gpt-4", "openai", "https://api.openai.com/v1", "test model"));

        // Create config JSON
        ObjectNode config = objectMapper.createObjectNode();
        config.put("temperature", 0.7);

        // Build JSON body for ModelConfigurationDto
        ObjectNode body = objectMapper.createObjectNode();
        body.put("modelId", model.getId());
        body.put("comment", "some comment");
        body.set("modelConfig", config);

        // Create ModelConfiguration
        String response = mockMvc.perform(post("/api/model-configurations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body.toString()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").isNumber())
            .andReturn()
            .getResponse()
            .getContentAsString();

        Long configId = ((Integer)JsonPath.read(response, "$.id")).longValue();

        // Now GET by ID (this uses your fetch-joined method)
        mockMvc.perform(get("/api/model-configurations/{id}", configId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.modelName").value("gpt-4"))
            .andExpect(jsonPath("$.modelProvider").value("openai"))
            .andExpect(jsonPath("$.modelConfig.temperature").value(0.7));
    }
}
