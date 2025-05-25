package net.sampsoftware.genai.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sampsoftware.genai.dto.ModelCallRecord;
import net.sampsoftware.genai.model.ModelCall;
import net.sampsoftware.genai.service.ModelCallService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/model-calls")
@RequiredArgsConstructor
public class ModelCallsController {

    private final ModelCallService modelCallService;

    /**
     * Get all model calls with pagination
     */
    @GetMapping
    public ResponseEntity<Page<ModelCallRecord>> getAllModelCalls(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        log.debug("Getting model calls - page: {}, size: {}, sort: {} {}", page, size, sortBy, sortDir);

        Sort sort = Sort.by(sortDir.equalsIgnoreCase("desc") ?
                Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<ModelCall> modelCalls = modelCallService.getAllModelCalls(pageable);
        Page<ModelCallRecord> records = modelCalls.map(this::toRecord);

        return ResponseEntity.ok(records);
    }

    /**
     * Get a specific model call by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ModelCallRecord> getModelCall(@PathVariable Long id) {
        log.debug("Getting model call: {}", id);

        return modelCallService.getModelCallById(id)
                .map(this::toRecord)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get model calls by configuration ID
     */
    @GetMapping("/config/{configId}")
    public ResponseEntity<List<ModelCallRecord>> getCallsForConfiguration(@PathVariable Long configId) {
        log.debug("Getting model calls for config: {}", configId);

        List<ModelCall> calls = modelCallService.getCallsForConfiguration(configId);
        List<ModelCallRecord> records = calls.stream()
                .map(this::toRecord)
                .collect(Collectors.toList());

        return ResponseEntity.ok(records);
    }

    /**
     * Get model calls by batch ID
     */
    @GetMapping("/batch/{batchId}")
    public ResponseEntity<List<ModelCallRecord>> getCallsForBatch(@PathVariable Long batchId) {
        log.debug("Getting model calls for batch: {}", batchId);

        List<ModelCall> calls = modelCallService.getCallsForBatch(batchId);
        List<ModelCallRecord> records = calls.stream()
                .map(this::toRecord)
                .collect(Collectors.toList());

        return ResponseEntity.ok(records);
    }

    /**
     * Get model calls by provider
     */
    @GetMapping("/provider/{provider}")
    public ResponseEntity<List<ModelCallRecord>> getCallsForProvider(@PathVariable String provider) {
        log.debug("Getting model calls for provider: {}", provider);

        List<ModelCall> calls = modelCallService.getCallsForProvider(provider);
        List<ModelCallRecord> records = calls.stream()
                .map(this::toRecord)
                .collect(Collectors.toList());

        return ResponseEntity.ok(records);
    }

    /**
     * Get failed model calls
     */
    @GetMapping("/failed")
    public ResponseEntity<List<ModelCallRecord>> getFailedCalls() {
        log.debug("Getting failed model calls");

        List<ModelCall> calls = modelCallService.getFailedCalls();
        List<ModelCallRecord> records = calls.stream()
                .map(this::toRecord)
                .collect(Collectors.toList());

        return ResponseEntity.ok(records);
    }

    /**
     * Get recent model calls (last 24 hours)
     */
    @GetMapping("/recent")
    public ResponseEntity<List<ModelCallRecord>> getRecentCalls(
            @RequestParam(defaultValue = "24") int hours) {

        log.debug("Getting model calls from last {} hours", hours);

        Instant since = Instant.now().minus(hours, ChronoUnit.HOURS);
        List<ModelCall> calls = modelCallService.getCallsSince(since);
        List<ModelCallRecord> records = calls.stream()
                .map(this::toRecord)
                .collect(Collectors.toList());

        return ResponseEntity.ok(records);
    }

    /**
     * Get model call statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<ModelCallStats> getModelCallStats() {
        log.debug("Getting model call statistics");

        ModelCallStats stats = modelCallService.getModelCallStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * Get performance metrics by provider
     */
    @GetMapping("/performance")
    public ResponseEntity<List<ProviderPerformance>> getPerformanceMetrics() {
        log.debug("Getting performance metrics");

        List<ProviderPerformance> metrics = modelCallService.getPerformanceMetrics();
        return ResponseEntity.ok(metrics);
    }

    private ModelCallRecord toRecord(ModelCall modelCall) {
        return new ModelCallRecord(
                modelCall.getId(),
                modelCall.getModelConfiguration() != null ? modelCall.getModelConfiguration().getId() : null,
                modelCall.getModelConfigurationJson(),
                modelCall.getProvider(),
                modelCall.getPromptText(),
                modelCall.getPromptJson(),
                modelCall.getResponseText(),
                modelCall.getResponseJson(),
                modelCall.getTokenUsage(),
                modelCall.getChatOptions(),
                modelCall.getMetadata(),
                modelCall.getSuccess(),
                modelCall.getErrorMessage(),
                modelCall.getErrorClass(),
                modelCall.getErrorStacktrace(),
                modelCall.getStartTime(),
                modelCall.getEndTime(),
                modelCall.getDurationMs(),
                modelCall.getApiDurationMs(),
                modelCall.getProcessingDurationMs(),
                modelCall.getBatchId(),
                modelCall.getCreatedAt(),
                modelCall.getModelName(),
                modelCall.getModelProvider(),
                modelCall.getCorrelationId(),
                modelCall.getUserId(),
                modelCall.getRequestContext()
        );
    }

    // Response DTOs
    public record ModelCallStats(
            long totalCalls,
            long successfulCalls,
            long failedCalls,
            double successRate,
            Double averageResponseTime,
            long callsLast24Hours,
            long callsLast7Days
    ) {}

    public record ProviderPerformance(
            String provider,
            long totalCalls,
            long successfulCalls,
            long failedCalls,
            double successRate,
            Double averageResponseTime,
            Double averageApiTime,
            Double averageProcessingTime
    ) {}
}
