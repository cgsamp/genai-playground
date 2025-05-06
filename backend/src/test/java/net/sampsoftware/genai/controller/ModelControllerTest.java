package net.sampsoftware.genai.controller;
/*
import com.fasterxml.jackson.databind.ObjectMapper;
import net.sampsoftware.genai.model.Model;
import net.sampsoftware.genai.repository.ModelConfigurationRepository;
import net.sampsoftware.genai.repository.ModelRepository;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.http.MediaType;
import java.util.Map;
import static org.assertj.core.api.Assertions.assertThat;
*/

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;


import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;



@SpringBootTest
@Transactional(readOnly = true)
@AutoConfigureMockMvc
class ModelControllerTest {

    @Autowired private MockMvc mockMvc;
    /*
    @Autowired private ObjectMapper objectMapper;
    @Autowired private ModelRepository modelRepository;
    @Autowired private ModelConfigurationRepository configRepository;

    //private Model model;

    @BeforeEach
    void setup() {
        configRepository.deleteAll();
        modelRepository.deleteAll();
        model = modelRepository.save(new Model(null, "GPT-4", "OpenAI", "https://api.openai.com", "test model"));
    }
*/
    @Test
    void getModels_returnsList() throws Exception {
        mockMvc.perform(get("/api/models"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].modelName").value("Test model"));
    }
/*
    @Test
    void createConfiguration_savesToDatabase() throws Exception {
        Map<String, Object> config = Map.of("temperature", 0.7, "top_p", 0.9);
        Map<String, Object> body = Map.of(
            "modelId", model.getId(),
            "modelConfig", config,
            "comment", "test config"
        );

        mockMvc.perform(post("/api/model-configurations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.comment").value("test config"));

        assertThat(configRepository.findAll()).hasSize(1);
    }
*/
}
