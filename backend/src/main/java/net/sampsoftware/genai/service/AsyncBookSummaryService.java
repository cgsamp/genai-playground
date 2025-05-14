package net.sampsoftware.genai.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sampsoftware.genai.model.EntitySummary;
import net.sampsoftware.genai.model.ModelConfiguration;
import net.sampsoftware.genai.model.RankedBook;
import net.sampsoftware.genai.repository.ModelConfigurationRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AsyncBookSummaryService {

    private final AIService aiService;
    private final EntitySummaryService entitySummaryService;
    private final ModelService modelService;
    private final BookService bookService;
    private final ModelConfigurationRepository modelConfigurationRepository;

    public String generateResponse(
            String promptText,
            Long modelConfigurationId
    ) {
        Long batchId = Long.valueOf(System.nanoTime());

        String systemPrompt = """
            Here is the Title, Author Name and Publishing Year of a book. Please search the web
            and produce a summary or blurb of the book. The summary should consist of one paragraph
            describing the genre, length and literary style of the book, as well as a summary of
            the plot. It should not include any "spoilers" or normative comments about the book.
        """;

        ModelConfiguration modelConfiguration =
                modelService.findConfigurationById(modelConfigurationId);

        List<RankedBook> books = bookService.findAll();
        log.debug("Processing through {} books batchId {}", books.size(), batchId);

        List<CompletableFuture<Boolean>> futures = books.stream()
                .map(book -> processBookAsync(
                        book,
                        systemPrompt,
                        modelConfiguration,
                        batchId
                    )
                )
                .collect(Collectors.toList());

        long successCount = futures.stream()
                .map(CompletableFuture::join)
                .filter(result -> result)
                .count();
        log.debug("Completed {} books batchId {}", successCount, batchId);

        return String.format("Successfully processed %d of %d in batch %d",
            successCount, books.size(), batchId
        );
    }

    @Async
    protected CompletableFuture<Boolean> processBookAsync(
            RankedBook book,
            String systemPrompt,
            ModelConfiguration modelConfiguration,
            Long batchId
    ) {
            String bookInfo = """
                {
                    "title": "%s",
                    "authorName": "%s",
                    "publishYear": "%s",
                    "blurb": "%s"
                }I
                """.formatted(
                book.getTitle(),
                book.getAuthorName(),
                book.getPublishYear(),
                ""
            );

            log.trace("System prompt: {}", systemPrompt);
            log.trace("BookInfo: {}", book);
            log.trace("Model configuration: {}", modelConfiguration);
            log.debug("Processing {} in batch {}",book.getAuthorName(), batchId);
            String summary = aiService.generateResponse(
                    systemPrompt,
                    bookInfo,
                    modelConfiguration
            );
            log.debug("Done {} in batch {} summary length {}", book.getAuthorName(), batchId, summary.length());
            log.trace("Summary: {}", summary);

            EntitySummary entitySummary = EntitySummary.builder()
                    .modelConfiguration(modelConfiguration)
                    .type("ranked_book")
                    .entityId(book.getId())
                    .summary(summary)
                    .batchId(batchId)
                    .build();

            entitySummaryService.save(entitySummary);
            return CompletableFuture.completedFuture(true);
    }
}
