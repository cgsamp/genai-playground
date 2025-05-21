package net.sampsoftware.genai.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sampsoftware.genai.model.Summary;
import net.sampsoftware.genai.model.ModelConfiguration;
import net.sampsoftware.genai.model.RankedBook;
import net.sampsoftware.genai.service.SummaryService;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
@RequiredArgsConstructor
public class AsyncBookProcessor {

    private final AIService aiService;
    private final SummaryService summaryService;

    @Async
    public CompletableFuture<Boolean> processBookAsync(
            RankedBook book,
            String systemPrompt,
            ModelConfiguration modelConfiguration,
            Long batchId
    ) {
        try {
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
            String summaryText = aiService.generateResponse(
                    systemPrompt,
                    bookInfo,
                    modelConfiguration
            );
            log.debug("Done {} in batch {} summary length {}", book.getAuthorName(), batchId, summaryText.length());
            log.trace("Summary: {}", summaryText);

            Summary summary = Summary.builder()
                    .modelConfiguration(modelConfiguration)
                    .entityType("ranked_book")
                    .entityId(book.getId())
                    .content(summaryText)
                    .batchId(batchId)
                    .build();

            summaryService.save(summary);
            return CompletableFuture.completedFuture(true);

        } catch (Exception e) {
            log.error("Error processing book {}: {}", book.getId(), e.getMessage(), e);
            return CompletableFuture.completedFuture(false);
        }
    }
}
