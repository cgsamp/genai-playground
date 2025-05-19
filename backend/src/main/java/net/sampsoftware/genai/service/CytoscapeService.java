package net.sampsoftware.genai.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sampsoftware.genai.dto.CytoscapeDto;
import net.sampsoftware.genai.dto.EntitySummaryDto;
import net.sampsoftware.genai.model.RankedBook;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CytoscapeService {

    private final BookService bookService;
    private final EntitySummaryService entitySummaryService;

    /**
     * Generate a Cytoscape graph of books and their summaries
     */
    public CytoscapeDto getBooksSummariesGraph() {
        log.debug("Generating books-summaries graph");

        // Get all books and their summaries
        List<RankedBook> books = bookService.findAll();
        List<Long> bookIds = books.stream()
                .map(RankedBook::getId)
                .collect(Collectors.toList());

        log.debug("Found {} books", books.size());

        // Get summaries for these books
        List<EntitySummaryDto> summaries = entitySummaryService.findByTypeAndIds("ranked_book", bookIds);
        log.debug("Found {} summaries", summaries.size());

        List<CytoscapeDto.CytoscapeNode> nodes = new ArrayList<>();
        List<CytoscapeDto.CytoscapeEdge> edges = new ArrayList<>();

        // Add book nodes
        for (RankedBook book : books) {
            nodes.add(CytoscapeDto.CytoscapeNode.builder()
                    .data(CytoscapeDto.NodeData.builder()
                            .id("book-" + book.getId())
                            .label(book.getTitle())
                            .type("book")
                            .details(book)
                            .build())
                    .classes("book")
                    .build());
        }

        // Add summary nodes and connect to books
        for (EntitySummaryDto summary : summaries) {
            String summaryId = "summary-" + summary.id();
            String bookId = "book-" + summary.entityId();

            // Add summary node
            nodes.add(CytoscapeDto.CytoscapeNode.builder()
                    .data(CytoscapeDto.NodeData.builder()
                            .id(summaryId)
                            .label(summary.modelName() + " Summary")
                            .type("summary")
                            .details(summary)
                            .build())
                    .classes("summary")
                    .build());

            // Connect summary to book
            edges.add(CytoscapeDto.CytoscapeEdge.builder()
                    .data(CytoscapeDto.EdgeData.builder()
                            .id("edge-" + bookId + "-" + summaryId)
                            .source(bookId)
                            .target(summaryId)
                            .label("summarizes")
                            .build())
                    .build());
        }

        // Group summaries by model type
        summaries.stream()
                .collect(Collectors.groupingBy(s -> s.modelName()))
                .forEach((modelName, modelSummaries) -> {
                    if (modelSummaries.size() > 1) {
                        // Create a model node
                        String modelId = "model-" + modelName.replaceAll("\\s+", "-").toLowerCase();

                        nodes.add(CytoscapeDto.CytoscapeNode.builder()
                                .data(CytoscapeDto.NodeData.builder()
                                        .id(modelId)
                                        .label(modelName)
                                        .type("model")
                                        .build())
                                .classes("model")
                                .build());

                        // Connect summaries to model
                        for (EntitySummaryDto summary : modelSummaries) {
                            String summaryId = "summary-" + summary.id();

                            edges.add(CytoscapeDto.CytoscapeEdge.builder()
                                    .data(CytoscapeDto.EdgeData.builder()
                                            .id("edge-" + modelId + "-" + summaryId)
                                            .source(summaryId)
                                            .target(modelId)
                                            .label("generated-by")
                                            .build())
                                    .build());
                        }
                    }
                });

        CytoscapeDto.Elements elements = new CytoscapeDto.Elements(nodes, edges);
        return CytoscapeDto.builder().elements(elements).build();
    }
}
