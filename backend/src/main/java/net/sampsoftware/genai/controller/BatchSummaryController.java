package net.sampsoftware.genai.controller;

import lombok.RequiredArgsConstructor;
import net.sampsoftware.genai.dto.BatchSummaryRequest;
import net.sampsoftware.genai.dto.BatchSummaryResponse;
import net.sampsoftware.genai.model.EntitySummary;
import net.sampsoftware.genai.model.ModelConfiguration;
import net.sampsoftware.genai.model.RankedBook;
import net.sampsoftware.genai.repository.EntitySummaryRepository;
import net.sampsoftware.genai.repository.ModelConfigurationRepository;
import net.sampsoftware.genai.repository.RankedBookRepository;
import net.sampsoftware.genai.service.AIService;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/batch-summary")
@RequiredArgsConstructor
public class BatchSummaryController {

    private final AIService aiService;
    private final ModelConfigurationRepository modelConfigRepo;
    private final RankedBookRepository bookRepo;
    private final EntitySummaryRepository summaryRepo;

    @PostMapping
    public BatchSummaryResponse generateSummaries(@RequestBody BatchSummaryRequest request) {
        // Get model configuration
        Optional<ModelConfiguration> modelConfigOpt = modelConfigRepo.findByIdWithModel(request.modelConfigurationId());
        if (modelConfigOpt.isEmpty()) {
            throw new RuntimeException("Model configuration not found");
        }
        ModelConfiguration modelConfig = modelConfigOpt.get();
        
        // Get all books
        List<RankedBook> books = bookRepo.findAll();
        
        // Track success and failure counts
        int successCount = 0;
        int failureCount = 0;
        
        // System prompt that will be used for all book summaries
        String systemPrompt = "You are a literary expert. Provide a brief, insightful summary of the book.";
        
        // User prompt template
        String userPromptTemplate = "{basePrompt} for the book '{title}' by {author} ({year}).";
        
        // Process each book
        for (RankedBook book : books) {
            try {
                // Create variables for the prompt
                Map<String, Object> vars = new HashMap<>();
                vars.put("title", book.getTitle());
                vars.put("author", book.getAuthorName());
                vars.put("year", book.getPublishYear());
                vars.put("basePrompt", request.prompt());
                
                // Use service to generate summary
                String summary = aiService.generateResponse(systemPrompt, userPromptTemplate, vars, modelConfig);
                
                // Save summary to database
                EntitySummary entitySummary = new EntitySummary();
                entitySummary.setEntity("ranked_books");
                entitySummary.setEntityId(book.getId());
                entitySummary.setSummary(summary);
                entitySummary.setModelConfiguration(modelConfig);
                entitySummary.setCreatedAt(LocalDateTime.now());
                
                summaryRepo.save(entitySummary);
                successCount++;
                
            } catch (Exception e) {
                failureCount++;
                System.err.println("Error processing book: " + book.getTitle() + " - " + e.getMessage());
            }
        }
        
        return new BatchSummaryResponse(successCount, failureCount);
    }
}