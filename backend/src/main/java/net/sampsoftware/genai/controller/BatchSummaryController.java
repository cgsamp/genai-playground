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
import net.sampsoftware.genai.service.BookService;
import net.sampsoftware.genai.service.EntitySummaryService;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/batch-summary")
@RequiredArgsConstructor
public class BatchSummaryController {

    private final AIService aiService;
    private final BookService bookService;
    private final ModelConfigurationRepository modelConfigRepo;
    private final EntitySummaryService entitySummaryService;

    @PostMapping
    public void generateSummaries(@RequestBody BatchSummaryRequest request) {
        Optional<ModelConfiguration> modelConfigOpt = modelConfigRepo.findByIdWithModel(request.modelConfigurationId());
        if (modelConfigOpt.isEmpty()) {
            throw new RuntimeException("Model configuration not found");
        }
        ModelConfiguration modelConfig = modelConfigOpt.get();

        Long batchId = Long.valueOf(System.nanoTime());
        
        String systemPrompt = """
            Here is the Title, Author Name and Publishing Year of a book. Please search the web
            and produce a summary or blurb of the book. The summary should consist of one paragraph
            describing the genre, length and literary style of the book, as well as a summary of 
            the plot. It should not include any "spoilers" or normative comments about the book.
        """;

        for (RankedBook book :  bookService.findAll()) {
            String bookInfo = """
                {
                    "title": "%s",
                    "authorName": "%s",
                    "publishYear": "%s",
                    "blurb": "%s"
                }
            """.formatted(
                    book.getTitle(),
                    book.getAuthorName(),
                    book.getPublishYear(),
                    ""
            );

            String summary = aiService.generateResponse(
                systemPrompt, 
                bookInfo, 
                modelConfig
            );

            EntitySummary entitySummary = EntitySummary.builder()
                .modelConfigurationId(request.modelConfigurationId())
                .type("ranked_book")
                .entityId(book.getId())
                .summary(summary)
                .batchId(batchId)
            .build();

            entitySummaryService.save(entitySummary);
        }
    }
}