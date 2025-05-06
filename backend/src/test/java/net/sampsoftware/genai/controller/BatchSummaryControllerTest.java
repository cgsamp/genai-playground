package net.sampsoftware.genai.controller;

import com.fasterxml.jackson.databind.ObjectMapper;

import net.sampsoftware.genai.dto.BatchSummaryRequest;
import net.sampsoftware.genai.model.BookRankSource;
import net.sampsoftware.genai.model.ModelConfiguration;
import net.sampsoftware.genai.model.RankedBook;
import net.sampsoftware.genai.repository.EntitySummaryRepository;
import net.sampsoftware.genai.repository.ModelConfigurationRepository;
import net.sampsoftware.genai.repository.RankedBookRepository;
import net.sampsoftware.genai.service.AIService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@WebMvcTest(BatchSummaryController.class)
public class BatchSummaryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AIService aiService;

    @MockitoBean
    private ModelConfigurationRepository modelConfigRepo;

    @MockitoBean
    private RankedBookRepository bookRepo;

    @MockitoBean
    private EntitySummaryRepository summaryRepo;

    private ObjectMapper objectMapper = new ObjectMapper();
    private ModelConfiguration modelConfig;
    private List<RankedBook> books;

    @BeforeEach
    void setUp() {
        // Setup model configuration
        modelConfig = new ModelConfiguration();
        modelConfig.setId(1L);

        // Setup books
        BookRankSource source = new BookRankSource();
        source.setId(1L);
        source.setOrgName("New York Times");
        source.setPublishDate(LocalDate.now());

        RankedBook book1 = new RankedBook();
        book1.setId(1L);
        book1.setRank(1);
        book1.setTitle("Book 1");
        book1.setAuthorName("Author 1");
        book1.setPublishYear("2023");
        book1.setSource(source);

        RankedBook book2 = new RankedBook();
        book2.setId(2L);
        book2.setRank(2);
        book2.setTitle("Book 2");
        book2.setAuthorName("Author 2");
        book2.setPublishYear("2024");
        book2.setSource(source);

        books = Arrays.asList(book1, book2);

        // Setup mocks
        when(modelConfigRepo.findByIdWithModel(1L)).thenReturn(Optional.of(modelConfig));
        when(bookRepo.findAll()).thenReturn(books);
        when(aiService.generateResponse(
                anyString(), anyString(), any(Map.class), eq(modelConfig)))
                .thenReturn("Test summary");
    }

    @Test
    void testGenerateSummaries() throws Exception {
        // Given
        BatchSummaryRequest request = new BatchSummaryRequest(1L, "Summarize this book");
        String requestJson = objectMapper.writeValueAsString(request);

        // When/Then
        mockMvc.perform(post("/api/batch-summary")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.successCount", is(2)))
                .andExpect(jsonPath("$.failureCount", is(0)));

        // Verify that AIService was called for each book
        verify(aiService, times(2)).generateResponse(
                anyString(), anyString(), any(Map.class), eq(modelConfig));

        // Verify that summaries were saved
        verify(summaryRepo, times(2)).save(any());
    }

    @Test
    void testGenerateSummariesWithNonexistentModelConfig() throws Exception {
        BatchSummaryRequest request = new BatchSummaryRequest(999L, "Summarize this book");
        String requestJson = objectMapper.writeValueAsString(request);

        when(modelConfigRepo.findByIdWithModel(999L)).thenReturn(Optional.empty());

        Exception exception = assertThrows(Exception.class, () -> {
                mockMvc.perform(post("/api/batch-summary")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson));
        });

        assertTrue(exception.getMessage().contains("Model configuration not found"));
    }

    @Test
    void testGenerateSummariesWithErrorInProcessing() throws Exception {
        // Given
        BatchSummaryRequest request = new BatchSummaryRequest(1L, "Summarize this book");
        String requestJson = objectMapper.writeValueAsString(request);

        // Mock an exception for the first book
        when(aiService.generateResponse(
                anyString(), anyString(), any(Map.class), eq(modelConfig)))
                .thenThrow(new RuntimeException("Test error"))
                .thenReturn("Test summary");

        // When/Then
        mockMvc.perform(post("/api/batch-summary")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.successCount", is(1)))
                .andExpect(jsonPath("$.failureCount", is(1)));

        // Verify that AIService was called for each book
        verify(aiService, times(2)).generateResponse(
                anyString(), anyString(), any(Map.class), eq(modelConfig));

        // Verify that only one summary was saved
        verify(summaryRepo, times(1)).save(any());
    }
}