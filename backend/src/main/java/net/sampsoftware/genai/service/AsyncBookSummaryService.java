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
    private final AsyncBookProcessor asyncBookProcessor;

    public String generateResponse(
            String promptText,
            Long modelConfigurationId
    ) {
        Long batchId = System.nanoTime();

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
                .map(book -> asyncBookProcessor.processBookAsync(
                        book,
                        systemPrompt,
                        modelConfiguration,
                        batchId
                    )
                )
                .toList();

        long successCount = futures.stream()
                .map(CompletableFuture::join)
                .filter(result -> result)
                .count();
        log.debug("Completed {} books batchId {}", successCount, batchId);

        return String.format("Successfully processed %d of %d in batch %d",
            successCount, books.size(), batchId
        );
    }
}
