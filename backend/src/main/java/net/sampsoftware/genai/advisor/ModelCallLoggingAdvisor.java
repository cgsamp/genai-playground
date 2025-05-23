package net.sampsoftware.genai.advisor;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sampsoftware.genai.model.ModelCall;
import net.sampsoftware.genai.model.ModelConfiguration;
import net.sampsoftware.genai.service.ModelCallService;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.ChatOptions;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Arrays;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class ModelCallLoggingAdvisor {

    private final ObjectMapper objectMapper;
    private final ModelCallService modelCallService;

    @Around("execution(* org.springframework.ai.chat.client.ChatClient.*(..)) || " +
            "execution(* org.springframework.ai.chat.model.ChatModel.*(..))")
    public Object logModelCall(ProceedingJoinPoint joinPoint) throws Throwable {

        String correlationId = UUID.randomUUID().toString();
        Instant startTime = Instant.now();
        Instant apiStartTime = null;
        Instant apiEndTime = null;

        try {
            ModelCall.ModelCallBuilder callBuilder = ModelCall.builder()
                    .correlationId(correlationId)
                    .startTime(startTime)
                    .createdAt(Instant.now());

            Prompt prompt = extractPrompt(joinPoint.getArgs());
            ModelConfiguration modelConfig = extractModelConfiguration(joinPoint.getArgs());

            if (prompt != null) {
                callBuilder
                        .promptText(buildPromptText(prompt))
                        .promptJson(capturePromptJson(prompt))
                        .chatOptions(captureChatOptions(prompt.getOptions()));
            }

            if (modelConfig != null) {
                callBuilder
                        .modelConfiguration(modelConfig)
                        .modelConfigurationJson(captureModelConfiguration(modelConfig))
                        .modelName(modelConfig.getModel().getModelName())
                        .modelProvider(modelConfig.getModel().getModelProvider());
            }

            String provider = determineProvider(joinPoint.getTarget());
            callBuilder.provider(provider);

            String context = determineRequestContext();
            callBuilder.requestContext(context);

            // Execute the actual API call
            apiStartTime = Instant.now();
            Object result = joinPoint.proceed();
            apiEndTime = Instant.now();

            Instant endTime = Instant.now();

            if (result instanceof ChatResponse chatResponse) {
                callBuilder
                        .responseText(extractResponseText(chatResponse))
                        .responseJson(captureResponseJson(chatResponse))
                        .tokenUsage(captureTokenUsage(chatResponse))
                        .metadata(captureResponseMetadata(chatResponse));
            }

            long totalDuration = endTime.toEpochMilli() - startTime.toEpochMilli();
            long apiDuration = apiEndTime.toEpochMilli() - apiStartTime.toEpochMilli();
            long processingDuration = totalDuration - apiDuration;

            ModelCall modelCall = callBuilder
                    .endTime(endTime)
                    .durationMs(totalDuration)
                    .apiDurationMs(apiDuration)
                    .processingDurationMs(processingDuration)
                    .success(true)
                    .build();

            CompletableFuture.runAsync(() -> modelCallService.saveAsync(modelCall));

            log.debug("AI API call successful - correlation: {}, duration: {}ms, api: {}ms",
                    correlationId, totalDuration, apiDuration);

            return result;

        } catch (Exception e) {
            Instant endTime = Instant.now();
            long totalDuration = endTime.toEpochMilli() - startTime.toEpochMilli();
            long apiDuration = (apiStartTime != null && apiEndTime != null) ?
                    apiEndTime.toEpochMilli() - apiStartTime.toEpochMilli() : 0;

            ModelCall failedCall = ModelCall.builder()
                    .correlationId(correlationId)
                    .startTime(startTime)
                    .endTime(endTime)
                    .durationMs(totalDuration)
                    .apiDurationMs(apiDuration)
                    .processingDurationMs(totalDuration - apiDuration)
                    .success(false)
                    .errorMessage(e.getMessage())
                    .errorClass(e.getClass().getSimpleName())
                    .errorStacktrace(getStackTrace(e))
                    .provider(determineProvider(joinPoint.getTarget()))
                    .requestContext(determineRequestContext())
                    .build();

            CompletableFuture.runAsync(() -> modelCallService.saveAsync(failedCall));

            log.error("AI API call failed - correlation: {}, duration: {}ms: {}",
                    correlationId, totalDuration, e.getMessage());

            throw e;
        }
    }

    /**
     * Build human-readable prompt text from all message components
     */
    private String buildPromptText(Prompt prompt) {
        if (prompt == null || prompt.getInstructions() == null) {
            return null;
        }

        return prompt.getInstructions().stream()
                .map(message -> {
                    String messageType = message.getClass().getSimpleName().toUpperCase()
                            .replace("MESSAGE", "");
                    return messageType + ": " + message.getText();
                })
                .collect(Collectors.joining("\n"));
    }

    /**
     * Capture complete prompt structure - let Jackson handle the complexity
     */
    private JsonNode capturePromptJson(Prompt prompt) {
        try {
            ObjectNode promptNode = objectMapper.createObjectNode();

            // Messages - serialize each message safely
            if (prompt.getInstructions() != null) {
                promptNode.set("messages", objectMapper.valueToTree(
                        prompt.getInstructions().stream()
                                .map(this::captureMessage)
                                .collect(Collectors.toList())
                ));
            }

            // Options - let Jackson serialize the ChatOptions
            if (prompt.getOptions() != null) {
                promptNode.set("options", objectMapper.valueToTree(prompt.getOptions()));
            }

            // Add prompt-level metadata
            promptNode.put("messageCount", prompt.getInstructions() != null ? prompt.getInstructions().size() : 0);
            promptNode.put("hasOptions", prompt.getOptions() != null);

            return promptNode;
        } catch (Exception e) {
            log.warn("Failed to capture prompt JSON: {}", e.getMessage());
            ObjectNode errorNode = objectMapper.createObjectNode();
            errorNode.put("error", "capture_failed");
            errorNode.put("reason", e.getMessage());
            return errorNode;
        }
    }

    /**
     * Capture ChatOptions - trust Jackson to serialize provider-specific fields
     */
    private JsonNode captureChatOptions(ChatOptions options) {
        if (options == null) {
            return null;
        }

        try {
            // Jackson knows how to serialize Spring AI ChatOptions and its implementations
            JsonNode optionsJson = objectMapper.valueToTree(options);

            // Add metadata about the options type for debugging
            if (optionsJson.isObject()) {
                ((ObjectNode) optionsJson).put("_optionsType", options.getClass().getSimpleName());
            }

            return optionsJson;
        } catch (Exception e) {
            log.warn("Failed to capture chat options: {}", e.getMessage());
            ObjectNode errorNode = objectMapper.createObjectNode();
            errorNode.put("error", "capture_failed");
            errorNode.put("optionsType", options.getClass().getSimpleName());
            errorNode.put("reason", e.getMessage());
            return errorNode;
        }
    }

    /**
     * Capture complete ChatResponse - again, trust Jackson
     */
    private JsonNode captureResponseJson(ChatResponse response) {
        try {
            // Let Jackson serialize the entire response
            JsonNode responseJson = objectMapper.valueToTree(response);

            // Add response-level metadata
            if (responseJson.isObject()) {
                ObjectNode responseNode = (ObjectNode) responseJson;
                responseNode.put("_responseType", response.getClass().getSimpleName());
                responseNode.put("_resultCount", response.getResults() != null ? response.getResults().size() : 0);
            }

            return responseJson;
        } catch (Exception e) {
            log.warn("Failed to capture response JSON: {}", e.getMessage());
            ObjectNode errorNode = objectMapper.createObjectNode();
            errorNode.put("error", "capture_failed");
            errorNode.put("responseType", response.getClass().getSimpleName());
            errorNode.put("reason", e.getMessage());
            return errorNode;
        }
    }

    /**
     * Capture individual message safely
     */
    private JsonNode captureMessage(Message message) {
        try {
            ObjectNode messageNode = objectMapper.createObjectNode();
            messageNode.put("messageType", message.getClass().getSimpleName());
            messageNode.put("text", message.getText());

            // Try to capture additional message properties via Jackson
            JsonNode fullMessage = objectMapper.valueToTree(message);
            if (fullMessage.isObject()) {
                fullMessage.fields().forEachRemaining(entry -> {
                    if (!entry.getKey().equals("text")) { // Don't duplicate the text field
                        messageNode.set(entry.getKey(), entry.getValue());
                    }
                });
            }

            return messageNode;
        } catch (Exception e) {
            log.debug("Could not fully capture message: {}", e.getMessage());
            ObjectNode simpleMessage = objectMapper.createObjectNode();
            simpleMessage.put("messageType", message.getClass().getSimpleName());
            simpleMessage.put("text", message.getText());
            simpleMessage.put("_captureError", e.getMessage());
            return simpleMessage;
        }
    }

    private JsonNode captureTokenUsage(ChatResponse response) {
        try {
            if (response.getMetadata() != null && response.getMetadata().getUsage() != null) {
                return objectMapper.valueToTree(response.getMetadata().getUsage());
            }
        } catch (Exception e) {
            log.debug("Could not capture token usage: {}", e.getMessage());
        }
        return null;
    }

    private JsonNode captureResponseMetadata(ChatResponse response) {
        try {
            ObjectNode metadataNode = objectMapper.createObjectNode();

            if (response.getMetadata() != null) {
                metadataNode.set("responseMetadata", objectMapper.valueToTree(response.getMetadata()));
            }

            // Add our own metadata
            metadataNode.put("resultCount", response.getResults() != null ? response.getResults().size() : 0);
            metadataNode.put("captureTime", Instant.now().toString());
            metadataNode.put("responseClass", response.getClass().getSimpleName());

            return metadataNode;
        } catch (Exception e) {
            log.debug("Could not capture response metadata: {}", e.getMessage());
            ObjectNode errorNode = objectMapper.createObjectNode();
            errorNode.put("error", "metadata_capture_failed");
            errorNode.put("reason", e.getMessage());
            return errorNode;
        }
    }

    private JsonNode captureModelConfiguration(ModelConfiguration config) {
        try {
            ObjectNode configNode = objectMapper.createObjectNode();
            configNode.put("id", config.getId());
            configNode.put("comment", config.getComment());
            configNode.put("createdAt", config.getCreatedAt().toString());
            configNode.set("modelConfig", config.getModelConfig());
            configNode.put("modelName", config.getModel().getModelName());
            configNode.put("modelProvider", config.getModel().getModelProvider());
            configNode.put("modelApiUrl", config.getModel().getModelApiUrl());

            return configNode;
        } catch (Exception e) {
            log.warn("Could not capture model configuration: {}", e.getMessage());
            ObjectNode errorNode = objectMapper.createObjectNode();
            errorNode.put("error", "config_capture_failed");
            errorNode.put("configId", config != null ? config.getId() : null);
            return errorNode;
        }
    }

    private String extractResponseText(ChatResponse response) {
        try {
            if (response.getResults() != null && !response.getResults().isEmpty()) {
                return response.getResults().get(0).getOutput().getText();
            }
        } catch (Exception e) {
            log.debug("Could not extract response text: {}", e.getMessage());
        }
        return null;
    }

    private String determineProvider(Object target) {
        String className = target.getClass().getSimpleName().toLowerCase();
        if (className.contains("openai")) return "openai";
        if (className.contains("ollama")) return "ollama";
        if (className.contains("anthropic")) return "anthropic";
        if (className.contains("azure")) return "azure";
        return "unknown";
    }

    private String determineRequestContext() {
        StackTraceElement[] stack = Thread.currentThread().getStackTrace();
        for (StackTraceElement element : stack) {
            if (element.getClassName().contains("sampsoftware.genai.service")) {
                return element.getClassName().substring(element.getClassName().lastIndexOf('.') + 1);
            }
        }
        return "unknown";
    }

    private Prompt extractPrompt(Object[] args) {
        return Arrays.stream(args)
                .filter(Prompt.class::isInstance)
                .map(Prompt.class::cast)
                .findFirst()
                .orElse(null);
    }

    private ModelConfiguration extractModelConfiguration(Object[] args) {
        // This would need to be enhanced based on how you pass model configuration
        // Could be via thread local, request context, or method parameter
        return null;
    }

    private String getStackTrace(Exception e) {
        return Arrays.stream(e.getStackTrace())
                .limit(10)
                .map(StackTraceElement::toString)
                .collect(Collectors.joining("\n"));
    }
}
