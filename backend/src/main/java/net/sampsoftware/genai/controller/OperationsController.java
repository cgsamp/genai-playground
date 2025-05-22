package net.sampsoftware.genai.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sampsoftware.genai.dto.*;
import net.sampsoftware.genai.service.OperationsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/operations")
@RequiredArgsConstructor
public class OperationsController {

    private final OperationsService operationsService;
    private final ObjectMapper objectMapper;

    @PostMapping("/execute")
    public ResponseEntity<OperationResponse> executeOperation(@RequestBody OperationRequest request) {
        log.debug("Executing operation: {} for collection: {}", request.operationId(), request.collectionId());

        try {
            switch (request.operationId()) {
                case "summarize_each":
                    return handleSummarizeEach(request);
                case "summarize_group":
                    return handleSummarizeGroup(request);
                case "generate_relationships":
                    return handleGenerateRelationships(request);
                default:
                    return ResponseEntity.badRequest().body(
                            new OperationResponse(
                                    request.operationId(),
                                    "error",
                                    "Unknown operation: " + request.operationId(),
                                    null
                            )
                    );
            }
        } catch (Exception e) {
            log.error("Error executing operation {}: {}", request.operationId(), e.getMessage(), e);
            return ResponseEntity.internalServerError().body(
                    new OperationResponse(
                            request.operationId(),
                            "error",
                            "Operation failed: " + e.getMessage(),
                            null
                    )
            );
        }
    }

    private ResponseEntity<OperationResponse> handleSummarizeEach(OperationRequest request) {
        if (request.collectionId() == null) {
            return ResponseEntity.badRequest().body(
                    new OperationResponse(request.operationId(), "error", "Collection ID is required", null)
            );
        }

        var result = operationsService.summarizeEachInCollection(
                request.modelConfigurationId(),
                request.collectionId()
        );

        ObjectNode resultNode = objectMapper.createObjectNode();
        resultNode.put("successCount", result.successCount());
        resultNode.put("failureCount", result.failureCount());
        resultNode.set("summaryIds", objectMapper.valueToTree(result.summaryIds()));

        return ResponseEntity.ok(new OperationResponse(
                request.operationId(),
                "success",
                String.format("Successfully created %d summaries", result.successCount()),
                resultNode
        ));
    }

    private ResponseEntity<OperationResponse> handleSummarizeGroup(OperationRequest request) {
        if (request.collectionId() == null) {
            return ResponseEntity.badRequest().body(
                    new OperationResponse(request.operationId(), "error", "Collection ID is required", null)
            );
        }

        var result = operationsService.summarizeCollection(
                request.modelConfigurationId(),
                request.collectionId()
        );

        ObjectNode resultNode = objectMapper.createObjectNode();
        resultNode.put("summaryId", result.summaryId());
        resultNode.put("collectionId", result.collectionId());
        resultNode.put("entityCount", result.entityCount());

        return ResponseEntity.ok(new OperationResponse(
                request.operationId(),
                "success",
                "Successfully created collection summary",
                resultNode
        ));
    }

    private ResponseEntity<OperationResponse> handleGenerateRelationships(OperationRequest request) {
        if (request.collectionId() == null) {
            return ResponseEntity.badRequest().body(
                    new OperationResponse(request.operationId(), "error", "Collection ID is required", null)
            );
        }

        // Extract relationship types from parameters
        var relationshipTypes = java.util.List.of("similar_themes", "influenced_by", "contrasts_with");
        if (request.parameters() != null && request.parameters().has("relationshipTypes")) {
            relationshipTypes = objectMapper.convertValue(
                    request.parameters().get("relationshipTypes"),
                    java.util.List.class
            );
        }

        var result = operationsService.generateRelationships(
                request.modelConfigurationId(),
                request.collectionId(),
                relationshipTypes
        );

        ObjectNode resultNode = objectMapper.createObjectNode();
        resultNode.put("relationshipCount", result.relationshipCount());
        resultNode.set("relationshipIds", objectMapper.valueToTree(result.relationshipIds()));
        resultNode.set("summaryIds", objectMapper.valueToTree(result.summaryIds()));
        resultNode.put("entityPairsProcessed", result.entityPairsProcessed());

        return ResponseEntity.ok(new OperationResponse(
                request.operationId(),
                "success",
                String.format("Successfully generated %d relationships", result.relationshipCount()),
                resultNode
        ));
    }
}
