package net.sampsoftware.genai.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import net.sampsoftware.genai.dto.ModelDto;
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
class ModelControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createAndFetchModel() throws Exception {
        ModelDto dto = new ModelDto();
        dto.setModelName("gpt-3.5");
        dto.setModelProvider("openai");
        dto.setModelApiUrl("https://api.openai.com");
        dto.setComment("test");

        String json = objectMapper.writeValueAsString(dto);

        String response = mockMvc.perform(post("/api/models")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andReturn().getResponse().getContentAsString();

        ModelDto returned = objectMapper.readValue(response, ModelDto.class);
        assertThat(returned.getModelName()).isEqualTo("gpt-3.5");

        mockMvc.perform(get("/api/models/" + returned.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.modelProvider").value("openai"));
    }
}
