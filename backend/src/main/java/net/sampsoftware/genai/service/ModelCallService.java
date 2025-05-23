package net.sampsoftware.genai.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sampsoftware.genai.model.ModelCall;
import net.sampsoftware.genai.repository.ModelCallRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.concurrent.CompletableFuture;

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
}
