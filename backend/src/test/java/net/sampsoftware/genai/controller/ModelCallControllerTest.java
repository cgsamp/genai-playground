package net.sampsoftware.genai.controller;

import com.fasterxml.jackson.databind.ObjectMapper;

import net.sampsoftware.genai.dto.ModelCallRequest;
import net.sampsoftware.genai.model.Model;
import net.sampsoftware.genai.model.ModelConfiguration;
import net.sampsoftware.genai.repository.ModelConfigurationRepository;
import net.sampsoftware.genai.service.AIService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ModelCallController.class)
public class ModelCallControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AIService aiService;

    @MockitoBean
    private ModelConfigurationRepository modelConfigRepo;

    private ObjectMapper objectMapper = new ObjectMapper();
    private ModelConfiguration modelConfig;

    @BeforeEach
    void setUp() {
        // Setup model
        Model model = new Model();
        model.setId(1L);
        model.setModelName("Test Model");
        model.setModelProvider("Test Provider");
        
        // Setup model configuration
        modelConfig = new ModelConfiguration();
        modelConfig.setId(1L);
        modelConfig.setModel(model);
        
        // Setup mocks
        when(modelConfigRepo.findByIdWithModel(1L)).thenReturn(Optional.of(modelConfig));
        when(aiService.generateResponse(anyString(), eq(modelConfig))).thenReturn("Test response");
    }

    @Test
    void testInvokeModel() throws Exception {
        // Given
        ModelCallRequest request = new ModelCallRequest(1L, "Tell me a joke");
        String requestJson = objectMapper.writeValueAsString(request);

        // When/Then
        mockMvc.perform(post("/api/model-call")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.response").value("Test response"));
    }

    @Test
    void testInvokeModelWithNonexistentModelConfig() throws Exception {
        // Given
        ModelCallRequest request = new ModelCallRequest(999L, "Tell me a joke");
        String requestJson = objectMapper.writeValueAsString(request);

        when(modelConfigRepo.findByIdWithModel(999L)).thenReturn(Optional.empty());
        Exception exception = assertThrows(Exception.class, () -> {
                mockMvc.perform(post("/api/model-call")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson));
        });

        assertTrue(exception.getMessage().contains("Model configuration not found"));
    }

    @Test
    void testInvokeModelWithServiceError() throws Exception {
        // Given
        ModelCallRequest request = new ModelCallRequest(1L, "Tell me a joke");
        String requestJson = objectMapper.writeValueAsString(request);

        // Mock service error
        when(aiService.generateResponse(anyString(), any(ModelConfiguration.class)))
                .thenThrow(new RuntimeException("Service error"));

        Exception exception = assertThrows(Exception.class, () -> {
            mockMvc.perform(post("/api/model-call")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson));
        });
    
        assertTrue(exception.getMessage().contains("Service error"));
    
    }
}