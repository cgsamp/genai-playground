package net.sampsoftware.genai.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sampsoftware.genai.controller.ModelCallsController.ModelCallStats;
import net.sampsoftware.genai.controller.ModelCallsController.ProviderPerformance;
import net.sampsoftware.genai.model.ModelCall;
import net.sampsoftware.genai.repository.ModelCallRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ModelCallService {

    private final ModelCallRepository modelCallRepository;

    @Async
    @Transactional
    public CompletableFuture<ModelCall> saveAsync(ModelCall modelCall) {
        try {
            ModelCall saved = modelCallRepository.save(modelCall);
            log.debug("Saved model call {} for provider {} config {}",
                    saved.getId(),
                    saved.getProvider(),
                    saved.getModelConfiguration() != null ? saved.getModelConfiguration().getId() : "none");
            return CompletableFuture.completedFuture(saved);
        } catch (Exception e) {
            log.error("Failed to save model call", e);
            return CompletableFuture.failedFuture(e);
        }
    }

    @Transactional(readOnly = true)
    public Page<ModelCall> getAllModelCalls(Pageable pageable) {
        return modelCallRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Optional<ModelCall> getModelCallById(Long id) {
        return modelCallRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<ModelCall> getCallsForConfiguration(Long configId) {
        return modelCallRepository.findByModelConfigurationIdOrderByCreatedAtDesc(configId);
    }

    @Transactional(readOnly = true)
    public List<ModelCall> getCallsForBatch(Long batchId) {
        return modelCallRepository.findByBatchIdOrderByCreatedAtDesc(batchId);
    }

    @Transactional(readOnly = true)
    public List<ModelCall> getCallsForProvider(String provider) {
        return modelCallRepository.findByProviderOrderByCreatedAtDesc(provider);
    }

    @Transactional(readOnly = true)
    public List<ModelCall> getFailedCalls() {
        return modelCallRepository.findBySuccessOrderByCreatedAtDesc(false);
    }

    @Transactional(readOnly = true)
    public List<ModelCall> getCallsSince(Instant since) {
        return modelCallRepository.findByCreatedAtAfterOrderByCreatedAtDesc(since);
    }

    @Transactional(readOnly = true)
    public List<ModelCall> getCallsInDateRange(Instant start, Instant end) {
        return modelCallRepository.findByDateRange(start, end);
    }

    @Transactional(readOnly = true)
    public Double getAverageResponseTime(Long configId) {
        return modelCallRepository.getAverageDurationByModelConfig(configId);
    }

    @Transactional(readOnly = true)
    public Double getAverageResponseTimeByProvider(String provider) {
        return modelCallRepository.getAverageDurationByProvider(provider);
    }

    @Transactional(readOnly = true)
    public Long getSuccessCount(String provider) {
        return modelCallRepository.countByProviderAndSuccess(provider, true);
    }

    @Transactional(readOnly = true)
    public Long getFailureCount(String provider) {
        return modelCallRepository.countByProviderAndSuccess(provider, false);
    }

    @Transactional(readOnly = true)
    public double getSuccessRate(String provider) {
        Long successCount = getSuccessCount(provider);
        Long failureCount = getFailureCount(provider);
        Long totalCount = successCount + failureCount;

        return totalCount > 0 ? (double) successCount / totalCount : 0.0;
    }

    @Transactional(readOnly = true)
    public ModelCallStats getModelCallStats() {
        long totalCalls = modelCallRepository.count();
        long successfulCalls = modelCallRepository.countBySuccess(true);
        long failedCalls = modelCallRepository.countBySuccess(false);
        double successRate = totalCalls > 0 ? (double) successfulCalls / totalCalls : 0.0;

        Double averageResponseTime = modelCallRepository.getOverallAverageResponseTime();

        Instant last24Hours = Instant.now().minus(24, ChronoUnit.HOURS);
        Instant last7Days = Instant.now().minus(7, ChronoUnit.DAYS);

        long callsLast24Hours = modelCallRepository.countByCreatedAtAfter(last24Hours);
        long callsLast7Days = modelCallRepository.countByCreatedAtAfter(last7Days);

        return new ModelCallStats(
                totalCalls,
                successfulCalls,
                failedCalls,
                successRate,
                averageResponseTime,
                callsLast24Hours,
                callsLast7Days
        );
    }

    @Transactional(readOnly = true)
    public List<ProviderPerformance> getPerformanceMetrics() {
        List<String> providers = modelCallRepository.findDistinctProviders();

        return providers.stream()
                .map(provider -> {
                    long totalCalls = modelCallRepository.countByProvider(provider);
                    long successfulCalls = modelCallRepository.countByProviderAndSuccess(provider, true);
                    long failedCalls = modelCallRepository.countByProviderAndSuccess(provider, false);
                    double successRate = totalCalls > 0 ? (double) successfulCalls / totalCalls : 0.0;

                    Double averageResponseTime = modelCallRepository.getAverageDurationByProvider(provider);
                    Double averageApiTime = modelCallRepository.getAverageApiDurationByProvider(provider);
                    Double averageProcessingTime = modelCallRepository.getAverageProcessingDurationByProvider(provider);

                    return new ProviderPerformance(
                            provider,
                            totalCalls,
                            successfulCalls,
                            failedCalls,
                            successRate,
                            averageResponseTime,
                            averageApiTime,
                            averageProcessingTime
                    );
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getCallCountsByProvider() {
        return modelCallRepository.countCallsByProvider()
                .stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> ((Number) row[1]).longValue()
                ));
    }

    @Transactional(readOnly = true)
    public Map<String, Double> getSuccessRatesByProvider() {
        return modelCallRepository.findDistinctProviders()
                .stream()
                .collect(Collectors.toMap(
                        provider -> provider,
                        this::getSuccessRate
                ));
    }
}
